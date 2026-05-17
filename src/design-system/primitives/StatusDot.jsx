/**
 * StatusDot — small filled circle with a colored glow.
 *
 * Used for "SYNCED", "DETECTING", health states, etc. The glow is the
 * signature touch — flat circles look wrong.
 *
 * variants:
 *   go      → --color-go      (#6DFFB0) — confirmed / synced / success
 *   signal  → --color-signal  (#FFE15D) — warning / due soon / review
 *   alert   → --color-danger  (#FF4D6D) — overdue / recall / urgent
 *   primary → --color-primary (#3DD6FF) — generic accent / live
 */

const VARIANT_COLOR = {
  go:      'var(--color-go)',
  signal:  'var(--color-signal)',
  alert:   'var(--color-danger)',
  primary: 'var(--color-primary)',
}

export default function StatusDot({
  variant = 'primary',
  size = 6,
  className = '',
}) {
  const color = VARIANT_COLOR[variant] ?? VARIANT_COLOR.primary
  return (
    <span
      aria-hidden="true"
      className={'inline-block rounded-pill ' + className}
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
  )
}
