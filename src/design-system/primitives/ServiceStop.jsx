/**
 * ServiceStop — single stop on the schedule timeline.
 *
 * Severity drives node + card color/glow. Card layout is consistent
 * across severities; only colors change.
 *
 * Props:
 *   predictedMileage — number, the projected odometer reading when due
 *   predictedDate    — preformatted string like "~JAN 2027"
 *   dueText          — preformatted string like "IN 800 MI" or
 *                      "OVERDUE BY 200 MI"
 *   serviceName      — display name
 *   intervalText     — e.g. "Every 5,000 mi"
 *   severity         — 'overdue' | 'due-soon' | 'next-up' | 'coming-up'
 *   isLast           — drops bottom padding on the final stop
 */

const SEVERITY = {
  overdue: {
    nodeBg:     'var(--color-danger)',
    nodeBorder: 'var(--color-danger)',
    nodeShadow: '0 0 16px var(--color-danger)',
    iconStroke: 'var(--color-ink)',
    cardBorder: 'rgba(255, 77, 109, 0.4)',
    accent:     'var(--color-danger)',
  },
  'due-soon': {
    nodeBg:     'var(--color-signal)',
    nodeBorder: 'var(--color-signal)',
    nodeShadow: '0 0 12px var(--color-signal)',
    iconStroke: 'var(--color-ink)',
    cardBorder: 'rgba(255, 225, 93, 0.4)',
    accent:     'var(--color-signal)',
  },
  'next-up': {
    nodeBg:     'var(--color-primary)',
    nodeBorder: 'var(--color-primary)',
    nodeShadow: '0 0 16px var(--color-primary)',
    iconStroke: 'var(--color-ink)',
    cardBorder: 'var(--color-primary-line)',
    accent:     'var(--color-primary)',
  },
  'coming-up': {
    nodeBg:     'var(--color-surface-2)',
    nodeBorder: 'var(--color-line-3)',
    nodeShadow: 'none',
    iconStroke: 'var(--color-text-dim)',
    cardBorder: 'var(--color-line)',
    accent:     'var(--color-text-mute)',
  },
}

export default function ServiceStop({
  predictedMileage,
  predictedDate,
  dueText,
  serviceName,
  intervalText,
  severity = 'coming-up',
  isLast = false,
}) {
  const s = SEVERITY[severity] ?? SEVERITY['coming-up']

  return (
    <div
      className="relative flex"
      style={{
        gap: 16,
        paddingBottom: isLast ? 0 : 18,
        zIndex: 1,
      }}
    >
      {/* Node */}
      <div style={{ flexShrink: 0 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 38,
            height: 38,
            borderRadius: 38,
            background: s.nodeBg,
            border: `2px solid ${s.nodeBorder}`,
            boxShadow: s.nodeShadow,
          }}
          aria-hidden="true"
        >
          {/* Clock glyph */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="5"
              stroke={s.iconStroke}
              strokeWidth="1.4"
            />
            <path
              d="M8 5v3l2 1.5"
              stroke={s.iconStroke}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card */}
      <div
        className="flex-1 min-w-0"
        style={{
          padding: 14,
          borderRadius: 12,
          background: 'var(--color-surface)',
          border: `1px solid ${s.cardBorder}`,
        }}
      >
        {/* Top row: mileage marker (left) + predicted date (right) */}
        <div className="flex items-baseline justify-between" style={{ gap: 8 }}>
          <span
            className="font-mono uppercase tabular-nums"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '1.4px',
              color: s.accent,
            }}
          >
            @ {Number.isFinite(predictedMileage) ? predictedMileage.toLocaleString() : '—'} MI
          </span>
          {predictedDate && (
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 9,
                letterSpacing: '1.2px',
                color: 'var(--color-text-mute)',
              }}
            >
              {predictedDate}
            </span>
          )}
        </div>

        {/* Service name */}
        <div
          className="font-display"
          style={{
            marginTop: 6,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.2px',
            color: 'var(--color-text)',
          }}
        >
          {serviceName}
        </div>

        {/* Bottom row: interval (left) + dueText (right) */}
        <div
          className="flex items-center justify-between"
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid var(--color-line)',
            gap: 8,
          }}
        >
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 9,
              letterSpacing: '1.2px',
              color: 'var(--color-text-dim)',
            }}
          >
            {intervalText}
          </span>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '1.2px',
              color: s.accent,
            }}
          >
            {dueText}
          </span>
        </div>
      </div>
    </div>
  )
}
