/**
 * AppShell
 * --------
 * Responsive chrome for Family Garage.
 *
 * Mobile (<768px):
 *   - Full-width content
 *   - AppHeader at top (existing)
 *   - BottomNav at bottom (existing)
 *   - FleetChipStrip appears at the top of each screen
 *
 * Desktop (≥768px):
 *   - Left sidebar (220px) with wordmark + nav + fleet chips
 *   - Main content column, max ~640px, centered in the remaining space
 *   - No AppHeader, no BottomNav
 *
 * Usage (in App.jsx):
 *   <AppShell
 *     screen={screen}
 *     onNavigate={navigate}
 *     vehicles={vehicles}
 *     activeVehicle={activeVehicle}
 *     onSelectVehicle={setActiveVehicle}
 *     mobileHeader={<AppHeader .../>}
 *     mobileNav={<BottomNav .../>}
 *   >
 *     {screenContent}
 *   </AppShell>
 */

import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'directions_car', label: 'Garage' },
  { id: 'schedule',  icon: 'build',          label: 'Service' },
  { id: 'import',    icon: 'receipt_long',   label: 'Records' },
  { id: 'defense',   icon: 'security',       label: 'Report' },
]

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

export default function AppShell({
  screen,
  onNavigate,
  vehicles = [],
  activeVehicle = 0,
  onSelectVehicle = () => {},
  mobileHeader = null,
  mobileNav = null,
  children,
}) {
  const isDesktop = useIsDesktop()

  // Onboarding gets no shell chrome at all — full bleed experience
  if (screen === 'onboarding') {
    return <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>{children}</div>
  }

  if (isDesktop) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          background: 'var(--color-bg-base)',
          position: 'relative',
        }}
      >
        {/* Ambient glow in the top-right of the main pane */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse 50% 40% at 70% 0%, rgba(0, 212, 255, 0.05), transparent 70%)',
          }}
          aria-hidden="true"
        />

        <Sidebar
          screen={screen}
          onNavigate={onNavigate}
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          onSelectVehicle={onSelectVehicle}
        />

        <main
          style={{
            minHeight: '100vh',
            padding: '40px 24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              maxWidth: 640,
              margin: '0 auto',
              width: '100%',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    )
  }

  // Mobile: keep the old AppHeader + BottomNav pattern
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      {mobileHeader}
      {children}
      {mobileNav}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────

function Sidebar({ screen, onNavigate, vehicles, activeVehicle, onSelectVehicle }) {
  return (
    <aside
      style={{
        background: 'var(--color-bg-inset)',
        borderRight: '1px solid var(--color-border-subtle)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Wordmark */}
      <button
        onClick={() => onNavigate('dashboard')}
        style={{
          background: 'none',
          border: 'none',
          padding: '0 8px',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: 'var(--color-text-primary)' }}>Family </span>
        <span style={{ color: 'var(--color-accent)' }}>Garage</span>
      </button>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const active = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: active
                  ? '1px solid var(--color-border-accent)'
                  : '1px solid transparent',
                background: active ? 'var(--color-accent-bg)' : 'transparent',
                color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--duration-base) var(--ease-out)',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--color-text-primary)'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              <Icon name={item.icon} style={{ fontSize: 18 }} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Fleet chips — bottom-anchored */}
      {vehicles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
              padding: '0 8px',
              marginBottom: 4,
            }}
          >
            Fleet
          </div>
          {vehicles.map((v, i) => {
            const active = i === activeVehicle
            const nickname = extractNickname(v.name)
            const year = extractYear(v.name)
            return (
              <button
                key={i}
                onClick={() => onSelectVehicle(i)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: active
                    ? '1px solid var(--color-accent)'
                    : '1px solid var(--color-border-subtle)',
                  background: active
                    ? 'var(--color-accent-bg)'
                    : 'var(--color-bg-surface)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-base) var(--ease-out)',
                  boxShadow: active ? 'var(--glow-accent-sm)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  }}
                >
                  {nickname}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-text-tertiary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {year}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </aside>
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
