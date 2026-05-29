/**
 * AddVehicleForm — VIN-first add-vehicle flow
 * -------------------------------------------
 * Shared between VehicleSheet (add view) and OnboardingScreen (step 1).
 *
 * Props:
 *   onSubmit(vehicleData)   — called when user saves; vehicleData has the shape
 *                             { year, make, model, trim, nickname, vin,
 *                               license_plate, current_mileage }
 *   showPlateMode (bool)    — show the disabled "Plate" pill in the mode switcher.
 *                             Default true. Pass false in OnboardingScreen to keep
 *                             the switcher tight.
 *   submitLabel (string)    — text on the save CTA. Default "Add vehicle".
 *                             Pass "Continue" in OnboardingScreen step 1.
 *   collectMileage (bool)   — show the mileage field and require it (ConfirmCard),
 *                             or show it as optional (ManualModeView). Default true.
 *                             Pass false in OnboardingScreen step 1 — mileage is
 *                             collected separately in step 2.
 *
 * Design tokens: v2 Arctic Signal throughout (--color-primary, --color-surface, etc.)
 *
 * Extracted from VehicleSheet.jsx (Phase 4 Step 2).
 * Parameterised for OnboardingScreen reuse.
 */

import { useEffect, useRef, useState } from 'react'

// Good-enough touch/mobile check — evaluated once at module load.
// navigator.maxTouchPoints > 0 covers all modern iOS/Android devices.
// Failure mode is harmless: a touchscreen laptop sees "Photograph" but gets
// a file picker — a mild label mismatch, not a broken flow.
const isTouchDevice =
  typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0

// Convert ALL-CAPS NHTSA make to Title Case for display and persistence.
// Word-by-word: each word (split on space/hyphen) is capitalised.
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

// ─── Main export ──────────────────────────────────────────────

export default function AddVehicleForm({
  onSubmit,
  showPlateMode = true,
  submitLabel = 'Add vehicle',
  collectMileage = true,
}) {
  // ── Mode ──────────────────────────────────────────────────
  const [inputMode, setInputMode] = useState('vin') // 'vin' | 'manual'

  // ── VIN-mode state ────────────────────────────────────────
  const [vinText,  setVinText]  = useState('')
  const [vinPhase, setVinPhase] = useState('idle')
  // 'idle' | 'extracting' | 'decoding' | 'decoded'
  // | 'extract-error' | 'decode-error'
  const [decoded,  setDecoded]  = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

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
      current_mileage: collectMileage
        ? (parseInt(cMiles.replace(/[^0-9]/g, ''), 10) || 0)
        : 0,
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
      current_mileage: collectMileage
        ? (parseInt(mMiles.replace(/[^0-9]/g, ''), 10) || 0)
        : 0,
    })
  }

  // Build mode list based on showPlateMode
  const modes = [
    { id: 'vin',    label: 'VIN',    disabled: false },
    { id: 'manual', label: 'Manual', disabled: false },
    ...(showPlateMode ? [{ id: 'plate', label: 'Plate', disabled: true }] : []),
  ]

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Mode switcher — VIN / MANUAL / PLATE (optional) */}
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
        {modes.map(({ id, label, disabled }) => {
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

          {vinPhase === 'idle' && (
            <VinIdleState
              vinText={vinText}
              onVinInput={handleVinInput}
              onDecode={() => decodeVin(vinText)}
              onPhoto={() => photoRef.current?.click()}
            />
          )}

          {vinPhase === 'extracting' && (
            <VinLoadingState label="Reading VIN from photo…" />
          )}

          {vinPhase === 'decoding' && (
            <VinLoadingState label="Decoding with NHTSA…" />
          )}

          {vinPhase === 'decoded' && decoded && (
            <ConfirmCard
              vin={decoded.vin}
              engine={decoded.engine}
              bodyClass={decoded.bodyClass}
              cYear={cYear}         onCYear={setCYear}
              cMake={cMake}         onCMake={setCMake}
              cModel={cModel}       onCModel={setCModel}
              cTrim={cTrim}         onCTrim={setCTrim}
              cNickname={cNickname} onCNickname={setCNickname}
              cMiles={cMiles}       onCMiles={setCMiles}
              onSave={handleConfirmSave}
              onBack={resetVin}
              submitLabel={submitLabel}
              collectMileage={collectMileage}
            />
          )}

          {vinPhase === 'extract-error' && (
            <VinErrorState
              message={errorMsg}
              primaryLabel="Try another photo"
              onPrimary={() => { setVinPhase('idle'); photoRef.current?.click() }}
              secondaryLabel="Type VIN instead"
              onSecondary={() => setVinPhase('idle')}
            />
          )}

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
          year={mYear}         onYear={setMYear}
          make={mMake}         onMake={setMMake}
          model={mModel}       onModel={setMModel}
          trim={mTrim}         onTrim={setMTrim}
          nickname={mNickname} onNickname={setMNickname}
          miles={mMiles}       onMiles={setMMiles}
          vin={mVin}           onVin={setMVin}
          plate={mPlate}       onPlate={setMPlate}
          onSave={handleManualSave}
          submitLabel={submitLabel}
          collectMileage={collectMileage}
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
  onSave, onBack, submitLabel, collectMileage,
}) {
  // Auto-focus mileage on mount when collectMileage=true — it's the one field
  // the user has to fill (NHTSA already provided year/make/model/trim).
  // When collectMileage=false, milesRef won't be attached to any DOM element
  // (the input isn't rendered), so ?.focus() is a safe no-op.
  const milesRef = useRef(null)
  useEffect(() => { milesRef.current?.focus() }, [])

  // Mileage is hard-required when collectMileage=true: the road-ahead engine
  // needs current_mileage to be meaningful. When collectMileage=false (onboarding
  // step 1), mileage is collected separately in step 2.
  const canSave =
    cYear.trim() && cMake.trim() && cModel.trim() &&
    (collectMileage ? Boolean(cMiles.trim()) : true)

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

      {/* Mileage — only when collectMileage=true */}
      {collectMileage && (
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
      )}

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
        {submitLabel}
      </button>

      {/* Guidance caption — only when collectMileage=true and save is blocked.
          Primary color (cyan) signals "do this to proceed", not an error warning. */}
      {collectMileage && !canSave && (
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
  onSave, submitLabel, collectMileage,
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

      {/* Mileage — optional in manual mode, hidden when collectMileage=false */}
      {collectMileage && (
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
      )}

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
        {submitLabel}
      </button>
    </div>
  )
}
