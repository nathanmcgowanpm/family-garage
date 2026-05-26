/**
 * VehicleSheet — slide-up sheet for vehicle management
 * ------------------------------------------------------
 * Three internal views:
 *   1. 'list'  — vehicle cards with Edit / Archive / Set active
 *   2. 'edit'  — inline editor for a single vehicle (VehicleForm, unchanged)
 *   3. 'add'   — VIN-first add flow (AddVehicleView)
 *
 * Only the 'add' view content was changed in Phase 4 Step 2.
 * The shell (backdrop, slide-up, escape handling, header) is untouched.
 * The 'list' and 'edit' views are untouched.
 */

import { useEffect, useRef, useState } from 'react'

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
            <AddVehicleView
              onSubmit={(data) => {
                onAddVehicle(data)
                setView('list')
              }}
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

// ─── AddVehicleView — VIN-first add flow (Phase 4) ──────────
//
// inputMode: 'vin' | 'manual'
// vinPhase:  'idle' | 'extracting' | 'decoding' | 'decoded'
//           | 'extract-error' | 'decode-error'
//
// Uses Arctic Signal v2 tokens throughout (--color-primary,
// --color-surface, --color-text, etc.) — not the legacy tokens
// used by the edit view above.

// Good-enough touch/mobile check — evaluated once at module load.
// navigator.maxTouchPoints > 0 covers all modern iOS/Android devices.
// Failure mode is harmless: a touchscreen laptop sees "Photograph" but gets a
// file picker — a mild label mismatch, not a broken flow.
const isTouchDevice =
  typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0

// Convert ALL-CAPS NHTSA make to Title Case for display and persistence.
// Word-by-word: each word (split on space/hyphen) is capitalised.
// Short all-cap abbreviations (≤3 chars like BMW, GMC) come out as
// Bmw/Gmc — the user can correct in the editable confirm card.
function toTitleCase(s) {
  if (!s) return ''
  return s
    .toLowerCase()
    .replace(/(?:^|[\s-])\w/g, (c) => c.toUpperCase())
}

// VIN characters: A–Z digits 0–9, never I O Q.
// Auto-substitute I→1, O→0, strip Q and non-alphanumeric.
function sanitizeVin(raw) {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')  // strip non-alphanumeric
    .replace(/I/g, '1')          // I → 1
    .replace(/O/g, '0')          // O → 0
    .replace(/Q/g, '')           // Q has no clear substitute; strip it
    .slice(0, 17)
}

// v2 input style — Arctic Signal surface tokens
const v2InputStyle = {
  width: '100%',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-line-2)',
  borderRadius: 12,
  padding: '12px 14px',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  appearance: 'none',
  boxSizing: 'border-box',
}

function V2Field({ label, hint, optional, prominent, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <label
          style={{
            fontFamily: 'var(--font-mono)',
            // prominent = full-contrast weight, used for load-bearing fields like mileage
            fontSize:   prominent ? 10 : 9,
            fontWeight: prominent ? 700 : 600,
            color:      prominent ? 'var(--color-text)' : 'var(--color-text-mute)',
            textTransform: 'uppercase',
            letterSpacing: '1.3px',
          }}
        >
          {label}
        </label>
        {optional && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '1px',
              color: 'var(--color-text-mute)',
              textTransform: 'uppercase',
              opacity: 0.6,
            }}
          >
            optional
          </span>
        )}
      </div>
      {children}
      {hint && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--color-text-mute)',
            letterSpacing: '0.8px',
            margin: '5px 0 0',
          }}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

function AddVehicleView({ onSubmit }) {
  // ── Mode ──────────────────────────────────────────────────
  const [inputMode, setInputMode] = useState('vin') // 'vin' | 'manual'

  // ── VIN-mode state ────────────────────────────────────────
  const [vinText, setVinText]     = useState('')
  const [vinPhase, setVinPhase]   = useState('idle')
  // 'idle' | 'extracting' | 'decoding' | 'decoded'
  // | 'extract-error' | 'decode-error'
  const [decoded, setDecoded]     = useState(null)
  const [errorMsg, setErrorMsg]   = useState('')

  // Confirm card fields — pre-filled from decoded, then user-editable
  const [cYear,     setCYear]     = useState('')
  const [cMake,     setCMake]     = useState('')
  const [cModel,    setCModel]    = useState('')
  const [cTrim,     setCTrim]     = useState('')
  const [cNickname, setCNickname] = useState('')
  const [cMiles,    setCMiles]    = useState('')

  // ── Manual-mode state ─────────────────────────────────────
  const currentYear = new Date().getFullYear()
  const [mYear,     setMYear]     = useState(String(currentYear))
  const [mMake,     setMMake]     = useState('')
  const [mModel,    setMModel]    = useState('')
  const [mTrim,     setMTrim]     = useState('')
  const [mNickname, setMNickname] = useState('')
  const [mMiles,    setMMiles]    = useState('')
  const [mVin,      setMVin]      = useState('')
  const [mPlate,    setMPlate]    = useState('')

  // ── Refs ──────────────────────────────────────────────────
  const photoRef = useRef(null)

  // ── Helpers ───────────────────────────────────────────────
  function resetVin() {
    setVinText('')
    setVinPhase('idle')
    setDecoded(null)
    setErrorMsg('')
  }

  function switchMode(mode) {
    setInputMode(mode)
    resetVin()
  }

  function handleVinInput(e) {
    setVinText(sanitizeVin(e.target.value))
  }

  function handlePhotoCapture(input) {
    if (!input.files || !input.files[0]) return
    const file = input.files[0]
    if (!file.type.startsWith('image/')) return
    extractVinFromPhoto(file)
    // Reset the file input so the same photo can be re-selected if needed
    input.value = ''
  }

  async function extractVinFromPhoto(file) {
    setVinPhase('extracting')
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/extract-vin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ base64, mediaType: file.type }),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const { vin, confidence } = await res.json()

      if (!vin || confidence === 'low') {
        setErrorMsg(
          vin
            ? 'The VIN was unclear in that photo — try again or type it manually.'
            : 'No VIN found in the photo — try again or enter it manually.',
        )
        setVinPhase('extract-error')
        return
      }

      setVinText(vin)   // pre-fill the text field with what was read
      await decodeVin(vin)
    } catch {
      setErrorMsg('Something went wrong reading the photo.')
      setVinPhase('extract-error')
    }
  }

  async function decodeVin(vin) {
    setVinPhase('decoding')
    try {
      const res = await fetch('/api/decode-vin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ vin }),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const result = await res.json()
      if (!result.ok) {
        setErrorMsg("That VIN didn't decode — double-check it or enter details manually.")
        setVinPhase('decode-error')
        return
      }
      setDecoded(result)
      // Pre-fill confirm card with NHTSA data
      setCYear(String(result.year))
      setCMake(toTitleCase(result.make))
      setCModel(result.model)
      setCTrim(result.trim ?? '')
      setCNickname('')
      setCMiles('')
      setVinPhase('decoded')
    } catch {
      setErrorMsg('Could not decode the VIN — check your connection or enter details manually.')
      setVinPhase('decode-error')
    }
  }

  function handleConfirmSave() {
    onSubmit({
      year:            parseInt(cYear, 10) || null,
      make:            cMake.trim(),
      model:           cModel.trim(),
      trim:            cTrim.trim() || null,
      nickname:        cNickname.trim() || null,
      vin:             decoded?.vin ?? null,
      license_plate:   null,
      current_mileage: parseInt(cMiles.replace(/[^0-9]/g, ''), 10) || 0,
    })
  }

  function handleManualSave() {
    onSubmit({
      year:            parseInt(mYear, 10) || null,
      make:            mMake.trim(),
      model:           mModel.trim(),
      trim:            mTrim.trim() || null,
      nickname:        mNickname.trim() || null,
      vin:             mVin.trim() ? sanitizeVin(mVin) : null,
      license_plate:   mPlate.trim() || null,
      current_mileage: parseInt(mMiles.replace(/[^0-9]/g, ''), 10) || 0,
    })
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Mode switcher — VIN / MANUAL / PLATE */}
      <div
        style={{
          display: 'inline-flex',
          padding: 3,
          borderRadius: 10,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-line-2)',
          alignSelf: 'flex-start',
        }}
      >
        {[
          { id: 'vin',    label: 'VIN',    disabled: false },
          { id: 'manual', label: 'Manual', disabled: false },
          { id: 'plate',  label: 'Plate',  disabled: true  },
        ].map(({ id, label, disabled }) => {
          const isActive = inputMode === id
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && switchMode(id)}
              style={{
                padding: '5px 12px',
                borderRadius: 7,
                border: 'none',
                background: isActive
                  ? 'var(--color-primary)'
                  : 'transparent',
                color: isActive
                  ? 'var(--color-ink)'
                  : disabled
                    ? 'var(--color-text-mute)'
                    : 'var(--color-text-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.45 : 1,
                position: 'relative',
              }}
            >
              {label}
              {disabled && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -2,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 7,
                    letterSpacing: '0.5px',
                    color: 'var(--color-text-mute)',
                    textTransform: 'uppercase',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-line-2)',
                    borderRadius: 4,
                    padding: '1px 4px',
                    lineHeight: 1.4,
                  }}
                >
                  Soon
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── VIN mode ─────────────────────────────────────── */}
      {inputMode === 'vin' && (
        <>
          {/* Hidden photo capture input */}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => handlePhotoCapture(e.target)}
          />

          {/* Idle: text input + photograph button */}
          {vinPhase === 'idle' && (
            <VinIdleState
              vinText={vinText}
              onVinInput={handleVinInput}
              onDecode={() => decodeVin(vinText)}
              onPhoto={() => photoRef.current?.click()}
            />
          )}

          {/* Loading: extracting from photo */}
          {vinPhase === 'extracting' && (
            <VinLoadingState label="Reading VIN from photo…" />
          )}

          {/* Loading: decoding via NHTSA */}
          {vinPhase === 'decoding' && (
            <VinLoadingState label="Decoding with NHTSA…" />
          )}

          {/* Decoded: editable confirm card */}
          {vinPhase === 'decoded' && decoded && (
            <ConfirmCard
              vin={decoded.vin}
              engine={decoded.engine}
              bodyClass={decoded.bodyClass}
              cYear={cYear}      onCYear={setCYear}
              cMake={cMake}      onCMake={setCMake}
              cModel={cModel}    onCModel={setCModel}
              cTrim={cTrim}      onCTrim={setCTrim}
              cNickname={cNickname} onCNickname={setCNickname}
              cMiles={cMiles}    onCMiles={setCMiles}
              onSave={handleConfirmSave}
              onBack={resetVin}
            />
          )}

          {/* Extract error */}
          {vinPhase === 'extract-error' && (
            <VinErrorState
              message={errorMsg}
              primaryLabel="Try another photo"
              onPrimary={() => { setVinPhase('idle'); photoRef.current?.click() }}
              secondaryLabel="Type VIN instead"
              onSecondary={() => setVinPhase('idle')}
            />
          )}

          {/* Decode error */}
          {vinPhase === 'decode-error' && (
            <VinErrorState
              message={errorMsg}
              primaryLabel="Edit VIN"
              onPrimary={() => setVinPhase('idle')}
              secondaryLabel="Enter details manually"
              onSecondary={() => switchMode('manual')}
            />
          )}
        </>
      )}

      {/* ── Manual mode ──────────────────────────────────── */}
      {inputMode === 'manual' && (
        <ManualModeView
          year={mYear}     onYear={setMYear}
          make={mMake}     onMake={setMMake}
          model={mModel}   onModel={setMModel}
          trim={mTrim}     onTrim={setMTrim}
          nickname={mNickname} onNickname={setMNickname}
          miles={mMiles}   onMiles={setMMiles}
          vin={mVin}       onVin={setMVin}
          plate={mPlate}   onPlate={setMPlate}
          onSave={handleManualSave}
        />
      )}
    </div>
  )
}

// ── VIN idle state: text input + photograph affordance ───────

function VinIdleState({ vinText, onVinInput, onDecode, onPhoto }) {
  const len       = vinText.length
  const canDecode = len === 17

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <V2Field
        label="Vehicle Identification Number"
        hint="17 characters · I→1 and O→0 are corrected automatically"
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            value={vinText}
            onChange={onVinInput}
            placeholder="1C4HJXDG2MW820338"
            maxLength={17}
            style={{
              ...v2InputStyle,
              fontFamily: 'var(--font-mono)',
              fontSize: 15,
              letterSpacing: '1.5px',
              paddingRight: 48,
              border: `1px solid ${canDecode ? 'var(--color-primary)' : 'var(--color-line-2)'}`,
              transition: 'border-color 0.15s',
            }}
          />
          {/* Character counter */}
          <span
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '1px',
              color: canDecode ? 'var(--color-primary)' : 'var(--color-text-mute)',
              pointerEvents: 'none',
              transition: 'color 0.15s',
            }}
          >
            {len}/17
          </span>
        </div>
      </V2Field>

      {/* Decode button */}
      <button
        type="button"
        onClick={onDecode}
        disabled={!canDecode}
        style={{
          height: 48,
          borderRadius: 12,
          background: canDecode
            ? 'var(--gradient-primary-button)'
            : 'var(--color-surface)',
          color: canDecode ? 'var(--color-ink)' : 'var(--color-text-mute)',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          border: canDecode ? 'none' : '1px solid var(--color-line-2)',
          cursor: canDecode ? 'pointer' : 'default',
          boxShadow: canDecode ? 'var(--shadow-primary-button)' : 'none',
          transition: 'all 0.15s',
        }}
      >
        Decode VIN
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--color-line-2)' }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '1.2px',
            color: 'var(--color-text-mute)',
            textTransform: 'uppercase',
          }}
        >
          or
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--color-line-2)' }} />
      </div>

      {/* Photograph affordance */}
      <button
        type="button"
        onClick={onPhoto}
        style={{
          height: 48,
          borderRadius: 12,
          background: 'transparent',
          border: '1px solid var(--color-line-3)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {isTouchDevice ? (
          /* Camera icon — touch/mobile: capture attribute opens the camera */
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        ) : (
          /* Image icon — desktop: capture attribute falls back to file picker */
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        )}
        {isTouchDevice ? 'Photograph the VIN plate' : 'Upload a VIN photo'}
      </button>
    </div>
  )
}

// ── Loading state ─────────────────────────────────────────────

function VinLoadingState({ label }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: '1px solid var(--color-line-2)',
        background: 'var(--color-surface)',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Pulsing ring */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '2px solid var(--color-line-3)',
          borderTopColor: 'var(--color-primary)',
          animation: 'vin-spin 0.9s linear infinite',
        }}
      />
      <style>{`@keyframes vin-spin { to { transform: rotate(360deg); } }`}</style>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '1.4px',
          color: 'var(--color-text-dim)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ── Error state ───────────────────────────────────────────────

function VinErrorState({ message, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          borderRadius: 14,
          border: '1px solid rgba(255,77,109,0.28)',
          background: 'rgba(255,77,109,0.07)',
          padding: '16px 18px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '1.4px',
            color: 'var(--color-danger)',
            textTransform: 'uppercase',
            margin: '0 0 5px',
          }}
        >
          Couldn't read VIN
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--color-text)',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onPrimary}
        style={{
          height: 44,
          borderRadius: 12,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-line-3)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        {primaryLabel}
      </button>

      <button
        type="button"
        onClick={onSecondary}
        style={{
          height: 36,
          borderRadius: 10,
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-mute)',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        {secondaryLabel}
      </button>
    </div>
  )
}

// ── Editable confirm card (post-decode) ───────────────────────

function ConfirmCard({
  vin, engine, bodyClass,
  cYear, onCYear, cMake, onCMake, cModel, onCModel,
  cTrim, onCTrim, cNickname, onCNickname, cMiles, onCMiles,
  onSave, onBack,
}) {
  // Auto-focus mileage the moment the confirm card mounts — it's the one field
  // the user actually has to fill (NHTSA already provided year/make/model/trim).
  const milesRef = useRef(null)
  useEffect(() => { milesRef.current?.focus() }, [])

  // Mileage is hard-required: the road-ahead engine needs current_mileage to be
  // meaningful. A vehicle saved at 0 miles produces a broken road-ahead.
  const canSave = cYear.trim() && cMake.trim() && cModel.trim() && cMiles.trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Decoded VIN badge */}
      <div
        style={{
          borderRadius: 12,
          background: 'var(--color-primary-dim)',
          border: '1px solid var(--color-primary-line)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            boxShadow: 'var(--shadow-primary-glow)',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '1.4px',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            VIN decoded
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '1px',
              color: 'var(--color-text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {vin}
          </div>
        </div>
        {engine && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '1px',
              color: 'var(--color-text-mute)',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {engine}
          </span>
        )}
      </div>

      {/* Editable fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <V2Field label="Year">
          <input
            type="text"
            inputMode="numeric"
            value={cYear}
            onChange={(e) => onCYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            style={{ ...v2InputStyle, fontFamily: 'var(--font-mono)' }}
          />
        </V2Field>
        <V2Field label="Make">
          <input
            type="text"
            value={cMake}
            onChange={(e) => onCMake(e.target.value)}
            placeholder="Jeep"
            style={v2InputStyle}
          />
        </V2Field>
      </div>

      <V2Field label="Model">
        <input
          type="text"
          value={cModel}
          onChange={(e) => onCModel(e.target.value)}
          placeholder="Wrangler"
          style={v2InputStyle}
        />
      </V2Field>

      <V2Field label="Trim" optional>
        <input
          type="text"
          value={cTrim}
          onChange={(e) => onCTrim(e.target.value)}
          placeholder="Unlimited Sport"
          style={v2InputStyle}
        />
      </V2Field>

      <V2Field
        label="Current mileage"
        prominent
        hint="Required for maintenance tracking"
      >
        <input
          ref={milesRef}
          type="text"
          inputMode="numeric"
          value={cMiles}
          onChange={(e) => onCMiles(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="42000"
          style={{ ...v2InputStyle, fontFamily: 'var(--font-mono)' }}
        />
      </V2Field>

      <V2Field label="Nickname" optional hint="How it shows up in your fleet">
        <input
          type="text"
          value={cNickname}
          onChange={(e) => onCNickname(e.target.value)}
          placeholder={cModel || 'e.g. The Commuter'}
          style={v2InputStyle}
        />
      </V2Field>

      {/* Body class context — display only, not saved */}
      {bodyClass && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '1px',
            color: 'var(--color-text-mute)',
            textTransform: 'uppercase',
            margin: '-4px 0 0',
          }}
        >
          {bodyClass}
        </p>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        style={{
          height: 52,
          borderRadius: 14,
          background: canSave ? 'var(--gradient-primary-button)' : 'var(--color-surface)',
          color: canSave ? 'var(--color-ink)' : 'var(--color-text-mute)',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          border: canSave ? 'none' : '1px solid var(--color-line-2)',
          cursor: canSave ? 'pointer' : 'default',
          boxShadow: canSave ? 'var(--shadow-primary-button)' : 'none',
          // Extra opacity in disabled state so the button reads as intentionally
          // inactive, not ambiguously dim.
          opacity: canSave ? 1 : 0.5,
          marginTop: 4,
          transition: 'background 0.2s, box-shadow 0.2s, opacity 0.2s',
        }}
      >
        Add vehicle
      </button>

      {/* Guidance caption — visible only while save is blocked by missing mileage.
          Neutral muted mono style (not amber/signal — this is guidance, not a warning).
          Mileage-specific messaging is correct: it's always the empty field here,
          since year/make/model arrive pre-filled from NHTSA. */}
      {!canSave && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '1.2px',
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            textAlign: 'center',
            margin: '-8px 0 0',
          }}
        >
          Enter current mileage to continue
        </p>
      )}

      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '1.2px',
          color: 'var(--color-text-mute)',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        ← Edit VIN
      </button>
    </div>
  )
}

// ── Manual mode form ──────────────────────────────────────────

function ManualModeView({
  year, onYear, make, onMake, model, onModel, trim, onTrim,
  nickname, onNickname, miles, onMiles, vin, onVin, plate, onPlate,
  onSave,
}) {
  const canSave = year && make.trim() && model.trim()

  const years = []
  const currentYear = new Date().getFullYear()
  for (let y = currentYear + 1; y >= 1990; y--) years.push(String(y))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <V2Field label="Year">
          <select
            value={year}
            onChange={(e) => onYear(e.target.value)}
            style={{ ...v2InputStyle, cursor: 'pointer' }}
          >
            {years.map((y) => (
              <option key={y} value={y} style={{ background: 'var(--color-surface-2)' }}>
                {y}
              </option>
            ))}
          </select>
        </V2Field>
        <V2Field label="Make">
          <input
            type="text"
            value={make}
            onChange={(e) => onMake(e.target.value)}
            placeholder="Toyota"
            style={v2InputStyle}
          />
        </V2Field>
      </div>

      <V2Field label="Model">
        <input
          type="text"
          value={model}
          onChange={(e) => onModel(e.target.value)}
          placeholder="Highlander"
          style={v2InputStyle}
        />
      </V2Field>

      <V2Field label="Trim" optional>
        <input
          type="text"
          value={trim}
          onChange={(e) => onTrim(e.target.value)}
          placeholder="XLE AWD"
          style={v2InputStyle}
        />
      </V2Field>

      <V2Field
        label="Current mileage"
        prominent
        optional
        hint="Needed for maintenance predictions"
      >
        <input
          type="text"
          inputMode="numeric"
          value={miles}
          onChange={(e) => onMiles(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="42000"
          style={{ ...v2InputStyle, fontFamily: 'var(--font-mono)' }}
        />
      </V2Field>

      <V2Field label="Nickname" optional hint="How it shows up in your fleet">
        <input
          type="text"
          value={nickname}
          onChange={(e) => onNickname(e.target.value)}
          placeholder={model || 'e.g. The Commuter'}
          style={v2InputStyle}
        />
      </V2Field>

      {/* Divider before optional identifiers */}
      <div style={{ height: 1, background: 'var(--color-line)', margin: '4px 0' }} />

      <V2Field label="VIN" optional hint="Enables precise vehicle matching on receipts">
        <input
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          value={vin}
          onChange={(e) => onVin(sanitizeVin(e.target.value))}
          placeholder="1C4HJXDG2MW820338"
          maxLength={17}
          style={{ ...v2InputStyle, fontFamily: 'var(--font-mono)', letterSpacing: '1px', fontSize: 13 }}
        />
      </V2Field>

      <V2Field label="License plate" optional>
        <input
          type="text"
          autoCapitalize="characters"
          value={plate}
          onChange={(e) => onPlate(e.target.value.toUpperCase())}
          placeholder="ABC 1234"
          style={{ ...v2InputStyle, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}
        />
      </V2Field>

      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        style={{
          height: 52,
          borderRadius: 14,
          background: canSave ? 'var(--gradient-primary-button)' : 'var(--color-surface)',
          color: canSave ? 'var(--color-ink)' : 'var(--color-text-mute)',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          border: canSave ? 'none' : '1px solid var(--color-line-2)',
          cursor: canSave ? 'pointer' : 'default',
          boxShadow: canSave ? 'var(--shadow-primary-button)' : 'none',
          marginTop: 4,
        }}
      >
        Add vehicle
      </button>
    </div>
  )
}
