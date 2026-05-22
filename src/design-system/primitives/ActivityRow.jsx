/**
 * ActivityRow — one row in the home-screen recent-activity list.
 *
 * Layout: [dot] [title / shop] · · · [$ amount / date]
 *
 * `hot` (typically true for the most recent record) drives:
 *   - dot fills primary + cyan glow (vs. text-mute, no glow)
 *   - amount renders in primary (vs. text)
 *
 * Dates render as uppercase short month + day ("AUG 12"). Cost is
 * passed in cents so we format on render.
 */

import MonoNum from './MonoNum.jsx'
import StatusDot from './StatusDot.jsx'

function formatShortDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d
    .toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    .toUpperCase()
}

function formatCents(cents) {
  if (!Number.isFinite(cents)) return '—'
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100)
  const remainder = String(abs % 100).padStart(2, '0')
  return `${sign}${dollars.toLocaleString()}.${remainder}`
}

export default function ActivityRow({
  title,
  shopName,
  costCents,
  serviceDate,
  hot = false,
  onClick,
}) {
  // When `onClick` is provided we render as a real <button> so the row
  // is tappable, keyboard-focusable, and announces as interactive. The
  // visual chrome stays identical — same flex layout, same bottom
  // border — we just strip the default button styling and add a
  // pointer cursor. Mirrors the same pattern used by LedgerRow.
  const interactive = typeof onClick === 'function'
  const Tag = interactive ? 'button' : 'div'
  const interactiveProps = interactive
    ? { type: 'button', onClick }
    : {}

  return (
    <Tag
      {...interactiveProps}
      className="flex items-center w-full text-left"
      style={{
        gap: 12,
        padding: '12px 0',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--color-line)',
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      {/* Dot — hot uses real glow via StatusDot, cold is a flat
         text-mute disc (no glow). */}
      {hot ? (
        <StatusDot variant="primary" size={6} />
      ) : (
        <span
          aria-hidden="true"
          className="inline-block rounded-pill"
          style={{
            width: 6,
            height: 6,
            background: 'var(--color-text-mute)',
          }}
        />
      )}

      {/* Title + shop */}
      <div className="flex-1 min-w-0">
        <div
          className="font-display truncate"
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.2px',
            color: 'var(--color-text)',
          }}
        >
          {title || 'Service'}
        </div>
        {shopName && (
          <div
            className="font-mono uppercase truncate"
            style={{
              fontSize: 9,
              letterSpacing: '1.2px',
              color: 'var(--color-text-dim)',
              marginTop: 2,
            }}
          >
            {shopName}
          </div>
        )}
      </div>

      {/* Amount + date — right-aligned */}
      <div className="text-right">
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 12,
              color: 'var(--color-text-mute)',
              marginRight: 1,
            }}
          >
            $
          </span>
          <MonoNum
            size={13}
            color={hot ? 'var(--color-primary)' : 'var(--color-text)'}
          >
            {formatCents(costCents)}
          </MonoNum>
        </div>
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 8,
            letterSpacing: '1.2px',
            color: 'var(--color-text-mute)',
            marginTop: 2,
          }}
        >
          {formatShortDate(serviceDate)}
        </div>
      </div>
    </Tag>
  )
}
