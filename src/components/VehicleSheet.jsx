/**
 * VehicleSheet — slide-up sheet for vehicle management
 * ------------------------------------------------------
 * Three internal views:
 *   1. 'list'  — vehicle cards with Edit / Archive / Set active
 *   2. 'edit'  — inline editor for a single vehicle (VehicleForm, unchanged)
 *   3. 'add'   — VIN-first add flow (AddVehicleForm shared component)
 *
 * The add-flow logic was extracted into AddVehicleForm.jsx so it can be
 * reused in OnboardingScreen step 1.
 * The shell (backdrop, slide-up, escape handling, header) is untouched.
 * The 'list' and 'edit' views are untouched.
 */

import { useEffect, useState } from 'react'
import AddVehicleForm from './AddVehicleForm'

function Icon({ name, fill = false, style = {} }) {
  return <span className={`msym ${fill ? 'msym-fill' : ''}`} style={style}>{name}</span>
}

export default function VehicleSheet({
  vehicles,
  activeVehicle,
  onSelectVehicle,
  onUpdateVehicle,
  onArchiveVehicle,
  onAddVehicle,
  onClose,
  initialView = 'list',  // 'list' or 'add'
}) {
  const [view, setView] = useState(initialView)
  const [editingIndex, setEditingIndex] = useState(null)

  // Close on Escape
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
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
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'var(--color-bg-surface)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          borderTop: '1px solid var(--color-border-subtle)',
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
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-border-default)' }} />
        </div>

        {/* Header */}
        <div
          style={{
            padding: '8px 20px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {view !== 'list' && (
              <button
                onClick={() => {
                  setView('list')
                  setEditingIndex(null)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 4,
                  display: 'flex',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <Icon name="arrow_back" style={{ fontSize: 20 }} />
              </button>
            )}
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 600,
                margin: 0,
                color: 'var(--color-text-primary)',
              }}
            >
              {view === 'add' ? 'Add vehicle' : view === 'edit' ? 'Edit vehicle' : 'Your vehicles'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 4,
              display: 'flex',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Icon name="close" style={{ fontSize: 22 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>
          {view === 'list' && (
            <VehicleList
              vehicles={vehicles}
              activeVehicle={activeVehicle}
              onSelect={(i) => {
                onSelectVehicle(i)
              }}
              onEdit={(i) => {
                setEditingIndex(i)
                setView('edit')
              }}
              onArchive={onArchiveVehicle}
              onAdd={() => setView('add')}
            />
          )}

          {view === 'edit' && editingIndex !== null && (
            <VehicleForm
              initial={vehicles[editingIndex]}
              onSubmit={(data) => {
                onUpdateVehicle(editingIndex, data)
                setView('list')
                setEditingIndex(null)
              }}
              submitLabel="Save changes"
            />
          )}

          {view === 'add' && (
            <AddVehicleForm
              onSubmit={(data) => {
                onAddVehicle(data)
                setView('list')
              }}
              showPlateMode={true}
            />
          )}
        </div>
      </div>
    </>
  )
}

// ─── Vehicle list view ───────────────────────────────────────
// (unchanged)

function VehicleList({ vehicles, activeVehicle, onSelect, onEdit, onArchive, onAdd }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {vehicles.map((v, i) => (
        <VehicleCard
          key={i}
          vehicle={v}
          active={i === activeVehicle}
          onSelect={() => onSelect(i)}
          onEdit={() => onEdit(i)}
          onArchive={() => {
            if (confirm(`Archive ${v.nickname || v.name}? You can restore it later.`)) {
              onArchive(i)
            }
          }}
        />
      ))}

      <button
        onClick={onAdd}
        style={{
          background: 'transparent',
          border: '1px dashed var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          color: 'var(--color-accent)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          fontWeight: 600,
          marginTop: 8,
        }}
      >
        <Icon name="add" style={{ fontSize: 20 }} />
        Add vehicle
      </button>
    </div>
  )
}

function VehicleCard({ vehicle, active, onSelect, onEdit, onArchive }) {
  return (
    <div
      style={{
        background: active ? 'var(--color-accent-bg)' : 'var(--color-bg-inset)',
        border: `1px solid ${active ? 'var(--color-border-accent)' : 'var(--color-border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: active ? 'var(--color-accent-bg)' : 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon
            name="directions_car"
            style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: 20 }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 2,
            }}
          >
            {vehicle.nickname || vehicle.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {vehicle.name} · {vehicle.miles}
          </div>
        </div>
        {active && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.1em',
              color: 'var(--color-accent)',
              background: 'var(--color-bg-surface)',
              padding: '3px 6px',
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            Active
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        {!active && (
          <ActionButton icon="check_circle" label="Set active" onClick={onSelect} />
        )}
        <ActionButton icon="edit" label="Edit" onClick={onEdit} />
        <ActionButton icon="archive" label="Archive" onClick={onArchive} subtle />
      </div>
    </div>
  )
}

function ActionButton({ icon, label, onClick, subtle }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: subtle ? 'transparent' : 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        color: subtle ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <Icon name={icon} style={{ fontSize: 15 }} />
      {label}
    </button>
  )
}

// ─── VehicleForm — used by 'edit' view only (unchanged) ──────

function VehicleForm({ initial, onSubmit, submitLabel }) {
  const [year, setYear] = useState(initial ? extractYear(initial.name) : new Date().getFullYear().toString())
  const [make, setMake] = useState(initial ? extractMake(initial.name) : '')
  const [model, setModel] = useState(initial ? extractModel(initial.name) : '')
  const [nickname, setNickname] = useState(initial?.nickname || '')
  const [miles, setMiles] = useState(initial?.milesRaw?.toString() || '')

  const canSubmit = year && make.trim() && model.trim()

  function handleSubmit() {
    if (!canSubmit) return
    const milesRaw = parseInt(miles) || 0
    onSubmit({
      name: `${year} ${make.trim()} ${model.trim()}`,
      nickname: nickname.trim() || model.trim(),
      type: 'Vehicle',
      miles: `${milesRaw.toLocaleString()} miles`,
      milesRaw,
    })
  }

  const years = []
  const currentYear = new Date().getFullYear()
  for (let y = currentYear + 1; y >= 1990; y--) years.push(y.toString())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Year">
          <select value={year} onChange={(e) => setYear(e.target.value)} style={legacyInputStyle}>
            {years.map((y) => (
              <option key={y} value={y} style={{ background: 'var(--color-bg-surface)' }}>
                {y}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Make">
          <input
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Toyota"
            style={legacyInputStyle}
          />
        </Field>
      </div>

      <Field label="Model">
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Highlander"
          style={legacyInputStyle}
        />
      </Field>

      <Field label="Nickname" hint="Optional — how it shows up in your fleet">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={model || 'e.g. The Commuter'}
          style={legacyInputStyle}
        />
      </Field>

      <Field label="Current mileage">
        <input
          type="text"
          inputMode="numeric"
          value={miles}
          onChange={(e) => setMiles(e.target.value.replace(/[^\d]/g, ''))}
          placeholder="42000"
          style={{ ...legacyInputStyle, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
        />
      </Field>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          background: canSubmit ? 'var(--color-accent)' : 'var(--color-bg-inset)',
          color: canSubmit ? 'var(--color-text-inverse)' : 'var(--color-text-tertiary)',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 14,
          padding: '14px 24px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          boxShadow: canSubmit ? 'var(--glow-accent)' : 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginTop: 8,
        }}
      >
        {submitLabel}
      </button>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

// Shared style for the edit-view form (legacy tokens — edit view is unchanged)
const legacyInputStyle = {
  width: '100%',
  background: 'var(--color-bg-inset)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: '12px 14px',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  appearance: 'none',
}

function extractYear(name) {
  const m = name?.match(/^(\d{4})/)
  return m ? m[1] : new Date().getFullYear().toString()
}
function extractMake(name) {
  const parts = name?.split(' ') || []
  return parts[1] || ''
}
function extractModel(name) {
  const parts = name?.split(' ') || []
  return parts.slice(2).join(' ') || ''
}
