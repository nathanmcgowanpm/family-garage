/**
 * AccountMenu — account dropdown
 * -------------------------------
 * Shows:
 *   1. User email
 *   2. Forwarding address (with copy button)
 *   3. Notification preferences (3 toggles, synced to user_profiles)
 *   4. "Manage vehicles" link (opens VehicleSheet via callback)
 *   5. Sign out
 *
 * Anchored to the right edge of the viewport. Closes on
 * outside-click or Escape.
 */

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

function Icon({ name, fill = false, style = {} }) {
  return <span className={`msym ${fill ? 'msym-fill' : ''}`} style={style}>{name}</span>
}

export default function AccountMenu({ user, onSignOut, onClose, onManageVehicles }) {
  const menuRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) setProfile(data)
      setLoading(false)
    }
    loadProfile()
  }, [user.id])

  // Close on outside-click or Escape
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    document.addEventListener('keydown', handleEscape)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  async function updatePreference(field, value) {
    setProfile((p) => ({ ...p, [field]: value }))
    await supabase.from('user_profiles').update({ [field]: value }).eq('id', user.id)
  }

  async function copyForwardingEmail() {
    if (!profile?.forwarding_email_alias) return
    const fullEmail = `${profile.forwarding_email_alias}@inbox.familygarage.ai`
    try {
      await navigator.clipboard.writeText(fullEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard failed', err)
    }
  }

  const forwardingEmail = profile?.forwarding_email_alias
    ? `${profile.forwarding_email_alias}@inbox.familygarage.ai`
    : null

  return (
    <>
      <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 90 }} />

      <div
        ref={menuRef}
        role="menu"
        style={{
          position: 'fixed',
          top: 72,
          right: 16,
          width: 'min(360px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 96px)',
          overflowY: 'auto',
          zIndex: 100,
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          animation: 'menu-in 0.15s var(--ease-out)',
        }}
      >
        <style>{`
          @keyframes menu-in {
            from { opacity: 0; transform: translateY(-4px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Header: email */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <MonoLabel color="tertiary">Signed in as</MonoLabel>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', wordBreak: 'break-all', marginTop: 4 }}>
            {user.email}
          </div>
        </div>

        {/* Forwarding address */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <MonoLabel color="accent">Your forwarding address</MonoLabel>
          {loading ? (
            <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 8 }}>Loading…</div>
          ) : forwardingEmail ? (
            <>
              <button
                onClick={copyForwardingEmail}
                style={{
                  width: '100%',
                  marginTop: 8,
                  background: 'var(--color-bg-inset)',
                  border: '1px solid var(--color-border-accent)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Icon
                  name={copied ? 'check_circle' : 'mail'}
                  style={{ color: 'var(--color-accent)', fontSize: 18, flexShrink: 0 }}
                />
                <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>
                  {forwardingEmail}
                </span>
                <Icon
                  name={copied ? 'done' : 'content_copy'}
                  style={{ color: copied ? 'var(--color-accent)' : 'var(--color-text-tertiary)', fontSize: 16, flexShrink: 0 }}
                />
              </button>
              <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>
                Forward any service receipt to this address. We'll parse and add it automatically.
              </p>
            </>
          ) : null}
        </div>

        {/* Notifications */}
        {profile && (
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <MonoLabel color="tertiary">Notifications</MonoLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
              <ToggleRow
                label="Service reminders"
                value={profile.notif_service_reminders}
                onChange={(v) => updatePreference('notif_service_reminders', v)}
              />
              <ToggleRow
                label="Recall alerts"
                value={profile.notif_recalls}
                onChange={(v) => updatePreference('notif_recalls', v)}
              />
              <ToggleRow
                label="Email summaries"
                value={profile.notif_email_summary}
                onChange={(v) => updatePreference('notif_email_summary', v)}
              />
            </div>
          </div>
        )}

        {/* Manage vehicles */}
        <MenuButton
          icon="directions_car"
          label="Manage vehicles"
          onClick={() => {
            onClose()
            onManageVehicles()
          }}
        />

        {/* Sign out */}
        <MenuButton
          icon="logout"
          label="Sign out"
          onClick={() => {
            onClose()
            onSignOut()
          }}
          danger
        />
      </div>
    </>
  )
}

function MonoLabel({ children, color = 'tertiary' }) {
  const c = color === 'accent' ? 'var(--color-accent)' : 'var(--color-text-tertiary)'
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: c,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  )
}

function ToggleRow({ label, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '8px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{label}</span>
      <Toggle value={value} />
    </button>
  )
}

function Toggle({ value }) {
  return (
    <div
      style={{
        width: 36,
        height: 22,
        borderRadius: 'var(--radius-full)',
        background: value ? 'var(--color-accent)' : 'var(--color-bg-inset)',
        border: `1px solid ${value ? 'var(--color-accent)' : 'var(--color-border-default)'}`,
        position: 'relative',
        transition: 'all var(--duration-base) var(--ease-out)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: value ? 16 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: value ? 'var(--color-bg-base)' : 'var(--color-text-tertiary)',
          transition: 'left var(--duration-base) var(--ease-out)',
        }}
      />
    </div>
  )
}

function MenuButton({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: danger ? 'var(--color-status-danger)' : 'var(--color-text-primary)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        textAlign: 'left',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <Icon name={icon} style={{ fontSize: 20, color: danger ? 'var(--color-status-danger)' : 'var(--color-text-secondary)' }} />
      {label}
    </button>
  )
}
