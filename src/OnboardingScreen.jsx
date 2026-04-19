/**
 * OnboardingScreen — 3-step wizard
 * ---------------------------------
 * Step 1: Vehicle identity (year, make, model, nickname)
 * Step 2: Current mileage
 * Step 3: Notification preferences
 *
 * All steps skippable via "Skip for now" link.
 * Lives full-bleed (no sidebar) — this is the first-run experience.
 */

import { useState } from 'react'

function Icon({ name, fill = false, style = {} }) {
  return (
    <span className={`msym ${fill ? 'msym-fill' : ''}`} style={style}>
      {name}
    </span>
  )
}

export default function OnboardingScreen({ onComplete, onSkip }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    year: '2024',
    make: '',
    model: '',
    nickname: '',
    miles: '',
    notifServiceReminders: true,
    notifRecalls: true,
    notifEmail: false,
  })

  const update = (patch) => setData((d) => ({ ...d, ...patch }))

  const handleFinish = () => {
    onComplete({
      year: data.year,
      make: data.make || 'Toyota',
      model: data.model || 'Highlander',
      miles: data.miles || '42000',
      nickname: data.nickname,
      preferences: {
        serviceReminders: data.notifServiceReminders,
        recalls: data.notifRecalls,
        email: data.notifEmail,
      },
    })
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else handleFinish()
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
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
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0, 212, 255, 0.06), transparent 70%)',
        }}
      />

      {/* Header: wordmark + progress */}
      <header
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '32px 24px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          <span style={{ color: 'var(--color-text-primary)' }}>Family </span>
          <span style={{ color: 'var(--color-accent)' }}>Garage</span>
        </div>
        <button
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Skip for now
        </button>
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
        <ProgressIndicator step={step} total={3} />
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
          padding: '40px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {step === 1 && <StepVehicle data={data} update={update} />}
        {step === 2 && <StepMileage data={data} update={update} />}
        {step === 3 && <StepPreferences data={data} update={update} />}
      </main>

      {/* Footer: back/next */}
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '24px',
          borderTop: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-base)',
        }}
      >
        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
            display: 'flex',
            gap: 'var(--space-3)',
            alignItems: 'center',
          }}
        >
          {step > 1 ? (
            <button
              onClick={handleBack}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                padding: '14px 24px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <Icon name="arrow_back" style={{ fontSize: 18 }} />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              background: 'var(--color-accent)',
              color: 'var(--color-text-inverse)',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              padding: '14px 24px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--glow-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {step === 3 ? 'Finish setup' : 'Continue'}
            <Icon name="arrow_forward" style={{ fontSize: 18 }} />
          </button>
        </div>
      </footer>
    </div>
  )
}

// ─── Progress indicator ───────────────────────────────────────

function ProgressIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
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
            fontSize: 'var(--text-xs)',
            color: 'var(--color-accent)',
            letterSpacing: '0.15em',
            fontWeight: 600,
          }}
        >
          STEP {step} OF {total}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
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
                background: filled ? 'var(--color-accent)' : 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-full)',
                boxShadow: current ? 'var(--glow-accent-sm)' : 'none',
                transition: 'all var(--duration-base) var(--ease-out)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 1: Vehicle ──────────────────────────────────────────

function StepVehicle({ data, update }) {
  const years = []
  const currentYear = new Date().getFullYear()
  for (let y = currentYear + 1; y >= 1990; y--) years.push(y.toString())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <StepHeader
        title="Your vehicle"
        subtitle="Tell us what you drive. We'll use this to tailor your maintenance schedule."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <Field label="Year">
          <select
            value={data.year}
            onChange={(e) => update({ year: e.target.value })}
            style={inputStyle}
          >
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
            value={data.make}
            onChange={(e) => update({ make: e.target.value })}
            placeholder="Toyota"
            style={inputStyle}
          />
        </Field>
      </div>

      <Field label="Model">
        <input
          type="text"
          value={data.model}
          onChange={(e) => update({ model: e.target.value })}
          placeholder="Highlander"
          style={inputStyle}
        />
      </Field>

      <Field
        label="Nickname"
        hint="How you'll see it in your fleet — e.g. 'The Commuter', 'Dad's Car'"
      >
        <input
          type="text"
          value={data.nickname}
          onChange={(e) => update({ nickname: e.target.value })}
          placeholder={data.model || 'Nickname (optional)'}
          style={inputStyle}
        />
      </Field>
    </div>
  )
}

// ─── Step 2: Mileage ──────────────────────────────────────────

function StepMileage({ data, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <StepHeader
        title="Current mileage"
        subtitle="Check your odometer. This is the starting point for your maintenance timeline."
      />

      <Field label="Odometer reading">
        <div
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon name="speed" style={{ color: 'var(--color-accent)', fontSize: 22 }} />
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={data.miles}
            onChange={(e) => {
              // Strip non-digits for clean numeric input
              const v = e.target.value.replace(/[^\d]/g, '')
              update({ miles: v })
            }}
            placeholder="42,000"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xl)',
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
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            mi
          </span>
        </div>
      </Field>

      {/* Helpful context card */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'flex-start',
        }}
      >
        <Icon
          name="lightbulb"
          style={{ color: 'var(--color-accent)', fontSize: 20, flexShrink: 0, marginTop: 2 }}
        />
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              margin: '0 0 4px',
              color: 'var(--color-text-primary)',
            }}
          >
            Not sure?
          </p>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Your odometer is on the dashboard near the speedometer. You can always update this
            later from your garage.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Preferences ──────────────────────────────────────

function StepPreferences({ data, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <StepHeader
        title="Stay in the loop"
        subtitle="Choose what you want to be notified about. You can change these anytime."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <ToggleRow
          icon="build"
          label="Service reminders"
          description="Get a heads-up when scheduled maintenance is approaching."
          value={data.notifServiceReminders}
          onChange={(v) => update({ notifServiceReminders: v })}
        />
        <ToggleRow
          icon="error"
          label="Recall alerts"
          description="Be notified immediately when a safety recall is issued for your vehicle."
          value={data.notifRecalls}
          onChange={(v) => update({ notifRecalls: v })}
          recommended
        />
        <ToggleRow
          icon="mail"
          label="Email summaries"
          description="Monthly summary of your vehicle's health and upcoming services."
          value={data.notifEmail}
          onChange={(v) => update({ notifEmail: v })}
        />
      </div>
    </div>
  )
}

// ─── Shared UI pieces ─────────────────────────────────────────

function StepHeader({ title, subtitle }) {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          margin: '0 0 8px',
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-secondary)',
          margin: 0,
          maxWidth: 420,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>
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
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
            margin: '6px 0 0',
            lineHeight: 1.4,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

function ToggleRow({ icon, label, description, value, onChange, recommended }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        background: value ? 'var(--color-accent-bg)' : 'var(--color-bg-surface)',
        border: `1px solid ${value ? 'var(--color-border-accent)' : 'var(--color-border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all var(--duration-base) var(--ease-out)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: value ? 'var(--color-accent-bg)' : 'var(--color-bg-inset)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon
          name={icon}
          style={{
            color: value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            fontSize: 20,
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
            }}
          >
            {label}
          </span>
          {recommended && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.1em',
                color: 'var(--color-accent)',
                background: 'var(--color-accent-bg)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Recommended
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>
      <div style={{ flexShrink: 0 }}>
        <Toggle value={value} />
      </div>
    </button>
  )
}

function Toggle({ value }) {
  return (
    <div
      style={{
        width: 40,
        height: 24,
        borderRadius: 'var(--radius-full)',
        background: value ? 'var(--color-accent)' : 'var(--color-bg-inset)',
        border: `1px solid ${value ? 'var(--color-accent)' : 'var(--color-border-default)'}`,
        position: 'relative',
        transition: 'all var(--duration-base) var(--ease-out)',
        boxShadow: value ? 'var(--glow-accent-sm)' : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: value ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: value ? 'var(--color-bg-base)' : 'var(--color-text-tertiary)',
          transition: 'left var(--duration-base) var(--ease-out)',
        }}
      />
    </div>
  )
}

// ─── Shared input style ───────────────────────────────────────

const inputStyle = {
  width: '100%',
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: '14px 16px',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-base)',
  fontWeight: 500,
  outline: 'none',
  appearance: 'none',
}
