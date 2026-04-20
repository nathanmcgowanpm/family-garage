/**
 * FleetChipStrip — horizontal vehicle switcher
 * ---------------------------------------------
 * Horizontal scroll of chip-style vehicle selectors.
 * Each chip shows: nickname + short descriptor (short year + mileage).
 * Plus a '+' chip at the end that triggers onAddVehicle.
 */

function Icon({ name, fill = false, style = {} }) {
  return <span className={`msym ${fill ? 'msym-fill' : ''}`} style={style}>{name}</span>
}

export default function FleetChipStrip({ vehicles, activeIndex, onSelect, onAddVehicle }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '0 4px 4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>

      {vehicles.map((v, i) => {
        const active = i === activeIndex
        const shortYear = v.name?.match(/^(\d{4})/)?.[1]?.slice(2) || ''
        const shortMiles = v.milesRaw ? Math.round(v.milesRaw / 1000) : null

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              flexShrink: 0,
              background: active ? 'var(--color-accent-bg)' : 'var(--color-bg-surface)',
              border: `1px solid ${active ? 'var(--color-border-accent)' : 'var(--color-border-subtle)'}`,
              borderRadius: 'var(--radius-full)',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: active ? 'var(--glow-accent-sm)' : 'none',
              transition: 'all var(--duration-base) var(--ease-out)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 13,
                color: active ? 'var(--color-accent)' : 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              {v.nickname || v.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                letterSpacing: '0.05em',
                fontVariantNumeric: 'tabular-nums',
                opacity: 0.8,
              }}
            >
              {shortYear && `'${shortYear}`}
              {shortYear && shortMiles && ' · '}
              {shortMiles && `${shortMiles}`}
            </span>
          </button>
        )
      })}

      {/* Add chip */}
      {onAddVehicle && (
        <button
          onClick={onAddVehicle}
          title="Add vehicle"
          style={{
            flexShrink: 0,
            background: 'var(--color-bg-surface)',
            border: '1px dashed var(--color-border-default)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            color: 'var(--color-text-tertiary)',
            transition: 'all var(--duration-base) var(--ease-out)',
          }}
        >
          <Icon name="add" style={{ fontSize: 16 }} />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Add
          </span>
        </button>
      )}
    </div>
  )
}
