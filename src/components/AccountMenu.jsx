/**
 * AccountMenu — account dropdown, v2 Arctic Signal
 * -------------------------------------------------
 * Shows:
 *   1. User email
 *   2. Forwarding address — static `receipts@familygarage.ai`,
 *      copy button + help text about From-header matching
 *   3. Notification preferences (service reminders only — real/wired)
 *   4. "Manage vehicles" → opens VehicleSheet via callback
 *   5. Sign out
 *
 * Anchored top-right. Closes on outside-click or Escape.
 *
 * Phantom toggles removed (Phase 5):
 *   "Recall alerts" (notif_recalls) and "Email summaries"
 *   (notif_email_summary) have been removed. Those features don't
 *   exist; they were writing to user_profiles columns that nothing
 *   reads. The DB columns are left intact (no migration needed) but
 *   are no longer written. "Service reminders" is real and stays.
 *
 * Token migration: all tokens migrated to v2 Arctic Signal.
 */

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

// Single shared forwarding address — exported so dashboard tip cards stay in sync.
// The Postmark webhook matches inbound From: header to auth.users.email.
export const FORWARDING_ADDRESS = 'receipts@familygarage.ai'

function Icon({ name, fill = false, style = {} }) {
  return <span className={`msym ${fill ? 'msym-fill' : ''}`} style={style}>{name}</span>
}

export default function AccountMenu({ user, onSignOut, onClose, onManageVehicles }) {
  const menuRef = useRef(null)
  const [profile,        setProfile]        = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [copied,         setCopied]         = useState(false)

  // Load profile — needed for the service reminders toggle
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) setProfile(data)
      setProfileLoading(false)
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

  // Persist a single user_profiles field to Supabase (optimistic update)
  async function updatePreference(field, value) {
    setProfile((p) => ({ ...p, [field]: value }))
    await supabase.from('user_profiles').update({ [field]: value }).eq('id', user.id)
  }

  async function copyForwardingEmail() {
    try {
      await navigator.clipboard.writeText(FORWARDING_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard failed', err)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 90,
        }}
      />

      {/* Menu panel */}
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
          background: 'var(--color-surface)',
          border: '1px solid var(--color-line-2)',
          borderRadius: 20,
          boxShadow: '0 20px 48px rgba(0,0,0,0.55)',
          animation: 'acct-menu-in 0.15s ease-out',
        }}
      >
        <style>{`
          @keyframes acct-menu-in {
            from { opacity: 0; transform: translateY(-6px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0)   scale(1);    }
          }
        `}</style>

        {/* ── Email header ──────────────────────────────────── */}
        <div
          style={{
            padding: '16px 16px 14px',
            borderBottom: '1px solid var(--color-line-2)',
          }}
        >
          <SectionLabel>Signed in as</SectionLabel>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-text)',
              wordBreak: 'break-all',
              marginTop: 5,
              letterSpacing: '0.3px',
            }}
          >
            {user.email}
          </div>
        </div>

        {/* ── Forwarding address ────────────────────────────── */}
        <div
          style={{
            padding: '14px 16px 16px',
            borderBottom: '1px solid var(--color-line-2)',
          }}
        >
          <SectionLabel accent>Forward receipts</SectionLabel>

          {/* Copy button */}
          <button
            onClick={copyForwardingEmail}
            style={{
              width: '100%',
              marginTop: 8,
              background: copied ? 'rgba(109,255,176,0.07)' : 'var(--color-surface-2)',
              border: `1px solid ${copied ? 'rgba(109,255,176,0.35)' : 'var(--color-primary-line)'}`,
              borderRadius: 12,
              padding: '10px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <Icon
              name={copied ? 'check_circle' : 'mail'}
              fill={copied}
              style={{
                color: copied ? 'var(--color-go)' : 'var(--color-primary)',
                fontSize: 18,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-text)',
                wordBreak: 'break-all',
                letterSpacing: '0.3px',
              }}
            >
              {FORWARDING_ADDRESS}
            </span>
            <Icon
              name={copied ? 'done' : 'content_copy'}
              style={{
                color: copied ? 'var(--color-go)' : 'var(--color-text-mute)',
                fontSize: 16,
                flexShrink: 0,
                transition: 'color 0.2s',
              }}
            />
          </button>

          <p
            style={{
              margin: '10px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--color-text-dim)',
              lineHeight: 1.5,
            }}
          >
            Forward service receipts here — we'll parse them and queue them
            for review on your dashboard.
          </p>
          <p
            style={{
              margin: '5px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              color: 'var(--color-text-mute)',
              lineHeight: 1.5,
            }}
          >
            Only forwards from{' '}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-text-dim)',
              }}
            >
              {user.email}
            </span>{' '}
            will be matched to your account.
          </p>
        </div>

        {/* ── Notifications (service reminders only) ────────── */}
        {!profileLoading && profile && (
          <div
            style={{
              padding: '14px 16px 12px',
              borderBottom: '1px solid var(--color-line-2)',
            }}
          >
            <SectionLabel>Notifications</SectionLabel>
            <div style={{ marginTop: 6 }}>
              <ToggleRow
                label="Service reminders"
                value={profile.notif_service_reminders}
                onChange={(v) => updatePreference('notif_service_reminders', v)}
              />
            </div>
          </div>
        )}

        {/* ── Manage vehicles ───────────────────────────────── */}
        <MenuButton
          icon="directions_car"
          label="Manage vehicles"
          onClick={() => { onClose(); onManageVehicles() }}
        />

        {/* ── Sign out ──────────────────────────────────────── */}
        <MenuButton
          icon="logout"
          label="Sign out"
          onClick={() => { onClose(); onSignOut() }}
          danger
        />
      </div>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────

function SectionLabel({ children, accent }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        fontWeight: 600,
        color: accent ? 'var(--color-primary)' : 'var(--color-text-mute)',
        letterSpacing: '1.3px',
        textTransform: 'uppercase',
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
        width: '100%',
        background: 'transparent',
        border: 'none',
        padding: '9px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--color-text)',
        }}
      >
        {label}
      </span>
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
        borderRadius: 100,
        background: value ? 'var(--color-primary)' : 'var(--color-surface-3)',
        border: `1px solid ${value ? 'var(--color-primary)' : 'var(--color-line-3)'}`,
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.15s ease-out, border-color 0.15s ease-out',
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
          background: value ? 'var(--color-ink)' : 'var(--color-text-mute)',
          transition: 'left 0.15s ease-out',
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
        borderBottom: '1px solid var(--color-line-2)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: danger ? 'var(--color-danger)' : 'var(--color-text)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: 500,
        textAlign: 'left',
      }}
    >
      <Icon
        name={icon}
        style={{
          fontSize: 20,
          color: danger ? 'var(--color-danger)' : 'var(--color-text-dim)',
        }}
      />
      {label}
    </button>
  )
}
