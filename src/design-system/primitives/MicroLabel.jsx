/**
 * MicroLabel — uppercase mono label for instrument-panel readouts
 *
 * Spec: JetBrains Mono, 9px, weight 500, letter-spacing 1.8px, uppercase.
 * Default color is --color-primary; pass `color` to override (use any
 * CSS color value or a `var(--color-*)`).
 */

export default function MicroLabel({
  children,
  color = 'var(--color-primary)',
  className = '',
}) {
  return (
    <span
      className={'font-mono uppercase ' + className}
      style={{
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: '1.8px',
        color,
      }}
    >
      {children}
    </span>
  )
}
