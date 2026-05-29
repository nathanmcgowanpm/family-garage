/**
 * OnboardingScreen — 2-step first-run wizard (v2 Arctic Signal)
 * ---------------------------------------------------------------
 * Step 1: Add vehicle  — uses <AddVehicleForm> (VIN-first, shared component)
 * Step 2: Current mileage
 *
 * Changes from the legacy version:
 *   - Step 3 ("Stay in the loop" — phantom notification toggles) removed.
 *   - Step 1 now uses <AddVehicleForm showPlateMode={false} collectMileage={false}>
 *     instead of a hand-rolled manual-only form. VIN decode is available first-run.
 *   - "Skip for now" button removed (App.jsx never passes onSkip; it was broken).
 *   - Progress indicator updated to "STEP X OF 2".
 *   - All legacy tokens migrated to v2 Arctic Signal.
 */

import { useState } from 'react'
import AddVehicleForm from './components/AddVehicleForm'

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1)
  // vehicleFields is set by AddVehicleForm.onSubmit in step 1.
  // It holds { year, make, model, trim, nickname, vin, license_plate, current_mileage }.
  const [vehicleFields, setVehicleFields] = useState(null)
  const [miles, setMiles] = useState('')

  // Step 1: AddVehicleForm calls onSubmit → store fields → advance to step 2.
  function handleStep1(vehicleData) {
    setVehicleFields(vehicleData)
    setStep(2)
  }

  // Step 2 gate — mileage is load-bearing: the maintenance engine needs a real starting
  // point. We require at least one non-zero digit before enabling "Finish setup".
  // This matches the ConfirmCard canSave pattern in AddVehicleForm.
  const canFinish = miles.trim().length > 0 && parseInt(miles.replace(/[^0-9]/g, ''), 10) > 0

  // Step 2: user clicks "Finish setup" → merge miles into vehicleFields → notify parent.
  // The canFinish guard here is a second line of defence; the disabled button is the
  // primary UX barrier.
  function handleFinish() {
    if (!canFinish) return
    onComplete({
      year:          vehicleFields?.year,
      make:          vehicleFields?.make          || '',
      model:         vehicleFields?.model         || '',
      trim:          vehicleFields?.trim          || null,
      nickname:      vehicleFields?.nickname      || null,
      vin:           vehicleFields?.vin           || null,
      license_plate: vehicleFields?.license_plate || null,
      miles,
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-ink)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(61,214,255,0.06), transparent 70%)',
        }}
      />

      {/* Header: wordmark */}
      <header
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '32px 24px 24px',
          maxWidth: 560,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: 'var(--color-text)' }}>Family </span>
          <span style={{ color: 'var(--color-primary)' }}>Garage</span>
        </div>
      </header>

      {/* Progress bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 560,
          margin: '0 auto',
          width: '100%',
          padding: '0 24px',
        }}
      >
        <ProgressIndicator step={step} total={2} />
      </div>

      {/* Main content */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
          padding: '32px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {step === 1 && (
          <AddVehicleForm
            onSubmit={handleStep1}
            showPlateMode={false}
            submitLabel="Continue"
            collectMileage={false}
          />
        )}
        {step === 2 && <StepMileage miles={miles} onChange={setMiles} />}
      </main>

      {/* Footer — only shown on step 2 */}
      {step === 2 && (
        <footer
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '24px',
            borderTop: '1px solid var(--color-line-2)',
            background: 'var(--color-ink)',
          }}
        >
          <div
            style={{
              maxWidth: 560,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {/* Button row */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-line-2)',
                  color: 'var(--color-text-dim)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '14px 24px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span className="msym" style={{ fontSize: 18 }}>arrow_back</span>
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!canFinish}
                style={{
                  flex: 1,
                  background: canFinish ? 'var(--gradient-primary-button)' : 'var(--color-surface)',
                  color: canFinish ? 'var(--color-ink)' : 'var(--color-text-mute)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '14px 24px',
                  borderRadius: 12,
                  border: canFinish ? 'none' : '1px solid var(--color-line-2)',
                  cursor: canFinish ? 'pointer' : 'default',
                  boxShadow: canFinish ? 'var(--shadow-primary-button)' : 'none',
                  opacity: canFinish ? 1 : 0.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'background 0.2s, box-shadow 0.2s, opacity 0.2s',
                }}
              >
                Finish setup
                <span className="msym" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
            </div>

            {/* Guidance caption — same pattern as ConfirmCard in AddVehicleForm */}
            {!canFinish && (
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '1.2px',
                  color: 'var(--color-primary)',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  margin: '10px 0 0',
                }}
              >
                Enter current mileage to continue
              </p>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}

// ─── Progress indicator ───────────────────────────────────────

function ProgressIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-primary)',
            letterSpacing: '0.15em',
            fontWeight: 600,
          }}
        >
          STEP {step} OF {total}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-mute)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round((step / total) * 100)}%
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 4,
          height: 3,
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < step
          const current = i === step - 1
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: '100%',
                background: filled ? 'var(--color-primary)' : 'var(--color-surface)',
                borderRadius: 9999,
                boxShadow: current ? 'var(--shadow-primary-glow)' : 'none',
                transition: 'all 0.15s ease-out',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 2: Mileage ──────────────────────────────────────────

function StepMileage({ miles, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            margin: '0 0 8px',
            color: 'var(--color-text)',
          }}
        >
          Current mileage
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-text-dim)',
            margin: 0,
            maxWidth: 420,
            lineHeight: 1.5,
          }}
        >
          Check your odometer. This is the starting point for your maintenance timeline.
        </p>
      </div>

      {/* Odometer input */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-line-2)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center' }}>
          <span className="msym" style={{ color: 'var(--color-primary)', fontSize: 22 }}>
            speed
          </span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={miles}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
          placeholder="Odometer reading"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            fontWeight: 600,
            padding: '12px 0',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
          }}
        />
        <span
          style={{
            padding: '0 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-mute)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          mi
        </span>
      </div>

      {/* Helpful context card */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-line-2)',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <span
          className="msym"
          style={{ color: 'var(--color-primary)', fontSize: 20, flexShrink: 0, marginTop: 2 }}
        >
          lightbulb
        </span>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 13,
              margin: '0 0 4px',
              color: 'var(--color-text)',
            }}
          >
            Not sure?
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'var(--color-text-dim)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Your odometer is on the dashboard near the speedometer. You can always update
            this later from your garage.
          </p>
        </div>
      </div>
    </div>
  )
}
