/**
 * LedgerRow — extends the ActivityRow visual pattern for the full
 * service-history screen.
 *
 * Differences from ActivityRow:
 *   - Adds a mileage line under the right-aligned cost
 *   - Adds a tiny inline source indicator on the shop-name line
 *     ("JIFFY LUBE · UPLOAD")
 *   - Always uses the muted (non-hot) dot — these are historical
 *     records, not "fresh" activity, so the cyan-glow eye-catch
 *     would over-promise urgency on every row
 *   - Clickable: invokes onClick when the row is activated
 *
 * Layout: [dot] [type / shop·source] · · · [$cost / mileage / date]
 */

import MonoNum from './MonoNum.jsx'

const SOURCE_LABELS = {
  manual:        'MANUAL',
  upload:        'UPLOAD',
  email_forward: 'FORWARDED',
  imported:      'IMPORTED',
}

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

export default function LedgerRow({
  title,
  shopName,
  source,
  costCents,
  mileageAtService,
  serviceDate,
  onClick,
}) {
  const sourceLabel = SOURCE_LABELS[source] ?? null
  const subline = [shopName, sourceLabel].filter(Boolean).join(' · ')

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center w-full text-left transition-colors"
      style={{
        gap: 12,
        padding: '14px 0',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--color-line)',
        cursor: 'pointer',
      }}
    >
      {/* Muted dot — these are confirmed history, no severity to flag */}
      <span
        aria-hidden="true"
        className="inline-block rounded-pill shrink-0"
        style={{
          width: 6,
          height: 6,
          background: 'var(--color-text-mute)',
        }}
      />

      {/* Type + (shop · source) */}
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
        {subline && (
          <div
            className="font-mono uppercase truncate"
            style={{
              fontSize: 9,
              letterSpacing: '1.2px',
              color: 'var(--color-text-dim)',
              marginTop: 2,
            }}
          >
            {shopName ? (
              <>
                <span>{shopName}</span>
                {sourceLabel && (
                  <>
                    <span style={{ color: 'var(--color-text-mute)' }}>
                      {' · '}
                    </span>
                    <span style={{ color: 'var(--color-text-mute)' }}>
                      {sourceLabel}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span style={{ color: 'var(--color-text-mute)' }}>
                {sourceLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cost / mileage / date — right-aligned */}
      <div className="text-right shrink-0">
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
          <MonoNum size={13} color="var(--color-text)">
            {formatCents(costCents)}
          </MonoNum>
        </div>
        {Number.isFinite(mileageAtService) && (
          <div
            className="font-mono uppercase tabular-nums"
            style={{
              fontSize: 9,
              letterSpacing: '1px',
              color: 'var(--color-text-dim)',
              marginTop: 2,
            }}
          >
            {mileageAtService.toLocaleString()} MI
          </div>
        )}
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
    </button>
  )
}
