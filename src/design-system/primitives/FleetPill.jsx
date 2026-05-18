/**
 * FleetPill / AddFleetPill — chips in the home-screen fleet strip.
 *
 * Per DESIGN_SPEC.md:
 *   - Active:   bg primary-dim, border primary-line, name in primary
 *   - Inactive: bg surface,     border line,         name in text
 *   - Sub-line: mono 9px uppercase letter-spacing 1.2 dim
 *   - Radius 14px, padding 10px 14px, min-width 120px, flex-shrink 0
 *
 * The `mileageThousands` prop is the rounded thousands portion of the
 * odometer (e.g. 84_973 → 85). Formatted as "'YR · KK".
 */

function FleetPill({
  name,
  year,
  mileageThousands,
  active = false,
  onClick,
}) {
  const yearShort = year ? `'${String(year).slice(-2)}` : ''
  const milesK = Number.isFinite(mileageThousands) ? `${mileageThousands}K` : ''
  const subParts = [yearShort, milesK].filter(Boolean)
  const sub = subParts.join(' · ')

  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 text-left transition-colors"
      style={{
        minWidth: 120,
        padding: '10px 14px',
        borderRadius: 14,
        background: active ? 'var(--color-primary-dim)' : 'var(--color-surface)',
        border: `1px solid ${active ? 'var(--color-primary-line)' : 'var(--color-line)'}`,
      }}
    >
      <div
        className="font-display font-bold"
        style={{
          fontSize: 14,
          letterSpacing: '-0.2px',
          color: active ? 'var(--color-primary)' : 'var(--color-text)',
        }}
      >
        {name}
      </div>
      {sub && (
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: '1.2px',
            color: 'var(--color-text-dim)',
            marginTop: 2,
          }}
        >
          {sub}
        </div>
      )}
    </button>
  )
}

function AddFleetPill({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add vehicle"
      className="shrink-0 inline-flex flex-col items-center justify-center transition-colors"
      style={{
        width: 78,
        height: 62,
        borderRadius: 14,
        background: 'transparent',
        border: `1px dashed var(--color-line-3)`,
        color: 'var(--color-text-dim)',
        gap: 4,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path
          d="M7 2v10M2 7h10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="font-mono uppercase"
        style={{
          fontSize: 8,
          letterSpacing: '1.4px',
          color: 'var(--color-text-mute)',
        }}
      >
        ADD
      </span>
    </button>
  )
}

export { AddFleetPill }
export default FleetPill
