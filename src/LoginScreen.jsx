/**
 * LoginScreen — magic link sign-in
 * ---------------------------------
 * Three states:
 *   1. 'entry'   — email input + "Send magic link" button
 *   2. 'sending' — loading state while the request is in flight
 *   3. 'sent'    — "Check your email" confirmation, with resend option
 *
 * Matches the Family Garage cyan aesthetic. Full-bleed, no chrome.
 */

import { useState } from 'react'
import { useAuth } from './hooks/useAuth'

function Icon({ name, style = {} }) {
  return <span className="msym" style={style}>{name}</span>
}

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [state, setState] = useState('entry')  // entry | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit() {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      setState('error')
      return
    }

    setState('sending')
    setErrorMsg('')

    const { error } = await signIn(trimmed)

    if (error) {
      setErrorMsg(error.message || 'Something went wrong. Please try again.')
      setState('error')
    } else {
      setState('sent')
    }
  }

  function resetToEntry() {
    setState('entry')
    setErrorMsg('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && state === 'entry') {
      handleSubmit()
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Ambient glow backdrop */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0, 212, 255, 0.08), transparent 70%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 440,
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: 'var(--color-text-primary)' }}>Family </span>
          <span style={{ color: 'var(--color-accent)' }}>Garage</span>
        </div>

        {state === 'entry' || state === 'error' ? (
          <EntryCard
            email={email}
            setEmail={setEmail}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            errorMsg={state === 'error' ? errorMsg : ''}
          />
        ) : state === 'sending' ? (
          <SendingCard email={email} />
        ) : (
          <SentCard email={email} onResetToEntry={resetToEntry} onResend={handleSubmit} />
        )}
      </div>

      {/* Footer tagline */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 'var(--space-8)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Your vehicles. Your data.
      </div>
    </div>
  )
}

// ─── Entry state ──────────────────────────────────────────────

function EntryCard({ email, setEmail, onSubmit, onKeyDown, errorMsg }) {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          margin: '0 0 12px',
          textAlign: 'center',
          lineHeight: 1.1,
          color: 'var(--color-text-primary)',
        }}
      >
        Sign in to your garage
      </h1>
      <p
        style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-base)',
          margin: '0 0 var(--space-6)',
          lineHeight: 1.5,
        }}
      >
        Enter your email. We'll send you a magic link to sign in instantly — no password needed.
      </p>

      {/* Email input */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
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
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="you@example.com"
          style={{
            width: '100%',
            background: 'var(--color-bg-surface)',
            border: `1px solid ${errorMsg ? 'var(--color-status-danger)' : 'var(--color-border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            outline: 'none',
          }}
        />
        {errorMsg && (
          <p
            style={{
              color: 'var(--color-status-danger)',
              fontSize: 'var(--text-sm)',
              margin: '8px 0 0',
            }}
          >
            {errorMsg}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={onSubmit}
        style={{
          width: '100%',
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
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <Icon name="mail" style={{ fontSize: 18 }} />
        Send magic link
      </button>
    </div>
  )
}

// ─── Sending state ────────────────────────────────────────────

function SendingCard({ email }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--color-accent-bg)',
          border: '1px solid var(--color-border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
        }}
      >
        <Icon
          name="autorenew"
          style={{
            color: 'var(--color-accent)',
            fontSize: 26,
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          margin: '0 0 8px',
          color: 'var(--color-text-primary)',
        }}
      >
        Sending your link…
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', margin: 0 }}>
        Sending to <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ─── Sent state ───────────────────────────────────────────────

function SentCard({ email, onResetToEntry, onResend }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--color-accent-bg)',
          border: '1px solid var(--color-border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          boxShadow: 'var(--glow-accent)',
        }}
      >
        <Icon name="mark_email_read" style={{ color: 'var(--color-accent)', fontSize: 26 }} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          margin: '0 0 12px',
          color: 'var(--color-text-primary)',
        }}
      >
        Check your email
      </h1>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-base)',
          margin: '0 0 var(--space-6)',
          lineHeight: 1.5,
        }}
      >
        We sent a magic link to <br />
        <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
        <br />
        Click the link to sign in.
      </p>

      {/* Secondary actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onResend}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 16px',
          }}
        >
          Resend link
        </button>
        <button
          onClick={onResetToEntry}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            padding: '8px 16px',
          }}
        >
          Use a different email
        </button>
      </div>

      {/* Helper */}
      <p
        style={{
          marginTop: 'var(--space-6)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)',
          lineHeight: 1.5,
        }}
      >
        Didn't get it? Check your spam folder, or wait a minute and try again.
      </p>
    </div>
  )
}
