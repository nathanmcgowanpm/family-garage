/**
 * ScheduleScreen (Service)
 * -------------------------
 * Two tabs: Upcoming / History
 *
 * Upcoming:
 *   - Urgency-sorted list: overdue → due-soon → upcoming
 *   - Color-coded left border: red / cyan / muted
 *   - Click a row to expand cost estimate and description
 *   - Bottom CTA: generate Pre-Visit Report (deep link to Defense)
 *
 * History:
 *   - Reverse-chronological list of service records
 *   - Empty state if no records yet
 *
 * Data:
 *   - Maintenance intervals + costs from src/data/maintenance-intervals.js
 *   - Service records from state (user's parsed receipts)
 */

import { useEffect, useState } from 'react'
import {
  computeServiceStatus,
  sortByUrgency,
} from './data/maintenance-intervals'

function Icon({ name, fill = false, style = {} }) {
  return (
    <span className={`msym ${fill ? 'msym-fill' : ''}`} style={style}>
      {name}
    </span>
  )
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  )
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

export default function ScheduleScreen({
  vehicles,
  activeVehicle,
  onNavigate,
  serviceRecords = [],
}) {
  const v = vehicles[activeVehicle]
  const [tab, setTab] = useState('upcoming')
  const isDesktop = useIsDesktop()

  // Build a map of last-serviced mileage per item from the user's records
  // (stub logic — matches by service name contains keyword)
  const lastServicedMap = buildLastServicedMap(serviceRecords)

  const services = computeServiceStatus(v.milesRaw, lastServicedMap).sort(sortByUrgency)

  const upcomingCount = services.filter((s) => s.status !== 'upcoming').length
  const overdueCount = services.filter((s) => s.status === 'overdue').length

  return (
    <div
      className="animate-page-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        paddingTop: isDesktop ? 0 : 88,
        paddingBottom: isDesktop ? 40 : 100,
        paddingLeft: isDesktop ? 0 : 'var(--space-5)',
        paddingRight: isDesktop ? 0 : 'var(--space-5)',
      }}
    >
      {/* Screen header — minimal, no vehicle name (sidebar has context) */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 'var(--space-2)',
          }}
        >
          <span className="text-label">Maintenance</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {v.milesRaw.toLocaleString()} MI · Last sync 09:42
          </span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Service plan
        </h2>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          background: 'var(--color-bg-inset)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <TabButton
          label="Upcoming"
          count={upcomingCount > 0 ? upcomingCount : null}
          active={tab === 'upcoming'}
          onClick={() => setTab('upcoming')}
        />
        <TabButton
          label="History"
          count={serviceRecords.length > 0 ? serviceRecords.length : null}
          active={tab === 'history'}
          onClick={() => setTab('history')}
        />
      </div>

      {/* Urgency summary bar (only show in Upcoming tab if there are overdue/due-soon items) */}
      {tab === 'upcoming' && overdueCount > 0 && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <Icon
            name="error"
            fill
            style={{ color: 'var(--color-status-danger)', fontSize: 18 }}
          />
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-status-danger)',
              fontWeight: 500,
            }}
          >
            {overdueCount} item{overdueCount > 1 ? 's' : ''} overdue
          </span>
        </div>
      )}

      {/* Upcoming tab */}
      {tab === 'upcoming' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {services.map((s) => (
              <ServiceRow key={s.id} service={s} currentMileage={v.milesRaw} />
            ))}
          </div>

          {/* Pre-visit report CTA */}
          <button
            onClick={() => onNavigate('defense')}
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
              marginTop: 'var(--space-2)',
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
                }}
              >
                Pre-visit report
              </p>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                Walk into your shop with a clear plan of what's due.
              </p>
            </div>
            <Icon
              name="arrow_forward"
              style={{ color: 'var(--color-accent)', fontSize: 24 }}
            />
          </button>
        </>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <>
          {serviceRecords.length === 0 ? (
            <EmptyHistoryState onNavigate={onNavigate} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {serviceRecords.map((r, i) => (
                <HistoryRow key={i} record={r} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Subcomponents ────────────────────────────────────────────

function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--color-bg-surface)' : 'transparent',
        border: active ? '1px solid var(--color-border-default)' : '1px solid transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all var(--duration-base) var(--ease-out)',
      }}
    >
      {label}
      {count !== null && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function ServiceRow({ service, currentMileage }) {
  const [expanded, setExpanded] = useState(false)

  const statusColor =
    service.status === 'overdue'
      ? 'var(--color-status-danger)'
      : service.status === 'due-soon'
      ? 'var(--color-accent)'
      : 'var(--color-text-tertiary)'

  const statusLabel =
    service.status === 'overdue'
      ? `${Math.abs(service.milesUntilDue).toLocaleString()} MI OVERDUE`
      : service.status === 'due-soon'
      ? `IN ${service.milesUntilDue.toLocaleString()} MI`
      : `IN ${service.milesUntilDue.toLocaleString()} MI`

  const opacity = service.status === 'upcoming' ? 0.75 : 1

  return (
    <div
      onClick={() => setExpanded((e) => !e)}
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        cursor: 'pointer',
        opacity,
        transition: 'opacity var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name={service.icon} style={{ color: statusColor, fontSize: 20 }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-base)',
                margin: '0 0 2px',
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {service.name}
            </p>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                margin: 0,
              }}
            >
              Every {service.intervalMiles?.toLocaleString() || '—'} mi
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: statusColor,
              margin: '0 0 2px',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.02em',
            }}
          >
            {statusLabel}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              margin: 0,
            }}
          >
            @ {service.nextDueAt.toLocaleString()} mi
          </p>
        </div>
      </div>

      {/* Expanded section: cost + description */}
      {expanded && (
        <div
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-label" style={{ fontSize: 10 }}>
              Estimated cost
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {service.cost.low === 0
                ? `Free – $${service.cost.high}`
                : `$${service.cost.low} – $${service.cost.high}`}
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {service.description}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              margin: 0,
            }}
          >
            Source: {service.cost.source}
          </p>
        </div>
      )}
    </div>
  )
}

function HistoryRow({ record }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
          {record.service_type || 'Service'}
        </p>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
            margin: 0,
          }}
        >
          {record.shop_name || '—'} · {record.date || '—'}
          {record.mileage ? ` · ${parseInt(record.mileage).toLocaleString()} mi` : ''}
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
        {record.cost ? `$${parseFloat(record.cost).toFixed(2)}` : '—'}
      </div>
    </div>
  )
}

function EmptyHistoryState({ onNavigate }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px dashed var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-accent-bg)',
          border: '1px solid var(--color-border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-3)',
        }}
      >
        <Icon name="receipt_long" style={{ color: 'var(--color-accent)', fontSize: 20 }} />
      </div>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'var(--text-base)',
          margin: '0 0 4px',
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
        Import a receipt or log a service manually to build your history.
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

/**
 * Rough matcher — turn parsed receipt records into a map of
 * maintenance item id → last serviced mileage.
 * This is stub logic for the prototype. Post-launch, services
 * should be tagged when imported instead of pattern-matched.
 */
function buildLastServicedMap(records) {
  const map = {}
  const keywords = {
    'oil-change': ['oil change', 'oil & filter', 'synthetic oil'],
    'tire-rotation': ['tire rotation', 'tire rotate', 'rotate and balance'],
    'brake-fluid-flush': ['brake fluid', 'brake flush'],
    'engine-air-filter': ['engine air filter', 'air filter'],
    'cabin-air-filter': ['cabin air', 'cabin filter'],
    'coolant-flush': ['coolant', 'antifreeze'],
    'transmission-fluid': ['transmission fluid', 'trans fluid'],
    'wheel-alignment': ['alignment'],
    'battery-test': ['battery test', 'battery check'],
    'spark-plugs': ['spark plug'],
    'wiper-blades': ['wiper', 'wiper blade'],
    'brake-pads': ['brake pad'],
  }

  for (const record of records) {
    const name = (record.service_type || '').toLowerCase()
    const mileage = parseInt(record.mileage) || 0
    if (!mileage) continue

    for (const [id, terms] of Object.entries(keywords)) {
      if (terms.some((t) => name.includes(t))) {
        // Keep the highest (most recent) mileage
        if (!map[id] || mileage > map[id]) {
          map[id] = mileage
        }
      }
    }
  }

  return map
}
