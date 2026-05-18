/**
 * MileageTape — horizontal odometer ruler with service stops plotted ahead.
 *
 * Visual structure (see DESIGN_SPEC.md "Mileage tape"):
 *   - 40 evenly-spaced ticks; every 5th is "major" (taller, --color-line-3)
 *   - NOW marker at left edge: 3px primary bar with cyan glow
 *   - Each upcoming service marker positioned at
 *     (mileage - currentMileage) / horizonMiles, clipped to [0,1]
 *   - Below the rail, labels show mileage + service name
 *
 * Container chrome: full-width, surface bg, top/bottom dividers.
 */

const TICK_COUNT = 40
const RAIL_HEIGHT = 36
const MAJOR_HEIGHT = 18
const MINOR_HEIGHT = 10

// Minimum horizontal separation between visible labels, in t-space (0..1
// proportion of the tape). Two labels closer than this would visually
// overlap. We take the max of "at least 300 mi" (per spec) and a fixed
// 8% of the rail width so labels stay readable on wider horizons too.
function computeLabelGap(horizonMiles) {
  return Math.max(300 / horizonMiles, 0.08)
}

// Per-marker urgency for collision resolution. Higher wins; the loser's
// label is dropped (its tick mark still renders).
function urgency(m) {
  return m.warn ? 2 : 1
}

/**
 * From a list of t-sorted markers, decide which should display labels.
 * Walks left-to-right; the NOW anchor at t=0 is always claimed, so any
 * marker too close to NOW is suppressed. Marker-vs-marker collisions
 * keep the more urgent one. Returns a Set of indices.
 */
function pickVisibleLabels(placed, tGap) {
  const visible = new Set()
  let lastT = 0
  let lastIdx = -1  // -1 means lastT belongs to the NOW anchor

  for (let i = 0; i < placed.length; i++) {
    const m = placed[i]
    if (m.t - lastT < tGap) {
      // Collision with previous label
      if (lastIdx < 0) continue  // NOW always wins
      const prev = placed[lastIdx]
      if (urgency(m) > urgency(prev)) {
        visible.delete(lastIdx)
        visible.add(i)
        lastT = m.t
        lastIdx = i
      }
      // else: this label is suppressed; previous holds the slot
    } else {
      visible.add(i)
      lastT = m.t
      lastIdx = i
    }
  }
  return visible
}

export default function MileageTape({
  currentMileage = 0,
  markers = [],
  horizonMiles = 5000,
}) {
  // Build tick column data once
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const isMajor = i % 5 === 0
    return {
      x: i / (TICK_COUNT - 1),
      height: isMajor ? MAJOR_HEIGHT : MINOR_HEIGHT,
      color: isMajor ? 'var(--color-line-3)' : 'var(--color-line-2)',
    }
  })

  // Project markers into 0..1 along the horizon
  const placed = markers
    .map((m) => {
      const t = (m.mileage - currentMileage) / horizonMiles
      return {
        ...m,
        t: Math.max(0, Math.min(1, t)),
        offHorizon: t < 0 || t > 1,
      }
    })
    .sort((a, b) => a.t - b.t)

  // Suppress labels that would visually collide. Ticks still render.
  const visibleLabels = pickVisibleLabels(placed, computeLabelGap(horizonMiles))

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
      {/* Rail (ticks + markers, horizontally padded so the leftmost
         marker is not flush with the edge) */}
      <div
        className="relative"
        style={{
          height: RAIL_HEIGHT,
          margin: '0 20px',
        }}
      >
        {/* Tick marks (anchored to baseline) */}
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

        {/* NOW marker — full height, glowing primary */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: 0,
            bottom: 0,
            width: 3,
            height: RAIL_HEIGHT,
            background: 'var(--color-primary)',
            filter: 'drop-shadow(0 0 6px #3DD6FF)',
          }}
        />

        {/* Service markers */}
        {placed.map((m, i) => {
          const color = m.warn ? 'var(--color-signal)' : 'var(--color-primary)'
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
                opacity: 0.6,
              }}
            />
          )
        })}
      </div>

      {/* Labels row */}
      <div className="relative" style={{ margin: '10px 20px 0', height: 26 }}>
        {/* NOW label, pinned to left */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            transform: 'translateX(-2px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <span
            className="font-mono tabular-nums"
            style={{
              fontSize: 9,
              color: 'var(--color-primary)',
              fontWeight: 600,
              letterSpacing: '0px',
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

        {/* Service marker labels — placed at proportional offsets.
           Right-anchor labels in the rightmost quarter so they don't
           overflow the container. Labels that would collide with NOW
           or with an earlier (more urgent) label are suppressed —
           their tick mark on the rail above still shows. */}
        {placed.map((m, i) => {
          if (!visibleLabels.has(i)) return null
          const labelColor = m.warn
            ? 'var(--color-signal)'
            : 'var(--color-text)'
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
              <span
                className="font-mono tabular-nums"
                style={{
                  fontSize: 9,
                  color: labelColor,
                  fontWeight: 600,
                }}
              >
                {m.mileage.toLocaleString()}
              </span>
              <span
                className="font-mono uppercase whitespace-nowrap overflow-hidden text-ellipsis"
                style={{
                  fontSize: 8,
                  letterSpacing: '1.2px',
                  color: 'var(--color-text-mute)',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
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
