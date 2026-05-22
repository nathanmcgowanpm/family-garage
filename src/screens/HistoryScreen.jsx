/**
 * HistoryScreen — the "Ledger" view of an active vehicle's confirmed
 * service records.
 *
 * Flat chronological list (newest first), one LedgerRow per record.
 * Tapping a row opens RecordSheet for view / edit / delete.
 *
 * Data is scoped to the active vehicle. When the user switches active
 * vehicle on Home and returns here, the list refreshes against the
 * new vehicle's records (useServiceRecords re-fetches on vehicleId).
 *
 * Reached via the LEDGER link on Home, not a tab. The TabBar renders
 * with no active dot (same affordance as the upload flow).
 */

import { useState } from 'react'
import AppShell from '../design-system/AppShell.jsx'
import {
  Logo,
  MicroLabel,
  AvatarButton,
  LedgerRow,
  TabBar,
} from '../design-system/primitives'
import RecordSheet from './history/RecordSheet.jsx'

export default function HistoryScreen({
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
}) {
  const v = vehicles[activeVehicle]
  const activeVehicleId = v?.id ?? null

  // Modal state: id of the currently-open record (null = closed)
  const [openRecordId, setOpenRecordId] = useState(null)
  const openRecord = openRecordId
    ? serviceRecords.find((r) => r.id === openRecordId) ?? null
    : null

  // If the open record disappears (e.g. after delete), close the sheet.
  // The useServiceRecords optimistic delete removes the row from
  // `records` before we'd otherwise notice.
  if (openRecordId && !openRecord) {
    // Defer state update to next tick via microtask — safe because
    // RecordSheet won't render without a record.
    queueMicrotask(() => setOpenRecordId(null))
  }

  const fullName = formatVehicleFullName(v)
  const recordCount = serviceRecords.length
  const subline = [
    fullName.toUpperCase(),
    `${recordCount} ${recordCount === 1 ? 'RECORD' : 'RECORDS'}`,
  ]
    .filter(Boolean)
    .join(' · ')

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
        <section style={{ padding: '22px 20px 0' }}>
          <MicroLabel>Service history</MicroLabel>
          <h1
            className="font-display"
            style={{
              fontSize: 30,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-1px',
              color: 'var(--color-text)',
              marginTop: 6,
            }}
          >
            Ledger
          </h1>
          <div
            className="font-mono uppercase"
            style={{
              marginTop: 6,
              fontSize: 9,
              letterSpacing: '1.4px',
              color: 'var(--color-text-dim)',
            }}
          >
            {subline}
          </div>
        </section>

        {/* List / empty state */}
        {recordCount === 0 ? (
          <EmptyState onImport={() => onNavigate('import')} />
        ) : (
          <div style={{ margin: '22px 20px 0' }}>
            {serviceRecords.map((r) => (
              <LedgerRow
                key={r.id}
                title={r.service_type}
                shopName={r.shop_name}
                source={r.source}
                costCents={r.cost_cents}
                mileageAtService={r.mileage_at_service}
                serviceDate={r.service_date}
                onClick={() => setOpenRecordId(r.id)}
              />
            ))}
          </div>
        )}

        {/* Bottom spacer for TabBar */}
        <div style={{ height: 110 }} />
      </AppShell>

      <TabBar
        active={null}
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

// ─── Empty state ──────────────────────────────────────────────────

function EmptyState({ onImport }) {
  return (
    <div
      className="text-center"
      style={{
        margin: '48px 20px 0',
        padding: '32px 24px',
        borderRadius: 18,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-line-2)',
      }}
    >
      <div
        className="font-display"
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '-0.2px',
          color: 'var(--color-text)',
        }}
      >
        No service records yet
      </div>
      <p
        className="font-body"
        style={{
          marginTop: 8,
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--color-text-dim)',
        }}
      >
        Log your first service to start building this vehicle's history.
      </p>
      <button
        type="button"
        onClick={onImport}
        className="font-display uppercase transition-transform active:scale-[0.98]"
        style={{
          marginTop: 22,
          width: '100%',
          height: 52,
          borderRadius: 14,
          background: 'var(--gradient-primary-button)',
          color: 'var(--color-ink)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '2px',
          border: 'none',
          boxShadow: 'var(--shadow-primary-button)',
          cursor: 'pointer',
        }}
      >
        Log a service
      </button>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────

function formatVehicleFullName(v) {
  if (!v) return ''
  const parts = [v.year, v.make, v.model].filter(Boolean).join(' ')
  return parts || v.nickname || ''
}
