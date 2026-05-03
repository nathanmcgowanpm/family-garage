/**
 * PendingReviewBanner — Dashboard banner for pending_review records
 * ------------------------------------------------------------------
 * Mirrors the recall banner pattern: only renders when there is
 * something to show. Collapsed state shows a count and an
 * "Review" button. Expanded state shows one ReviewCard per pending
 * record, with Confirm / Edit / Dismiss actions.
 *
 * Edit opens the ReceiptForm inline (same component used by the
 * upload flow's parsed-data view) pre-populated with the record's
 * current values, including a vehicle reassignment dropdown.
 *
 * Props:
 *   records      — pending records joined with their vehicle
 *                  (output of usePendingRecords)
 *   vehicles     — display-shape vehicles for the reassignment dropdown
 *   onConfirm(id)        — flips status to 'confirmed' as-is
 *   onUpdate(id, patch)  — saves edits AND flips to 'confirmed'
 *   onDismiss(id)        — flips status to 'dismissed'
 */

import { useState } from 'react'
import ReceiptForm from './ReceiptForm'

function Icon({ name, fill = false, style = {} }) {
  return (
    <span className={`msym ${fill ? 'msym-fill' : ''}`} style={style}>
      {name}
    </span>
  )
}

export default function PendingReviewBanner({
  records,
  vehicles,
  onConfirm,
  onUpdate,
  onDismiss,
}) {
  const [expanded, setExpanded] = useState(false)

  if (!records || records.length === 0) return null

  const count = records.length

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-accent)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Banner header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'inherit',
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
          <Icon name="forward_to_inbox" style={{ color: 'var(--color-accent)', fontSize: 22 }} />
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
            {count} {count === 1 ? 'record' : 'records'} to review
          </p>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Forwarded receipts waiting for your confirmation.
          </p>
        </div>
        <Icon
          name={expanded ? 'expand_less' : 'expand_more'}
          style={{ color: 'var(--color-text-secondary)', fontSize: 24, flexShrink: 0 }}
        />
      </button>

      {/* Expanded list of review cards */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
          }}
        >
          {records.map((record) => (
            <ReviewCard
              key={record.id}
              record={record}
              vehicles={vehicles}
              onConfirm={onConfirm}
              onUpdate={onUpdate}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Single review card ───────────────────────────────────────

function ReviewCard({ record, vehicles, onConfirm, onUpdate, onDismiss }) {
  const [mode, setMode] = useState('view')   // 'view' | 'edit'
  const [busy, setBusy] = useState(false)

  const dollars =
    record.cost_cents != null ? (record.cost_cents / 100).toFixed(2) : null
  const vehicleLabel = formatVehicleLabel(record.vehicle)
  const dateLabel = record.service_date || '—'

  async function handle(action) {
    setBusy(true)
    const result = await action()
    setBusy(false)
    if (result?.error) {
      alert(`Could not save: ${result.error.message}`)
    }
  }

  if (mode === 'edit') {
    return (
      <div
        style={{
          background: 'var(--color-bg-inset)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
        }}
      >
        <ReceiptForm
          initialData={record}
          vehicles={vehicles}
          activeVehicleId={record.vehicle_id}
          onSave={async (patch) => {
            setBusy(true)
            const result = await onUpdate(record.id, patch)
            setBusy(false)
            if (result?.error) {
              alert(`Could not save: ${result.error.message}`)
            }
            // On success the row is removed from the parent list,
            // so this component unmounts — no need to reset mode.
          }}
          onCancel={() => setMode('view')}
          saving={busy}
          saveLabel="Save & confirm"
        />
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-inset)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        opacity: busy ? 0.6 : 1,
        transition: 'opacity 150ms',
      }}
    >
      {/* Top row: service + cost */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              margin: '0 0 2px',
              color: 'var(--color-text-primary)',
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
            {vehicleLabel} · {record.shop_name || '—'} · {dateLabel}
          </p>
        </div>
        {dollars && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              color: 'var(--color-accent)',
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}
          >
            ${dollars}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          onClick={() => handle(() => onConfirm(record.id))}
          disabled={busy}
          style={primaryActionStyle(busy)}
        >
          Confirm
        </button>
        <button
          onClick={() => setMode('edit')}
          disabled={busy}
          style={secondaryActionStyle(busy)}
        >
          Edit
        </button>
        <button
          onClick={() => handle(() => onDismiss(record.id))}
          disabled={busy}
          style={secondaryActionStyle(busy)}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────

function formatVehicleLabel(vehicle) {
  if (!vehicle) return 'Unassigned'
  const name = `${vehicle.year ?? ''} ${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim()
  return vehicle.nickname && vehicle.nickname !== vehicle.model
    ? `${name} · ${vehicle.nickname}`
    : name || 'Vehicle'
}

const primaryActionStyle = (busy) => ({
  flex: 1,
  background: 'var(--color-accent)',
  color: 'var(--color-text-inverse)',
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  fontWeight: 600,
  fontSize: 'var(--text-xs)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  border: 'none',
  cursor: busy ? 'wait' : 'pointer',
  opacity: busy ? 0.6 : 1,
})

const secondaryActionStyle = (busy) => ({
  flex: 1,
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  fontWeight: 600,
  fontSize: 'var(--text-xs)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  border: '1px solid var(--color-border-default)',
  cursor: busy ? 'wait' : 'pointer',
  opacity: busy ? 0.6 : 1,
})
