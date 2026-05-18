/**
 * FleetScreen — vehicle list, minimal v1.
 *
 * Each card: name + active dot, spec sub-line, mileage + "Set active".
 * Clicking a card sets it active and routes back to home.
 * "Add vehicle" CTA opens the existing VehicleSheet add flow.
 *
 * Phase 1 deliberately ships no edit/delete actions — those come later.
 */

import AppShell from '../design-system/AppShell.jsx'
import {
  Logo,
  MicroLabel,
  MonoNum,
  StatusDot,
  TabBar,
  AvatarButton,
} from '../design-system/primitives'

export default function FleetScreen({
  user,
  vehicles = [],
  activeVehicle = 0,
  onSelectVehicle,
  onAddVehicle,
  onNavigate,
  onOpenAccount,
}) {
  function setActiveAndGoHome(i) {
    onSelectVehicle(i)
    onNavigate('home')
  }

  return (
    <>
      <AppShell>
        {/* Header */}
        <header
          className="flex items-center justify-between"
          style={{ padding: '8px 20px 20px' }}
        >
          <Logo />
          <AvatarButton user={user} onClick={onOpenAccount} />
        </header>

        {/* Title block */}
        <section style={{ padding: '0 20px 0' }}>
          <MicroLabel>Your fleet</MicroLabel>
          <h1
            className="font-display"
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '-1px',
              color: 'var(--color-text)',
              marginTop: 6,
            }}
          >
            Vehicles
          </h1>
        </section>

        {/* Vehicle cards */}
        <div style={{ margin: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vehicles.length === 0 ? (
            <div
              style={{
                padding: '14px 0',
                fontSize: 13,
                color: 'var(--color-text-dim)',
                fontFamily: 'var(--font-body)',
              }}
            >
              You haven't added any vehicles yet.
            </div>
          ) : (
            vehicles.map((v, i) => (
              <VehicleCard
                key={v.id ?? i}
                vehicle={v}
                active={i === activeVehicle}
                onSetActive={() => setActiveAndGoHome(i)}
              />
            ))
          )}
        </div>

        {/* Add vehicle CTA */}
        <div style={{ margin: '22px 20px 0' }}>
          <button
            type="button"
            onClick={onAddVehicle}
            className="font-display uppercase w-full transition-transform active:scale-[0.98]"
            style={{
              height: 56,
              borderRadius: 14,
              background: 'var(--gradient-primary-button)',
              color: 'var(--color-ink)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '2px',
              border: 'none',
              boxShadow: 'var(--shadow-primary-button)',
              cursor: 'pointer',
            }}
          >
            Add vehicle
          </button>
        </div>

        {/* Spacer for TabBar */}
        <div style={{ height: 110 }} />
      </AppShell>

      <TabBar
        active="fleet"
        onHome={() => onNavigate('home')}
        onFleet={() => onNavigate('fleet')}
        onFab={() => onNavigate('import')}
        onNext={() => onNavigate('schedule')}
        onMe={onOpenAccount}
      />
    </>
  )
}

// ─── Vehicle card ──────────────────────────────────────────────

function VehicleCard({ vehicle, active, onSetActive }) {
  const v = vehicle
  const titleName = v.nickname || v.model || 'Vehicle'
  const specParts = [v.year, v.make, v.model, v.trim].filter(Boolean)
  const spec = specParts.join(' · ')
  const mileage =
    Number.isFinite(v.current_mileage)
      ? v.current_mileage
      : Number.isFinite(v.milesRaw)
        ? v.milesRaw
        : 0

  return (
    <button
      type="button"
      onClick={onSetActive}
      className="text-left w-full transition-colors"
      style={{
        padding: 16,
        borderRadius: 14,
        background: 'var(--color-surface)',
        border: `1px solid ${active ? 'var(--color-primary-line)' : 'var(--color-line-2)'}`,
        cursor: 'pointer',
      }}
    >
      {/* Top: name + active dot */}
      <div className="flex items-center" style={{ gap: 8 }}>
        <span
          className="font-display"
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '-0.2px',
            color: 'var(--color-text)',
          }}
        >
          {titleName}
        </span>
        {active && <StatusDot variant="primary" size={6} />}
      </div>

      {/* Spec line */}
      {spec && (
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 10,
            letterSpacing: '1px',
            color: 'var(--color-text-dim)',
            marginTop: 4,
          }}
        >
          {spec}
        </div>
      )}

      {/* Bottom: mileage + set-active */}
      <div
        className="flex items-baseline justify-between"
        style={{ marginTop: 12 }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
          <MonoNum size={14}>{mileage.toLocaleString()}</MonoNum>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 9,
              letterSpacing: '1.2px',
              color: 'var(--color-text-mute)',
            }}
          >
            MI
          </span>
        </span>
        {!active && (
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 9,
              letterSpacing: '1.4px',
              color: 'var(--color-primary)',
              fontWeight: 500,
            }}
          >
            SET ACTIVE →
          </span>
        )}
      </div>
    </button>
  )
}

