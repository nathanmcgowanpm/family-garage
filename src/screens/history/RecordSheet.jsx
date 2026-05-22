/**
 * RecordSheet — slide-up sheet that shows the full detail of a
 * service record, with edit + delete actions.
 *
 * Modeled on src/components/VehicleSheet.jsx so it matches the
 * established sheet idiom (backdrop + fixed bottom panel + Escape /
 * outside-click to close + drag handle).
 *
 * Two internal modes:
 *   - 'view' — read-only detail with Edit / Delete buttons
 *   - 'edit' — renders ReceiptForm pre-populated, mirroring the
 *             pending-review edit flow (see PendingReviewBanner)
 *
 * Props:
 *   record         — full service_records row
 *   vehicles       — for the ReceiptForm vehicle dropdown (in edit mode)
 *   activeVehicleId
 *   onUpdate(id, patch)   — wired to useServiceRecords.updateRecord
 *   onDelete(id)          — wired to useServiceRecords.deleteRecord
 *   onClose
 */

import { useEffect, useState } from 'react'
import ReceiptForm from '../../components/ReceiptForm.jsx'
import { MicroLabel } from '../../design-system/primitives'

const SOURCE_LABELS = {
  manual:        'MANUAL',
  upload:        'UPLOAD',
  email_forward: 'FORWARDED',
  imported:      'IMPORTED',
}

export default function RecordSheet({
  record,
  vehicles,
  activeVehicleId,
  onUpdate,
  onDelete,
  onClose,
}) {
  const [mode, setMode] = useState('view')
  const [busy, setBusy] = useState(false)

  // Close on Escape (matches VehicleSheet's handler)
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  async function handleDelete() {
    if (!onDelete || !record) return
    const summary = [
      record.service_type || 'this service',
      record.service_date ? `from ${formatLongDate(record.service_date)}` : '',
    ]
      .filter(Boolean)
      .join(' ')
    if (!window.confirm(`Delete ${summary}? This can't be undone.`)) return

    setBusy(true)
    const result = await onDelete(record.id)
    setBusy(false)
    if (result?.error) {
      alert(`Could not delete: ${result.error.message}`)
      return
    }
    onClose()
  }

  async function handleSaveEdit(patch) {
    setBusy(true)
    const result = await onUpdate(record.id, patch)
    setBusy(false)
    if (result?.error) {
      alert(`Could not save: ${result.error.message}`)
      return
    }
    setMode('view')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 90,
          animation: 'fade-in 0.2s var(--ease-out)',
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'var(--color-surface)',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderTop: '1px solid var(--color-line-2)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-up 0.25s var(--ease-out)',
        }}
      >
        <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        {/* Drag handle */}
        <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'var(--color-line-2)',
            }}
          />
        </div>

        {/* Centered content column so this still feels v2 on desktop
           (TabBar uses the same trick). */}
        <div
          className="mx-auto w-full sm:max-w-shell-tablet lg:max-w-shell-desktop"
          style={{
            padding: '8px 20px 28px',
            overflowY: 'auto',
            opacity: busy ? 0.6 : 1,
            transition: 'opacity 150ms',
          }}
        >
          {mode === 'edit' ? (
            <>
              <MicroLabel>Edit record</MicroLabel>
              <div style={{ marginTop: 14 }}>
                <ReceiptForm
                  initialData={record}
                  vehicles={vehicles}
                  activeVehicleId={activeVehicleId}
                  onSave={handleSaveEdit}
                  onCancel={() => setMode('view')}
                  saving={busy}
                  saveLabel="Save changes"
                />
              </div>
            </>
          ) : (
            <DetailView record={record} onEdit={() => setMode('edit')} onDelete={handleDelete} busy={busy} />
          )}
        </div>
      </div>
    </>
  )
}

// ─── Detail view ──────────────────────────────────────────────────

function DetailView({ record, onEdit, onDelete, busy }) {
  const lineItems = Array.isArray(record.line_items) ? record.line_items : []
  const sourceLabel = SOURCE_LABELS[record.source] ?? null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Title */}
      <div>
        <MicroLabel color="var(--color-text-mute)">Service record</MicroLabel>
        <h2
          className="font-display"
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.4px',
            lineHeight: 1.15,
            color: 'var(--color-text)',
            marginTop: 6,
            wordBreak: 'break-word',
          }}
        >
          {record.service_type || 'Service'}
        </h2>
      </div>

      {/* Top metrics — shop, date, mileage, cost in a 2-col grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px 16px',
          padding: '14px 16px',
          borderRadius: 12,
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-line)',
        }}
      >
        <DetailCell label="Shop" value={record.shop_name || '—'} />
        <DetailCell label="Date" value={formatLongDate(record.service_date) || '—'} />
        <DetailCell
          label="Mileage"
          value={
            Number.isFinite(record.mileage_at_service)
              ? `${record.mileage_at_service.toLocaleString()} mi`
              : '—'
          }
          mono
        />
        <DetailCell
          label="Cost"
          value={formatDollars(record.cost_cents)}
          mono
        />
      </div>

      {/* Notes */}
      {record.notes && (
        <div>
          <MicroLabel color="var(--color-text-mute)">Notes</MicroLabel>
          <p
            className="font-body"
            style={{
              marginTop: 6,
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--color-text)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {record.notes}
          </p>
        </div>
      )}

      {/* Line items — collapsed by default when there's a real list,
         inline-expanded for 1-2 items where collapsing adds friction */}
      <LineItemsSection items={lineItems} />


      {/* Source meta line */}
      {sourceLabel && (
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: '1.2px',
            color: 'var(--color-text-mute)',
          }}
        >
          SOURCE · {sourceLabel}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="font-display uppercase transition-transform active:scale-[0.98]"
          style={{
            flex: 1,
            height: 48,
            borderRadius: 14,
            background: 'var(--gradient-primary-button)',
            color: 'var(--color-ink)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '1.8px',
            border: 'none',
            boxShadow: 'var(--shadow-primary-button)',
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="font-display uppercase"
          style={{
            flex: 1,
            height: 48,
            borderRadius: 14,
            background: 'transparent',
            color: 'var(--color-danger)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '1.8px',
            border: '1px solid rgba(255, 77, 109, 0.4)',
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function DetailCell({ label, value, mono = false }) {
  return (
    <div>
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 8,
          letterSpacing: '1.4px',
          color: 'var(--color-text-mute)',
        }}
      >
        {label}
      </div>
      <div
        className={mono ? 'font-mono tabular-nums' : 'font-body'}
        style={{
          fontSize: 14,
          color: 'var(--color-text)',
          marginTop: 4,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  )
}

/**
 * LineItemsSection — the "Line items" block on the detail sheet.
 *
 * Behavior:
 *   - 0 items → render nothing
 *   - 1-2 items → render expanded, no toggle (collapsing two adds
 *                 friction with no payoff)
 *   - 3+ items → collapsed by default; tap the summary to expand,
 *                 tap again to collapse
 *
 * The summary line shows the count and the SUM of parsed amounts —
 * a tax/fee/rounding gap against `cost_cents` is expected and not
 * reconciled (per spec).
 */
function LineItemsSection({ items }) {
  if (!items || items.length === 0) return null

  const parsed = items.map(parseLineItem)
  const lineSum = parsed.reduce(
    (acc, p) => (p.amount != null ? acc + p.amount : acc),
    0,
  )
  const inlineExpand = items.length <= 2
  const [expanded, setExpanded] = useState(inlineExpand)

  return (
    <div>
      <MicroLabel color="var(--color-text-mute)">Line items</MicroLabel>

      {!inlineExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex items-center justify-between w-full"
          style={{
            marginTop: 10,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-line)',
            color: 'var(--color-text-dim)',
            cursor: 'pointer',
            textAlign: 'left',
            gap: 12,
          }}
        >
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: '1.2px',
              color: 'var(--color-text-dim)',
            }}
          >
            {items.length} line items · ${lineSum.toFixed(2)}
          </span>
          <Chevron open={expanded} />
        </button>
      )}

      {expanded && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: inlineExpand ? '10px 0 0' : '8px 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {items.map((item, i) => (
            <LineItem key={i} item={item} />
          ))}
        </ul>
      )}
    </div>
  )
}

function Chevron({ open }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 150ms var(--ease-out, ease)',
      }}
    >
      <path
        d="M3 4.5l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Parse a single line_items array element into a renderable shape.
 *
 * Two on-disk shapes coexist (verified against api/inbound-email.js
 * line 232 — email-forwarded records JSON.stringify each item before
 * write — and src/App.jsx line 334 — uploads store parsed objects
 * directly):
 *
 *   1. JSON string:  '{"description":"BRAKE FLUID","total":"110.00",...}'
 *   2. Plain object: { description: 'BRAKE FLUID', total: '110.00', ... }
 *
 * Returns:
 *   { label, amount, parts, labor }       — when we can read it
 *   { label: null, amount: null, raw }    — when we can't (fall back
 *                                            to JSON.stringify per-item
 *                                            so one weird row doesn't
 *                                            kill the whole list)
 */
function parseLineItem(item) {
  let obj = item
  if (typeof item === 'string') {
    try {
      obj = JSON.parse(item)
    } catch {
      // not JSON — render the raw string verbatim
      return { label: null, amount: null, raw: item }
    }
  }
  if (!obj || typeof obj !== 'object') {
    return { label: null, amount: null, raw: safeStringify(item) }
  }

  const label =
    obj.description || obj.name || obj.label || obj.item || null
  // NOTE: `total` is intentionally first — the bug this method fixes
  // was that the previous chain (cost/amount/price) missed the `total`
  // field used by the OCR pipeline.
  const amount = pickMoney(obj.total, obj.cost, obj.amount, obj.price)
  const parts = pickMoney(obj.parts)
  const labor = pickMoney(obj.labor)

  if (label == null && amount == null) {
    return { label: null, amount: null, raw: safeStringify(obj) }
  }
  return { label, amount, parts, labor }
}

/**
 * Take any number of candidate values, return the first one that
 * parses to a finite number (after stripping `$`, commas, etc.).
 * Returns `null` if none are usable.
 */
function pickMoney(...candidates) {
  for (const raw of candidates) {
    if (raw == null) continue
    const n =
      typeof raw === 'number'
        ? raw
        : parseFloat(String(raw).replace(/[^0-9.\-]/g, ''))
    if (Number.isFinite(n)) return n
  }
  return null
}

/**
 * Render a single parsed line item — label left, total right, with
 * an optional "parts $X · labor $Y" sub-line when BOTH are non-zero
 * (gated to non-zero to avoid the noise of "parts $0.00" on every
 * labor-only row).
 */
function LineItem({ item }) {
  const parsed = parseLineItem(item)

  // Unrenderable item: just print whatever string we have.
  if (parsed.label == null && parsed.amount == null) {
    return (
      <li
        style={{
          padding: '10px 12px',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-line)',
          borderRadius: 10,
        }}
      >
        <span
          className="font-body"
          style={{
            fontSize: 13,
            color: 'var(--color-text-dim)',
            wordBreak: 'break-all',
          }}
        >
          {parsed.raw}
        </span>
      </li>
    )
  }

  const showBreakdown =
    parsed.parts != null && parsed.parts !== 0 &&
    parsed.labor != null && parsed.labor !== 0

  return (
    <li
      style={{
        padding: '10px 12px',
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
      }}
    >
      <div
        className="flex items-baseline justify-between"
        style={{ gap: 12 }}
      >
        <span
          className="font-body"
          style={{
            fontSize: 13,
            color: 'var(--color-text)',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {parsed.label ?? '—'}
        </span>
        {parsed.amount != null && (
          <span
            className="font-mono tabular-nums"
            style={{
              fontSize: 13,
              color: 'var(--color-text)',
              flexShrink: 0,
            }}
          >
            ${parsed.amount.toFixed(2)}
          </span>
        )}
      </div>
      {showBreakdown && (
        <div
          className="font-mono"
          style={{
            marginTop: 4,
            fontSize: 10,
            letterSpacing: '0.4px',
            color: 'var(--color-text-mute)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          parts ${parsed.parts.toFixed(2)} · labor ${parsed.labor.toFixed(2)}
        </div>
      )}
    </li>
  )
}

function safeStringify(item) {
  if (item == null) return '—'
  if (typeof item === 'string') return item
  try {
    return JSON.stringify(item)
  } catch {
    return String(item)
  }
}

// ─── Date / money formatters ──────────────────────────────────────

function formatLongDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDollars(cents) {
  if (!Number.isFinite(cents)) return '—'
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100)
  const remainder = String(abs % 100).padStart(2, '0')
  return `${sign}$${dollars.toLocaleString()}.${remainder}`
}
