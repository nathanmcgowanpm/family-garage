/**
 * OdometerCard — large readout card for the top of the Schedule screen.
 *
 * Layout: flex row, space-between, baseline-aligned.
 *   Left: micro "Currently at" label, 34px mono-tabular odometer,
 *         "MILES · {vehicleName}" sub-line.
 *   Right: if dueSoonCount > 0, a tinted-primary badge showing the count.
 *
 * Container: surface bg, 1px line-2 border, 18px radius.
 */

import MicroLabel from './MicroLabel.jsx'

export default function OdometerCard({
  currentMileage = 0,
  vehicleName = '',
  attentionCount = 0,
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '20px 22px',
        borderRadius: 18,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-line-2)',
        gap: 16,
      }}
    >
      {/* Left: label + odometer + sub */}
      <div style={{ minWidth: 0 }}>
        <MicroLabel color="var(--color-text-mute)">Currently at</MicroLabel>
        <div
          className="font-display tabular-nums"
          style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: '-1px',
            lineHeight: 1.05,
            color: 'var(--color-text)',
            marginTop: 4,
          }}
        >
          {currentMileage.toLocaleString()}
        </div>
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: '1.4px',
            color: 'var(--color-text-dim)',
            marginTop: 4,
          }}
        >
          MILES{vehicleName ? ` · ${vehicleName}` : ''}
        </div>
      </div>

      {/* Right: due-soon badge (hidden when 0) */}
      {attentionCount > 0 && (
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            background: 'var(--color-primary-dim)',
            border: '1px solid var(--color-primary-line)',
            minWidth: 80,
          }}
        >
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 8,
              letterSpacing: '1.4px',
              fontWeight: 600,
              color: 'var(--color-primary)',
            }}
          >
            TO REVIEW
          </div>
          <div
            className="font-mono tabular-nums"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--color-primary)',
              lineHeight: 1.1,
              marginTop: 2,
            }}
          >
            {attentionCount}
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '1px',
              color: 'var(--color-primary)',
              opacity: 0.85,
            }}
          >
            {attentionCount === 1 ? 'item' : 'items'}
          </div>
        </div>
      )}
    </div>
  )
}
