/**
 * DashboardScreen — Design refresh
 * ---------------------------------
 * Migrated from inline orange hex values to CSS custom properties (tokens).
 * New structure:
 *   1. FleetChipStrip (horizontal vehicle switcher) — replaces the "Switch/Add" buttons
 *   2. Odometer hero — tabular mono numeric readout
 *   3. Conditional recall alert
 *   4. MileageTape — replaces the bento-grid cards
 *   5. Stats row (empty-state-aware)
 *   6. Recent Activity or empty state
 *   7. Import CTA
 *
 * Drop this into your App.jsx, replacing the existing DashboardScreen function.
 * You'll also need to import FleetChipStrip and MileageTape at the top.
 */

import FleetChipStrip from './components/FleetChipStrip'
import MileageTape from './components/MileageTape'

// NOTE: Icon, BtnPrimary, slab, stitle are still used from the parent file.
// This file assumes they're in scope (keep them in App.jsx as-is).

function DashboardScreen({
  vehicles,
  activeVehicle,
  onSwitchVehicle,   // kept for backward compat, no longer used
  onNavigate,
  serviceRecords = [],
}) {
  const v = vehicles[activeVehicle]
  const hasRecords = serviceRecords.length > 0

  // Adapt vehicles to FleetChipStrip's expected shape
  const fleetVehicles = vehicles.map((vehicle, i) => ({
    id: String(i),
    nickname: extractNickname(vehicle.name),
    year: extractYear(vehicle.name),
    healthScore: 85, // TODO: compute from service history
  }))

  // Mock upcoming services for the MileageTape — wire to real data later
  const upcomingServices = [
    { id: 'oil',   label: 'Oil',         mileage: v.milesRaw + 800,   priority: 'normal' },
    { id: 'rot',   label: 'Rotate',      mileage: v.milesRaw + 2500,  priority: 'warning' },
    { id: 'bf',    label: 'Brake fluid', mileage: v.milesRaw + 3800,  priority: 'normal' },
  ]

  return (
    <div
      className="animate-page-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        padding: '88px var(--space-5) 100px',
      }}
    >
      {/* 1. Fleet chip strip — always present, "fleet-first" concept */}
      <FleetChipStrip
        vehicles={fleetVehicles}
        activeId={String(activeVehicle)}
        onSelect={(id) => onSwitchVehicle(parseInt(id))}
      />

      {/* 2. Odometer hero */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
        }}
      >
        {/* Live sync indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
          }}
        >
          <span className="text-label">{v.name.toUpperCase()}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.05em',
            }}
          >
            <span className="indicator-live" />
            SYNCED · 09:42
          </span>
        </div>

        {/* The big number */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
          <span className="text-odometer">{v.milesRaw.toLocaleString()}</span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            miles
          </span>
        </div>

        {/* Metadata row */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-2)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <span>ODO</span>
          {hasRecords ? (
            <span>+1,240 MI SINCE LAST LOG</span>
          ) : (
            <span>NO SERVICE LOGGED YET</span>
          )}
        </div>

        {/* Health / recall pills */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          <StatPill label="Health" value="85" suffix="/100" />
          <StatPill
            label="Due soon"
            value={hasRecords ? '3' : '—'}
            suffix={hasRecords ? 'items' : ''}
          />
          <StatPill label="Recalls" value="1" suffix="open" tone="danger" />
        </div>
      </div>

      {/* 3. Conditional recall alert — only when a recall exists */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="error" fill style={{ color: 'var(--color-status-danger)', fontSize: 22 }} />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-base)',
                margin: '0 0 2px',
                color: 'var(--color-text-primary)',
              }}
            >
              Recall Alert: Airbag System
            </p>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              Safety notice for 2018 Honda Odyssey. Schedule immediately.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('defense')}
          style={{
            background: 'var(--color-status-danger)',
            color: '#fff',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          View Defense Report
        </button>
      </div>

      {/* 4. Mileage tape — replaces the bento grid */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <MileageTape
          currentMileage={v.milesRaw}
          horizonMileage={v.milesRaw + 5000}
          services={upcomingServices}
        />
      </div>

      {/* 5. Recent activity — only if records exist */}
      {hasRecords ? (
        <RecentActivity records={serviceRecords} onNavigate={onNavigate} />
      ) : (
        <EmptyActivityState onNavigate={onNavigate} />
      )}

      {/* 6. Import CTA */}
      <button
        onClick={() => onNavigate('import')}
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-accent)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--color-text-primary)',
          transition: 'box-shadow var(--duration-base) var(--ease-out)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--glow-accent-sm)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              margin: '0 0 4px',
              color: 'var(--color-text-primary)',
            }}
          >
            Import a receipt
          </p>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            AI parses your service history automatically.
          </p>
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-accent)',
            color: 'var(--color-text-inverse)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-accent)',
            flexShrink: 0,
          }}
        >
          <Icon name="add_a_photo" style={{ fontSize: 22 }} />
        </div>
      </button>
    </div>
  )
}

// ─── Subcomponents ────────────────────────────────────────────

function StatPill({ label, value, suffix, tone = 'default' }) {
  const valueColor =
    tone === 'danger' ? 'var(--color-status-danger)' : 'var(--color-text-primary)'
  return (
    <div
      style={{
        flex: 1,
        background: 'var(--color-bg-inset)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
      }}
    >
      <div className="text-label" style={{ marginBottom: 4, fontSize: 10 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            color: valueColor,
          }}
        >
          {value}
        </span>
        {suffix && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function RecentActivity({ records, onNavigate }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 'var(--space-3)',
        }}
      >
        <h3 className="text-section">Recent activity</h3>
        <button
          onClick={() => onNavigate('schedule')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          Full ledger →
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {records.slice(0, 3).map((r, i) => (
          <div
            key={i}
            onClick={() => onNavigate('schedule')}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 'var(--text-base)',
                  margin: '0 0 2px',
                }}
              >
                {r.service_type || 'Service'}
              </p>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)',
                  margin: 0,
                }}
              >
                {r.shop_name || '—'} · {r.date || '—'}
              </p>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: 'var(--text-base)',
                color: 'var(--color-accent)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {r.cost ? `$${parseFloat(r.cost).toFixed(2)}` : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyActivityState({ onNavigate }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px dashed var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-accent-bg)',
          border: '1px solid var(--color-border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-3)',
        }}
      >
        <Icon name="receipt_long" style={{ color: 'var(--color-accent)', fontSize: 22 }} />
      </div>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'var(--text-base)',
          margin: '0 0 4px',
          color: 'var(--color-text-primary)',
        }}
      >
        No service records yet
      </p>
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          margin: '0 0 var(--space-4)',
          maxWidth: 280,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Import a receipt to start your maintenance ledger.
      </p>
      <button
        onClick={() => onNavigate('import')}
        style={{
          background: 'var(--color-accent)',
          color: 'var(--color-text-inverse)',
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 'var(--text-sm)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: 'var(--glow-accent-sm)',
        }}
      >
        Import first receipt
      </button>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────

function extractNickname(name) {
  // "2021 Toyota Highlander" → "Highlander"
  const parts = name.split(' ')
  return parts.length > 2 ? parts.slice(2).join(' ') : name
}

function extractYear(name) {
  // "2021 Toyota Highlander" → "'21"
  const match = name.match(/\b(19|20)\d{2}\b/)
  if (!match) return ''
  return `'${match[0].slice(2)}`
}

export default DashboardScreen
