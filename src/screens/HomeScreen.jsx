/**
 * HomeScreen — v2 "Command Center" home.
 *
 * Layout (per DESIGN_SPEC.md Screen 01):
 *   header → fleet strip → hero card → mileage horizon → recent activity
 *
 * Data sources (all real, no mocks):
 *   - vehicles, activeVehicle, onSelectVehicle — passed down from App.jsx
 *   - serviceRecords (status='confirmed') from useServiceRecords()
 *   - upcoming services from computeServiceStatus() in
 *     src/data/maintenance-intervals.js
 */

import { useState } from 'react'
import AppShell from '../design-system/AppShell.jsx'
import {
  Logo,
  MicroLabel,
  MonoNum,
  StatusDot,
  FleetPill,
  AddFleetPill,
  MileageTape,
  ActivityRow,
  TabBar,
  AvatarButton,
} from '../design-system/primitives'
import RecordSheet from './history/RecordSheet.jsx'
import {
  buildLastServicedMap,
  computeServiceStatus,
  sortByUrgency,
} from '../data/maintenance-intervals.js'

const HORIZON_MI = 5000

export default function HomeScreen({
  user,
  vehicles = [],
  activeVehicle = 0,
  onSelectVehicle,
  onAddVehicle,
  onNavigate,
  onOpenAccount,
  serviceRecords = [],
  onUpdateRecord,
  onDeleteRecord,
  pendingBanner = null,
}) {
  const v = vehicles[activeVehicle]
  const activeVehicleId = v?.id ?? null
  const currentMileage = v?.milesRaw ?? 0

  // Row→sheet wiring — mirrors HistoryScreen.jsx exactly. Storing the
  // id (not the full record) means the sheet's content auto-refreshes
  // when an optimistic edit lands; the post-delete cleanup uses the
  // same queueMicrotask close-on-disappear pattern.
  const [openRecordId, setOpenRecordId] = useState(null)
  const openRecord = openRecordId
    ? serviceRecords.find((r) => r.id === openRecordId) ?? null
    : null
  if (openRecordId && !openRecord) {
    queueMicrotask(() => setOpenRecordId(null))
  }

  // ─── Hero card derived values ──────────────────────────────
  const fullName = formatVehicleFullName(v)
  const mostRecent = serviceRecords[0]  // already sorted DESC
  const lastUpdatedLabel = mostRecent
    ? `LAST UPDATED · ${relativeDateLabel(mostRecent.service_date)}`
    : 'LAST UPDATED · NEVER'

  const priorMileage = mostRecent?.mileage_at_service
  const delta =
    Number.isFinite(priorMileage) && priorMileage > 0
      ? Math.max(0, currentMileage - priorMileage)
      : null

  // ─── Mileage horizon markers ───────────────────────────────
  const lastServicedMap = buildLastServicedMap(serviceRecords)
  const allServices = computeServiceStatus(currentMileage, lastServicedMap).sort(
    sortByUrgency,
  )
  const horizonCutoff = currentMileage + HORIZON_MI
  const markers = allServices
    .filter((s) => Number.isFinite(s.nextDueAt) && s.nextDueAt <= horizonCutoff)
    .map((s) => ({
      mileage: s.nextDueAt,
      label: s.name,
      warn: s.status === 'due-soon',
    }))

  // ─── Recent activity ───────────────────────────────────────
  const recent = serviceRecords.slice(0, 3)

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

        {/* Fleet chip strip */}
        <div
          className="flex overflow-x-auto no-scrollbar"
          style={{
            padding: '0 20px 18px',
            gap: 8,
            scrollbarWidth: 'none',
          }}
        >
          {vehicles.map((veh, i) => (
            <FleetPill
              key={veh.id ?? i}
              name={veh.nickname || veh.model || 'Vehicle'}
              year={veh.year}
              mileageThousands={
                Number.isFinite(veh.current_mileage)
                  ? Math.round((veh.current_mileage ?? 0) / 1000)
                  : Number.isFinite(veh.milesRaw)
                    ? Math.round(veh.milesRaw / 1000)
                    : null
              }
              active={i === activeVehicle}
              onClick={() => onSelectVehicle(i)}
            />
          ))}
          <AddFleetPill onClick={onAddVehicle} />
        </div>

        {/* Pending review banner — legacy component, slotted here so the
           review workflow keeps working across the redesign. Self-hides
           when there are no pending records. */}
        {pendingBanner && (
          <div style={{ margin: '0 20px 18px' }}>{pendingBanner}</div>
        )}

        {/* Hero card */}
        <section
          className="relative"
          style={{
            margin: '0 20px',
            padding: 22,
            borderRadius: 20,
            background:
              'linear-gradient(180deg, var(--color-surface) 0%, var(--color-ink) 100%)',
            border: '1px solid var(--color-line-2)',
          }}
        >
          {/* Last-updated badge */}
          <div
            className="absolute inline-flex items-center"
            style={{ top: 14, right: 14, gap: 6 }}
          >
            <StatusDot variant="go" size={6} />
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 9,
                letterSpacing: '1.4px',
                color: 'var(--color-go)',
                fontWeight: 500,
              }}
            >
              {lastUpdatedLabel}
            </span>
          </div>

          {/* Vehicle name */}
          <div style={{ marginTop: 6 }}>
            <MicroLabel color="var(--color-text-dim)">{fullName}</MicroLabel>
          </div>

          {/* Odometer */}
          <div
            className="flex items-baseline"
            style={{ marginTop: 18, gap: 10 }}
          >
            <span
              className="font-display tabular-nums"
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 0.85,
                letterSpacing: '-3px',
                color: 'var(--color-text)',
              }}
            >
              {currentMileage.toLocaleString()}
            </span>
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 12,
                letterSpacing: '1.8px',
                color: 'var(--color-text-mute)',
                fontWeight: 500,
              }}
            >
              MILES
            </span>
          </div>

          {/* Delta line */}
          <div style={{ marginTop: 6 }}>
            {delta != null ? (
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: '1.2px',
                  color: 'var(--color-text-dim)',
                }}
              >
                ODO ·{' '}
                <span style={{ color: 'var(--color-primary)' }}>
                  +{delta.toLocaleString()}
                </span>{' '}
                MI SINCE LAST LOG
              </span>
            ) : (
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: '1.2px',
                  color: 'var(--color-text-dim)',
                }}
              >
                ODO · NO PRIOR LOG
              </span>
            )}
          </div>
        </section>

        {/* Mileage horizon */}
        <section style={{ marginTop: 24 }}>
          <div
            className="flex items-baseline justify-between"
            style={{ padding: '0 20px 6px' }}
          >
            <MicroLabel>Mileage horizon</MicroLabel>
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 9,
                letterSpacing: '1.4px',
                color: 'var(--color-text-mute)',
                fontWeight: 500,
              }}
            >
              NEXT 5,000 MI →
            </span>
          </div>
          <MileageTape
            currentMileage={currentMileage}
            markers={markers}
            horizonMiles={HORIZON_MI}
          />
        </section>

        {/* Recent activity */}
        <section style={{ marginTop: 26 }}>
          <div
            className="flex items-baseline justify-between"
            style={{ padding: '0 20px 6px' }}
          >
            <MicroLabel>Recent</MicroLabel>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="font-mono uppercase"
              style={{
                fontSize: 9,
                letterSpacing: '1.4px',
                color: 'var(--color-primary)',
                fontWeight: 500,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              LEDGER →
            </button>
          </div>

          {recent.length > 0 ? (
            <div style={{ margin: '10px 20px 0' }}>
              {recent.map((r, i) => (
                <ActivityRow
                  key={r.id ?? i}
                  title={r.service_type || 'Service'}
                  shopName={r.shop_name}
                  costCents={r.cost_cents}
                  serviceDate={r.service_date}
                  hot={i === 0}
                  onClick={r.id ? () => setOpenRecordId(r.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                margin: '10px 20px 0',
                padding: '14px 0',
                fontSize: 13,
                color: 'var(--color-text-dim)',
                fontFamily: 'var(--font-body)',
              }}
            >
              No service history yet.
            </div>
          )}
        </section>

        {/* Bottom spacer so TabBar (92px) doesn't overlap content */}
        <div style={{ height: 110 }} />
      </AppShell>

      <TabBar
        active="home"
        onHome={() => onNavigate('home')}
        onFleet={() => onNavigate('fleet')}
        onFab={() => onNavigate('import')}
        onNext={() => onNavigate('schedule')}
        onMe={onOpenAccount}
      />

      {openRecord && (
        <RecordSheet
          record={openRecord}
          vehicles={vehicles}
          activeVehicleId={activeVehicleId}
          onUpdate={onUpdateRecord}
          onDelete={onDeleteRecord}
          onClose={() => setOpenRecordId(null)}
        />
      )}
    </>
  )
}

// ─── Helpers ────────────────────────────────────────────────────

function formatVehicleFullName(v) {
  if (!v) return 'No vehicle selected'
  const parts = [v.year, v.make, v.model].filter(Boolean).join(' ')
  if (v.trim) return `${parts} · ${v.trim}`
  return parts || v.nickname || 'Vehicle'
}

function relativeDateLabel(iso) {
  if (!iso) return 'NEVER'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'NEVER'
  const today = startOfDay(new Date())
  const target = startOfDay(d)
  const diffDays = Math.round((today - target) / 86_400_000)
  if (diffDays === 0) return 'TODAY'
  if (diffDays === 1) return 'YESTERDAY'
  return d
    .toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    .toUpperCase()
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}
