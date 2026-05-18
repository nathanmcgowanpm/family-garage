/**
 * DashboardScreen — responsive single-column
 * -------------------------------------------
 * Works inside AppShell's content area.
 * On mobile: FleetChipStrip shows at the top (sidebar doesn't exist).
 * On desktop: FleetChipStrip is hidden (sidebar has fleet chips).
 *
 * The content flows top-to-bottom in a single column at all widths,
 * matching the Notion-style narrow-column pattern.
 */

import { useEffect, useState } from 'react'
import FleetChipStrip from './components/FleetChipStrip'
import MileageTape from './components/MileageTape'
import { FORWARDING_ADDRESS } from './components/AccountMenu'

const FORWARDING_TIP_DISMISSED_KEY = 'fg_forwarding_tip_dismissed'

// Local Icon component — renders Material Symbols
function Icon({ name, fill = false, className = '', style = {} }) {
  return (
    <span
      className={`msym ${fill ? 'msym-fill' : ''} ${className}`}
      style={style}
    >
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

function DashboardScreen({
  vehicles,
  activeVehicle,
  onSwitchVehicle,
  onNavigate,
  serviceRecords = [],
  pendingBanner = null,
  hasUsedForwarding = false,
}) {
  const v = vehicles[activeVehicle]
  const hasRecords = serviceRecords.length > 0
  const isDesktop = useIsDesktop()

  const fleetVehicles = vehicles.map((vehicle, i) => ({
    id: String(i),
    nickname: extractNickname(vehicle.name),
    year: extractYear(vehicle.name),
    healthScore: 85,
  }))

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
        gap: 'var(--space-4)',
        paddingTop: isDesktop ? 0 : 88,
        paddingBottom: isDesktop ? 40 : 100,
        paddingLeft: isDesktop ? 0 : 'var(--space-5)',
        paddingRight: isDesktop ? 0 : 'var(--space-5)',
      }}
    >
      {/* Fleet chip strip — mobile only (sidebar handles it on desktop) */}
      {!isDesktop && (
        <FleetChipStrip
          vehicles={fleetVehicles}
          activeId={String(activeVehicle)}
          onSelect={(id) => onSwitchVehicle(parseInt(id))}
        />
      )}

      {/* Odometer hero with integrated stat pills */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
        }}
      >
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-5)',
          }}
        >
          <StatPill label="Health" value="85" suffix="/100" />
          <StatPill
            label="Due soon"
            value={hasRecords ? '3' : '—'}
            suffix={hasRecords ? 'items' : ''}
          />
          <StatPill label="Recalls" value="1" suffix="open" tone="danger" />
        </div>
      </div>

      {/* Pending review banner — only renders when records exist */}
      {pendingBanner}

      {/* Recall alert */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              margin: '0 0 2px',
              color: 'var(--color-text-primary)',
            }}
          >
            Recall: Airbag system
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
        <button
          onClick={() => onNavigate('defense')}
          style={{
            background: 'var(--color-status-danger)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Report
        </button>
      </div>

      {/* Mileage tape */}
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

      {/* Recent activity or empty state */}
      {hasRecords ? (
        <RecentActivity records={serviceRecords} onNavigate={onNavigate} />
      ) : (
        <EmptyActivityState onNavigate={onNavigate} />
      )}

      {/* Forwarding tip — shown to users who have records but haven't
          forwarded yet, until they dismiss it. Hidden automatically once
          they've forwarded a receipt at least once. */}
      {hasRecords && !hasUsedForwarding && <ForwardingTipCard />}

      {/* Import CTA */}
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
            width: 44,
            height: 44,
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
          <Icon name="add_a_photo" style={{ fontSize: 20 }} />
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
                {r.shop_name || '—'} · {formatDate(r.service_date) || '—'}
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
              {r.cost_cents != null ? `$${(r.cost_cents / 100).toFixed(2)}` : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Empty-state for the activity section. Two parallel paths: tap to
// import a receipt, OR forward an emailed receipt to the apex address.
function EmptyActivityState({ onNavigate }) {
  const [copied, setCopied] = useState(false)

  async function copyForwardingEmail(e) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(FORWARDING_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard failed', err)
    }
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px dashed var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
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
            color: 'var(--color-text-primary)',
          }}
        >
          No service records yet
        </p>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            margin: '0 auto',
            maxWidth: 320,
          }}
        >
          Start your maintenance ledger one of two ways:
        </p>
      </div>

      {/* Two parallel paths */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Option 1: import */}
        <button
          onClick={() => onNavigate('import')}
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-text-inverse)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            textAlign: 'left',
            boxShadow: 'var(--glow-accent-sm)',
          }}
        >
          <Icon name="add_a_photo" style={{ fontSize: 22, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', margin: '0 0 2px' }}>
              Import a receipt
            </p>
            <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>
              Snap a photo or upload a PDF.
            </p>
          </div>
          <Icon name="arrow_forward" style={{ fontSize: 18, flexShrink: 0 }} />
        </button>

        {/* OR separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '0 var(--space-2)' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            or
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
        </div>

        {/* Option 2: forward */}
        <div
          style={{
            background: 'var(--color-bg-inset)',
            border: '1px solid var(--color-border-subtle)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <Icon
            name="forward_to_inbox"
            style={{ color: 'var(--color-accent)', fontSize: 22, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                margin: '0 0 2px',
                color: 'var(--color-text-primary)',
              }}
            >
              Forward an email receipt
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-text-secondary)',
                margin: 0,
                wordBreak: 'break-all',
              }}
            >
              {FORWARDING_ADDRESS}
            </p>
          </div>
          <button
            onClick={copyForwardingEmail}
            title="Copy address"
            aria-label="Copy forwarding address"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: copied ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            }}
          >
            <Icon name={copied ? 'done' : 'content_copy'} style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Tip card shown to users who already have records but haven't yet
// used email forwarding. Dismissible (localStorage). Hidden upstream
// once we detect a record with source='email_forward'.
function ForwardingTipCard() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(FORWARDING_TIP_DISMISSED_KEY) === '1'
  })
  const [copied, setCopied] = useState(false)

  if (dismissed) return null

  function dismiss(e) {
    e.stopPropagation()
    localStorage.setItem(FORWARDING_TIP_DISMISSED_KEY, '1')
    setDismissed(true)
  }

  async function copyForwardingEmail(e) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(FORWARDING_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard failed', err)
    }
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          background: 'var(--color-accent-bg)',
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-md)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="forward_to_inbox" style={{ color: 'var(--color-accent)', fontSize: 20 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            margin: '0 0 4px',
            color: 'var(--color-text-primary)',
          }}
        >
          Skip the upload — forward email receipts
        </p>
        <p
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-2)',
            lineHeight: 1.45,
          }}
        >
          Send service emails to{' '}
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            {FORWARDING_ADDRESS}
          </span>
          . We'll parse them and queue for review.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={copyForwardingEmail}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: copied ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <Icon name={copied ? 'done' : 'content_copy'} style={{ fontSize: 14 }} />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={dismiss}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────

function extractNickname(name) {
  const parts = name.split(' ')
  return parts.length > 2 ? parts.slice(2).join(' ') : name
}

function extractYear(name) {
  const match = name.match(/\b(19|20)\d{2}\b/)
  if (!match) return ''
  return `'${match[0].slice(2)}`
}

function formatDate(input) {
  if (!input) return null
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return String(input)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default DashboardScreen
