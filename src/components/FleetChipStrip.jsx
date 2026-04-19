/**
 * FleetChipStrip
 * --------------
 * The "fleet-first" horizontal vehicle selector that lives at the top
 * of the home screen. Each chip shows a nickname, model year, and a
 * tiny health glyph (the small number = health score out of 100).
 *
 * Fleet-first concept: Family Garage is plural — this strip is always
 * present so the user can swap between household vehicles with one tap.
 *
 * Props:
 *   vehicles: Array<{
 *     id: string,
 *     nickname: string,      // e.g. "Highlander"
 *     year: string,          // e.g. "'21"
 *     healthScore: number,   // 0-100
 *   }>
 *   activeId: string
 *   onSelect: (id: string) => void
 */

export default function FleetChipStrip({ vehicles, activeId, onSelect }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-none"
      style={{ scrollbarWidth: 'none' }}
      role="tablist"
      aria-label="Select vehicle"
    >
      {vehicles.map((v) => {
        const isActive = v.id === activeId;
        return (
          <button
            key={v.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(v.id)}
            className={`
              flex-shrink-0 flex items-baseline gap-2
              px-4 py-2.5 rounded-md border
              transition-all duration-200 ease-out-custom
              ${
                isActive
                  ? 'bg-accent-bg border-accent text-text-primary shadow-glow-sm'
                  : 'bg-bg-surface border-border-subtle text-text-secondary hover:border-border hover:text-text-primary'
              }
            `}
          >
            <span
              className={`
                font-display font-semibold text-base
                ${isActive ? 'text-accent' : ''}
              `}
            >
              {v.nickname}
            </span>
            <span className="font-mono text-xs text-text-tertiary tabular-nums">
              {v.year} · {v.healthScore}
            </span>
          </button>
        );
      })}
    </div>
  );
}
