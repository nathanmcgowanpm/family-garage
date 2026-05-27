/**
 * LoginScreen — OTP sign-in, v2 Arctic Signal tokens
 * ---------------------------------------------------
 * State machine:
 *   'entry'   — email input + "Send code" button (+ inline email errors)
 *   'sending' — spinner while signIn() is in-flight
 *   'verify'  — 6-digit code entry card; auto-submits on 6th digit
 *
 * OTP flow replaces magic-link flow. The session is established by
 * verifyOtp returning a session directly — Supabase fires SIGNED_IN via
 * onAuthStateChange internally, and the App.jsx listener re-renders to
 * <SignedInApp>. LoginScreen does nothing special on success; it simply
 * unmounts when user becomes non-null.
 *
 * ⚠️  REQUIRED DASHBOARD TASK (not a code task):
 *   Supabase dashboard → Authentication → Email Templates → "Magic Link"
 *   The template body must surface {{ .Token }} (the 6-digit code) and
 *   should NOT include the magic link href — otherwise Supabase still
 *   sends a clickable link that strands mobile sessions in Gmail's
 *   in-app WebView. This is a Supabase dashboard edit, not in the repo.
 *
 * Token migration: all tokens migrated to v2 Arctic Signal:
 *   --color-bg-base      → --color-ink
 *   --color-bg-surface   → --color-surface
 *   --color-accent       → --color-primary
 *   --color-text-primary → --color-text
 *   --color-text-secondary → --color-text-dim
 *   --color-text-tertiary  → --color-text-mute
 *   --color-border-subtle  → --color-line-2
 *   --color-status-danger  → --color-danger
 *   --glow-accent          → --shadow-primary-button
 */

import { useEffect, useRef, useState } from 'react'
import { useAuth } from './hooks/useAuth'

function Icon({ name, style = {} }) {
  return <span className="msym" style={style}>{name}</span>
}

export default function LoginScreen() {
  const { signIn, verifyOtp } = useAuth()

  // ── Email-entry state ──────────────────────────────────────
  const [email,      setEmail]      = useState('')
  const [state,      setState]      = useState('entry') // 'entry' | 'sending' | 'verify'
  const [emailError, setEmailError] = useState('')

  // ── Verify-card state ──────────────────────────────────────
  const [code,      setCode]      = useState('')
  const [codeError, setCodeError] = useState('')
  const [verifying, setVerifying] = useState(false)  // true while verifyOtp in-flight
  const [cooldown,  setCooldown]  = useState(0)      // seconds until resend re-enables

  // Countdown tick — decrements cooldown by 1s until 0
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  // ── Handlers ──────────────────────────────────────────────

  async function handleSubmit() {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError('Please enter a valid email address.')
      return
    }
    setState('sending')
    setEmailError('')

    const { error } = await signIn(trimmed)
    if (error) {
      setEmailError(error.message || 'Something went wrong — please try again.')
      setState('entry')
    } else {
      setCode('')
      setCodeError('')
      setState('verify')
      setCooldown(30)  // 30s resend cooldown
    }
  }

  async function handleVerify(codeToVerify) {
    setVerifying(true)
    setCodeError('')

    const { error } = await verifyOtp(email.trim(), codeToVerify)
    if (error) {
      setVerifying(false)
      const msg = error.message?.toLowerCase() ?? ''
      setCodeError(
        msg.includes('expired')
          ? 'That code expired — request a new one.'
          : "That code didn't match — check it and try again.",
      )
      // Code stays visible — user can correct in-place; auto-submits again on 6 digits
    }
    // On success: verifyOtp fires SIGNED_IN → onAuthStateChange → App re-renders
    // LoginScreen unmounts automatically — nothing to do here
  }

  // Strip non-digits, cap at 6, auto-submit on 6th digit
  function handleCodeChange(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 6)
    setCode(digits)
    if (digits.length === 6 && !verifying) {
      handleVerify(digits)
    }
  }

  function resetToEntry() {
    setState('entry')
    setEmailError('')
    setCode('')
    setCodeError('')
    setVerifying(false)
    setCooldown(0)
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-ink)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        position: 'relative',
      }}
    >
      {/* Ambient cyan glow backdrop */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(61,214,255,0.07), transparent 70%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {/* Wordmark */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 32,
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: 'var(--color-text)' }}>Family </span>
          <span style={{ color: 'var(--color-primary)' }}>Garage</span>
        </div>

        {state === 'entry'   && (
          <EntryCard
            email={email}
            setEmail={setEmail}
            onSubmit={handleSubmit}
            errorMsg={emailError}
          />
        )}
        {state === 'sending' && <SendingCard email={email} />}
        {state === 'verify'  && (
          <VerifyCard
            email={email}
            code={code}
            onCodeChange={handleCodeChange}
            codeError={codeError}
            verifying={verifying}
            cooldown={cooldown}
            onResend={handleSubmit}
            onReset={resetToEntry}
          />
        )}
      </div>

      {/* Footer tagline */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 32,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--color-text-mute)',
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
        }}
      >
        Your vehicles. Your data.
      </div>
    </div>
  )
}

// ─── Entry card ───────────────────────────────────────────────
// Email input + "Send code" button. Also shows inline email errors.

function EntryCard({ email, setEmail, onSubmit, errorMsg }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter') onSubmit()
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-line-2)',
        borderRadius: 20,
        padding: '28px 24px',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          margin: '0 0 10px',
          color: 'var(--color-text)',
          lineHeight: 1.15,
        }}
      >
        Sign in to your{' '}
        <span style={{ color: 'var(--color-primary)' }}>garage.</span>
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--color-text-dim)',
          margin: '0 0 24px',
          lineHeight: 1.5,
        }}
      >
        Enter your email and we'll send a 6-digit code. No password needed.
      </p>

      {/* Email label */}
      <label
        style={{
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          fontWeight: 600,
          color: 'var(--color-text-mute)',
          textTransform: 'uppercase',
          letterSpacing: '1.3px',
          marginBottom: 6,
        }}
      >
        Email
      </label>

      {/* Email input */}
      <input
        type="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="you@example.com"
        style={{
          width: '100%',
          background: 'var(--color-surface-2)',
          border: `1px solid ${errorMsg ? 'var(--color-danger)' : 'var(--color-line-2)'}`,
          borderRadius: 12,
          padding: '13px 15px',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          outline: 'none',
          boxSizing: 'border-box',
          marginBottom: errorMsg ? 6 : 16,
          transition: 'border-color 0.15s',
        }}
      />

      {errorMsg && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-danger)',
            margin: '0 0 16px',
            lineHeight: 1.4,
          }}
        >
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={onSubmit}
        style={{
          width: '100%',
          height: 52,
          background: 'var(--gradient-primary-button)',
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          border: 'none',
          borderRadius: 14,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-primary-button)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Icon name="mail" style={{ fontSize: 18 }} />
        Send code
      </button>
    </div>
  )
}

// ─── Sending card ─────────────────────────────────────────────
// Spinner shown while signIn() is in-flight.

function SendingCard({ email }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-line-2)',
        borderRadius: 20,
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '2px solid var(--color-line-3)',
          borderTopColor: 'var(--color-primary)',
          animation: 'login-spin 0.9s linear infinite',
          margin: '0 auto 20px',
        }}
      />
      <style>{`@keyframes login-spin { to { transform: rotate(360deg); } }`}</style>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 700,
          margin: '0 0 8px',
          color: 'var(--color-text)',
        }}
      >
        Sending your code…
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--color-text-dim)',
          margin: 0,
        }}
      >
        Sending to{' '}
        <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>{email}</strong>
      </p>
    </div>
  )
}

// ─── Verify card ──────────────────────────────────────────────
// Code entry. Auto-submits on 6th digit. Paste-friendly.
// Resend has a 30s cooldown. "Use a different email" resets to entry.

function VerifyCard({ email, code, onCodeChange, codeError, verifying, cooldown, onResend, onReset }) {
  const inputRef = useRef(null)

  // Auto-focus the code input when the verify card mounts.
  // The user just submitted their email — the code field is their only task.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleChange(e) {
    onCodeChange(e.target.value)
  }

  // Paste handler: strip whitespace + non-digits, take first 6.
  // This is the core use-case: user copies code from Gmail, pastes
  // into the browser they're already in — the whole point of OTP.
  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onCodeChange(pasted)
  }

  const canResend = cooldown <= 0 && !verifying

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-line-2)',
        borderRadius: 20,
        padding: '28px 24px',
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--color-primary-dim)',
          border: '1px solid var(--color-primary-line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        <Icon name="mark_email_read" style={{ color: 'var(--color-primary)', fontSize: 22 }} />
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.3px',
          margin: '0 0 8px',
          color: 'var(--color-text)',
        }}
      >
        Enter your code
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--color-text-dim)',
          margin: '0 0 24px',
          lineHeight: 1.5,
        }}
      >
        We sent a 6-digit code to{' '}
        <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>{email}</strong>.
        Enter it below.
      </p>

      {/* Code label */}
      <label
        style={{
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          fontWeight: 600,
          color: 'var(--color-text-mute)',
          textTransform: 'uppercase',
          letterSpacing: '1.3px',
          marginBottom: 6,
        }}
      >
        6-digit code
      </label>

      {/* Code input */}
      <div style={{ position: 'relative', marginBottom: codeError ? 6 : 20 }}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"  // triggers iOS/Android OTP autofill from email
          value={code}
          onChange={handleChange}
          onPaste={handlePaste}
          maxLength={6}
          placeholder="000000"
          disabled={verifying}
          style={{
            width: '100%',
            background: codeError ? 'rgba(255,77,109,0.06)' : 'var(--color-surface-2)',
            border: `1px solid ${
              codeError
                ? 'var(--color-danger)'
                : verifying
                  ? 'var(--color-primary-line)'
                  : 'var(--color-line-2)'
            }`,
            borderRadius: 14,
            padding: '18px 16px',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 32,
            letterSpacing: '10px',
            textAlign: 'center',
            fontVariantNumeric: 'tabular-nums',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: verifying ? 0.6 : 1,
            transition: 'border-color 0.15s, background 0.15s, opacity 0.15s',
          }}
        />
        {/* Inline verifying spinner — right-anchored inside the input */}
        {verifying && (
          <div
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: '2px solid var(--color-line-3)',
              borderTopColor: 'var(--color-primary)',
              animation: 'login-spin 0.9s linear infinite',
            }}
          />
        )}
      </div>

      {/* Inline code error — wrong/expired code feedback */}
      {codeError && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-danger)',
            margin: '0 0 20px',
            lineHeight: 1.4,
          }}
        >
          {codeError}
        </p>
      )}

      {/* Secondary actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {/* Resend — disabled for 30s after each send; shows live countdown */}
        <button
          onClick={onResend}
          disabled={!canResend}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            color: canResend ? 'var(--color-primary)' : 'var(--color-text-mute)',
            cursor: canResend ? 'pointer' : 'default',
            padding: '8px 16px',
            transition: 'color 0.2s',
          }}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>

        <button
          onClick={onReset}
          disabled={verifying}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--color-text-mute)',
            cursor: verifying ? 'default' : 'pointer',
            padding: '4px 16px',
          }}
        >
          Use a different email
        </button>
      </div>
    </div>
  )
}
