/**
 * MileageTape — auto-scaling maintenance horizon tape.
 *
 * Model B: the tape derives its own visible mileage range from the
 * markers passed in, then positions NOW at its true proportional
 * location within that range. This means:
 *
 *   - A vehicle with only far-future milestones gets a range that
 *     actually shows them, rather than an empty 5k forward window.
 *   - A vehicle with past-due recurring services shows those behind NOW.
 *   - NOW is never pinned to the left — it sits at its real position.
 *
 * Marker shapes:
 *   Precise  { mileage, label, warn, approximate: false }
 *            Recurring predictions with real history. warn=true → amber.
 *   Approx   { mileage, label, warn, approximate: true }
 *            Milestone advisories plotted at window center (dueAroundMiles).
 *            Rendered with tilde label, amber color, lower opacity —
 *            visually distinct from precise predictions.
 *
 * Range computation (see computeRange):
 *   pad each end by max(10% of natural span, 2,000 mi); enforce 10k minimum.
 *   Empty-marker fallback: forward-biased 10k window (NOW at ~25%).
 *
 * Label collision:
 *   Bidirectional walk from tNow — right-of-NOW left→right, left-of-NOW
 *   right→left. Precise markers beat approximate; amber beats neutral.
 *   The minimum gap between visible labels is max(1,500 mi, 8% of span).
 */

const TICK_COUNT = 40
const RAIL_HEIGHT = 36
const MAJOR_HEIGHT = 18
const MINOR_HEIGHT = 10

// Range constants
const MIN_SPAN   = 10_000   // minimum total range, miles
const PAD_RATIO  = 0.10     // pad each end by 10% of natural span
const MIN_PAD    = 2_000    // …but never less than 2,000 mi per end

// ─── Range computation ────────────────────────────────────────────────

/**
 * Given currentMileage and an array of marker mileages, return
 * { rangeStart, rangeEnd } for the tape's visible window.
 *
 * Empty-marker fallback: NOW sits at 25% with 7,500 mi looking ahead.
 */
function computeRange(currentMileage, markerMileages) {
  if (markerMileages.length === 0) {
    return {
      rangeStart: Math.max(0, currentMileage - 2_500),
      rangeEnd: currentMileage + 7_500,
    }
  }
  const all = [currentMileage, ...markerMileages]
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const pad = Math.max((hi - lo) * PAD_RATIO, MIN_PAD)
  let start = lo - pad
  let end   = hi + pad
  // Enforce minimum span, expanded symmetrically
  const span = end - start
  if (span < MIN_SPAN) {
    const extra = (MIN_SPAN - span) / 2
    start -= extra
    end   += extra
  }
  return { rangeStart: Math.max(0, start), rangeEnd: end }
}

// ─── Label collision helpers ──────────────────────────────────────────

/**
 * Urgency for collision resolution.
 * Precise markers always beat approximate ones.
 * Within each tier: amber (warn) > neutral.
 */
function markerUrgency(m) {
  if (!m.approximate) return m.warn ? 3 : 2  // precise: amber=3, neutral=2
  return m.warn ? 1 : 0                      // approx:  amber=1, neutral=0
}

/**
 * Bidirectional collision resolver.
 *
 * NOW's position (tNow) is treated as an immovable anchor.
 * Markers to the RIGHT of NOW are walked left→right; if a new marker
 * is within tGap of the previous winner it is suppressed (unless it
 * outranks the previous winner, in which case the previous is evicted).
 * Markers to the LEFT of NOW are walked right→left by the same logic.
 * NOW always wins any collision — labels that land within tGap of tNow
 * are dropped regardless of their urgency.
 *
 * Returns a Set of indices into `sorted` whose labels should be shown.
 */
function pickVisibleLabels(sorted, tGap, tNow) {
  const visible = new Set()

  // Right of NOW, left → right
  let lastT = tNow, lastIdx = -1   // lastIdx=-1 means NOW holds the slot
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].t <= tNow) continue
    const gap = sorted[i].t - lastT
    if (gap < tGap) {
      if (lastIdx < 0) continue  // NOW wins; skip this marker
      if (markerUrgency(sorted[i]) > markerUrgency(sorted[lastIdx])) {
        visible.delete(lastIdx)
        visible.add(i)
        lastT = sorted[i].t
        lastIdx = i
      }
      // else: incoming marker loses; previous holds
    } else {
      visible.add(i)
      lastT = sorted[i].t
      lastIdx = i
    }
  }

  // Left of NOW, right → left
  lastT = tNow; lastIdx = -1
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].t >= tNow) continue
    const gap = lastT - sorted[i].t
    if (gap < tGap) {
      if (lastIdx < 0) continue  // NOW wins; skip this marker
      if (markerUrgency(sorted[i]) > markerUrgency(sorted[lastIdx])) {
        visible.delete(lastIdx)
        visible.add(i)
        lastT = sorted[i].t
        lastIdx = i
      }
    } else {
      visible.add(i)
      lastT = sorted[i].t
      lastIdx = i
    }
  }

  return visible
}

// ─── Component ────────────────────────────────────────────────────────

export default function MileageTape({
  currentMileage = 0,
  markers = [],
}) {
  const isEmpty = markers.length === 0

  // Auto-scale the visible range
  const { rangeStart, rangeEnd } = computeRange(
    currentMileage,
    markers.map((m) => m.mileage),
  )
  const totalSpan = rangeEnd - rangeStart

  // t-position of NOW within [0, 1]
  const tNow = (currentMileage - rangeStart) / totalSpan

  // Project all markers into t-space, sort by position
  const placed = markers
    .map((m) => ({
      ...m,
      t: Math.min(1, Math.max(0, (m.mileage - rangeStart) / totalSpan)),
    }))
    .sort((a, b) => a.t - b.t)

  // Tick geometry — evenly spaced, every 5th is major
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const isMajor = i % 5 === 0
    return {
      x: i / (TICK_COUNT - 1),
      height: isMajor ? MAJOR_HEIGHT : MINOR_HEIGHT,
      color: isMajor ? 'var(--color-line-3)' : 'var(--color-line-2)',
    }
  })

  // Label collision — minimum gap: 1,500 mi absolute or 8% of span, whichever is larger
  const tGap = Math.max(1_500 / totalSpan, 0.08)

  // ── NOW exclusion pre-pass ────────────────────────────────────────────
  // Any marker whose t-position is within tGap of tNow has its label
  // suppressed unconditionally — NOW always wins. Their ticks still render.
  // This runs BEFORE the general collision walk so excluded markers don't
  // consume "slots" and can't pull distant markers into the cluster.
  const nowExcluded = new Set(
    placed.flatMap((m, i) => (Math.abs(m.t - tNow) < tGap ? [i] : []))
  )

  // ── General collision walk — non-excluded markers only ───────────────
  // Filter to markers outside the NOW zone, run the existing bidirectional
  // walk, then remap filtered indices back to placed indices.
  const nonExcluded = placed
    .map((m, i) => ({ m, origIdx: i }))
    .filter(({ origIdx }) => !nowExcluded.has(origIdx))

  const filteredVisible = pickVisibleLabels(
    nonExcluded.map(({ m }) => m),
    tGap,
    tNow,
  )

  const visibleLabels = new Set(
    [...filteredVisible].map((fi) => nonExcluded[fi].origIdx)
  )

  // Anchor direction for the NOW label
  const nowAlign =
    tNow > 0.75 ? 'right' : tNow < 0.25 ? 'left' : 'center'

  return (
    <div
      className="w-full relative"
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-line-2)',
        borderBottom: '1px solid var(--color-line-2)',
        padding: '16px 0 22px',
      }}
    >
      {/* ── Rail (ticks + markers) ─────────────────────────────── */}
      <div
        className="relative"
        style={{ height: RAIL_HEIGHT, margin: '0 20px' }}
      >
        {/* Tick marks anchored to the baseline */}
        {ticks.map((tick, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="absolute"
            style={{
              left: `${tick.x * 100}%`,
              bottom: 0,
              transform: 'translateX(-50%)',
              width: 1,
              height: tick.height,
              background: tick.color,
            }}
          />
        ))}

        {/* NOW bar — 3 px, glowing primary, at its computed position */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: `${tNow * 100}%`,
            bottom: 0,
            // Center the 3px bar on tNow rather than left-aligning it
            transform: 'translateX(-1.5px)',
            width: 3,
            height: RAIL_HEIGHT,
            background: 'var(--color-primary)',
            filter: 'drop-shadow(0 0 6px #3DD6FF)',
          }}
        />

        {/* Service markers */}
        {placed.map((m, i) => {
          // Approximate milestone advisories: amber + lower opacity to signal "rough position"
          // Precise recurring: primary (or signal if warn)
          const color = m.warn
            ? 'var(--color-signal)'
            : 'var(--color-primary)'
          const opacity = m.approximate ? 0.40 : 0.60
          return (
            <div
              key={`m-${i}`}
              aria-hidden="true"
              className="absolute"
              style={{
                left: `${m.t * 100}%`,
                bottom: 0,
                transform: 'translateX(-50%)',
                width: 2,
                height: RAIL_HEIGHT,
                background: color,
                opacity,
              }}
            />
          )
        })}
      </div>

      {/* ── Labels row ─────────────────────────────────────────── */}
      <div className="relative" style={{ margin: '10px 20px 0', height: 26 }}>

        {/* NOW label — positioned at tNow, direction based on proximity to edges */}
        <div
          className="absolute"
          style={{
            left: `${tNow * 100}%`,
            top: 0,
            transform:
              nowAlign === 'right'  ? 'translateX(-100%)' :
              nowAlign === 'left'   ? 'translateX(-2px)'  :
                                      'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            textAlign: nowAlign === 'right' ? 'right' : 'left',
          }}
        >
          <span
            className="font-mono tabular-nums"
            style={{
              fontSize: 9,
              color: 'var(--color-primary)',
              fontWeight: 600,
              letterSpacing: 0,
            }}
          >
            {currentMileage.toLocaleString()}
          </span>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 8,
              letterSpacing: '1.2px',
              color: 'var(--color-text-mute)',
            }}
          >
            NOW
          </span>
        </div>

        {/* Empty-state caption — only when no markers were passed */}
        {isEmpty && (
          <span
            aria-label="Log services to see your horizon"
            className="font-mono uppercase absolute"
            style={{
              top: 6,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 8,
              letterSpacing: '1.4px',
              color: 'var(--color-text-mute)',
              pointerEvents: 'none',
            }}
          >
            Log services to see your horizon
          </span>
        )}

        {/* Service labels — collision-filtered, anchored left or right by edge proximity */}
        {placed.map((m, i) => {
          if (!visibleLabels.has(i)) return null

          // Approx amber: signal; approx neutral: text-mute; precise: text (or signal if warn)
          const labelColor = m.approximate
            ? (m.warn ? 'var(--color-signal)' : 'var(--color-text-mute)')
            : (m.warn ? 'var(--color-signal)' : 'var(--color-text)')

          // Right-anchor labels in the rightmost quarter to avoid overflow
          const isRightSide = m.t > 0.75

          return (
            <div
              key={`label-${i}`}
              className="absolute"
              style={{
                left: `${m.t * 100}%`,
                top: 0,
                transform: isRightSide ? 'translateX(-100%)' : 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                textAlign: isRightSide ? 'right' : 'left',
                minWidth: 0,
                maxWidth: 110,
              }}
            >
              {/* Mileage line — tilde prefix for approximate markers */}
              <span
                className="font-mono tabular-nums"
                style={{ fontSize: 9, color: labelColor, fontWeight: 600 }}
              >
                {m.approximate && '~'}{m.mileage.toLocaleString()}
              </span>
              {/* Service name — truncated, always muted so it doesn't compete with mileage */}
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: 8,
                  letterSpacing: '1.2px',
                  color: 'var(--color-text-mute)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={m.label}
              >
                {m.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
