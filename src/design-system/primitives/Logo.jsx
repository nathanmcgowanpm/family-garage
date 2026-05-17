/**
 * Logo — Family Garage wordmark + house glyph
 *
 * Spec: DESIGN_SPEC.md "Logo Mark".
 *   - SVG: house outline 1.6px stroke in primary, centered dot in primary
 *   - Wordmark: Space Grotesk 13px / 700 / 1.8px letter-spacing / uppercase
 *   - "FAMILY" in --color-text, "GARAGE" in --color-primary, 4px gap
 */

export default function Logo({ size = 22, className = '' }) {
  return (
    <div className={'inline-flex items-center gap-[9px] ' + className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 20V9l8-5 8 5v11"
          stroke="var(--color-primary)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="2.5" fill="var(--color-primary)" />
      </svg>
      <span
        className="font-display font-bold uppercase text-text"
        style={{ fontSize: 13, letterSpacing: '1.8px' }}
      >
        FAMILY<span className="text-primary ml-1">GARAGE</span>
      </span>
    </div>
  )
}
