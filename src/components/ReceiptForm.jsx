/**
 * ReceiptForm — editable parsed-receipt form
 * --------------------------------------------
 * Used in two places:
 *   1. ImportScreen, after AI parses a fresh upload — user reviews
 *      and confirms before saving as a new service_record
 *   2. Review flow on Dashboard — user edits an existing
 *      pending_review record before confirming or reassigning
 *
 * Fields:
 *   - service_type (text)
 *   - service_date (date)
 *   - mileage (number)
 *   - cost (decimal dollars)
 *   - shop_name (text)
 *   - vehicle_id (dropdown, optional)
 *   - notes (textarea)
 *
 * Props:
 *   initialData    — { service_type, date, mileage, cost, shop_name,
 *                     notes, vehicle_id? }
 *   vehicles       — display-shape vehicles for the reassignment dropdown
 *                    (omit to hide the dropdown)
 *   activeVehicleId — id of the vehicle this record belongs to (for
 *                    upload flow this is the active vehicle; for review
 *                    flow this is the record's current vehicle_id)
 *   onSave(patch)  — called with the form's current values
 *   onCancel       — optional, shows a Cancel button when provided
 *   saving         — boolean, disables Save while in-flight
 *   saveLabel      — button text, defaults to 'Save'
 */

import { useState } from 'react'

function Icon({ name, fill = false, style = {} }) {
  return (
    <span className={`msym ${fill ? 'msym-fill' : ''}`} style={style}>
      {name}
    </span>
  )
}

export default function ReceiptForm({
  initialData = {},
  vehicles,
  activeVehicleId,
  onSave,
  onCancel,
  saving = false,
  saveLabel = 'Save',
}) {
  // Normalize incoming shape — initialData may come from AI parse
  // (loose strings) or from a service_records row (proper types)
  const [serviceType, setServiceType] = useState(initialData.service_type || '')
  const [serviceDate, setServiceDate] = useState(
    initialData.service_date || initialData.date || ''
  )
  const [mileage, setMileage] = useState(
    initialData.mileage_at_service != null
      ? String(initialData.mileage_at_service)
      : String(initialData.mileage ?? '').replace(/[^0-9]/g, '')
  )
  const [cost, setCost] = useState(
    initialData.cost_cents != null
      ? (initialData.cost_cents / 100).toFixed(2)
      : String(initialData.cost ?? '').replace(/[^0-9.]/g, '')
  )
  const [shopName, setShopName] = useState(initialData.shop_name || '')
  const [vehicleId, setVehicleId] = useState(
    initialData.vehicle_id || activeVehicleId || ''
  )
  const [notes, setNotes] = useState(initialData.notes || '')

  function handleSave() {
    // Convert form values into the DB-shaped patch.
    // Only include vehicle_id when the dropdown is active — otherwise
    // leave it alone so the caller's existing logic decides.
    const costNum = parseFloat(String(cost).replace(/[^0-9.]/g, ''))
    const cost_cents = Number.isFinite(costNum) ? Math.round(costNum * 100) : null

    const mileageNum = parseInt(String(mileage).replace(/[^0-9]/g, ''))
    const mileage_at_service = Number.isFinite(mileageNum) ? mileageNum : null

    const patch = {
      service_type: serviceType || 'Service',
      service_date: serviceDate || null,
      mileage_at_service,
      cost_cents,
      shop_name: shopName || null,
      notes: notes || null,
    }
    if (vehicles && vehicleId) {
      patch.vehicle_id = vehicleId
    }
    onSave(patch)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <Field label="Service type">
        <input
          type="text"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          placeholder="Oil change"
          style={inputStyle}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <Field label="Date">
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="Mileage">
          <input
            type="text"
            inputMode="numeric"
            value={mileage}
            onChange={(e) => setMileage(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="42000"
            style={inputStyle}
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <Field label="Cost ($)">
          <input
            type="text"
            inputMode="decimal"
            value={cost}
            onChange={(e) => setCost(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="48.50"
            style={inputStyle}
          />
        </Field>
        <Field label="Shop">
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Jiffy Lube"
            style={inputStyle}
          />
        </Field>
      </div>

      {vehicles && vehicles.length > 0 && (
        <Field label="Vehicle">
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            style={inputStyle}
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.nickname && v.nickname !== v.model ? ` · ${v.nickname}` : ''}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-body)' }}
        />
      </Field>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={saving}
            style={{
              flex: '0 0 auto',
              background: 'transparent',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-secondary)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            background: 'var(--color-accent)',
            color: 'var(--color-text-inverse)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            border: 'none',
            cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.6 : 1,
            boxShadow: saving ? 'none' : 'var(--glow-accent-sm)',
          }}
        >
          {saving ? 'Saving…' : saveLabel}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle = {
  background: 'var(--color-bg-inset)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 12px',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
