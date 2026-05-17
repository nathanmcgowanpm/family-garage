/**
 * MonoNum — tabular-num display for any numeric value (odometer,
 * mileage, currency, dates).
 *
 * Spec: JetBrains Mono with `font-variant-numeric: tabular-nums` and
 * tight tracking (-0.3px). This is the "ledger feel" — non-negotiable
 * per DESIGN_SPEC.md notes #2.
 */

export default function MonoNum({
  children,
  size = 16,
  color = 'var(--color-text)',
  bold = true,
  className = '',
}) {
  return (
    <span
      className={'font-mono ' + className}
      style={{
        fontSize: size,
        fontWeight: bold ? 600 : 400,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.3px',
        color,
      }}
    >
      {children}
    </span>
  )
}
