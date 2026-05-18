/**
 * AvatarButton — small circular header avatar that opens the account menu.
 *
 * Shows initials computed from the user's display name (falling back to
 * email local-part). Initials rules per product:
 *   - "Nathan"           → "N"      (single word: first letter only)
 *   - "Nathan McGowan"   → "NM"     (multi-word: first + last initials)
 *   - "nathan@..."       → "N"      (no name, use first letter of local part)
 *   - "" / null          → "?"      (never "NA" — reads as "not available")
 *
 * Strips non-alphanumeric characters before taking initials so a name
 * like "Mary-Jane Watson" still yields "MW".
 */

export function computeInitials(user) {
  if (!user) return '?'

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    ''

  if (name.trim()) {
    const words = name
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(Boolean)
    if (words.length === 1) return words[0][0].toUpperCase()
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase()
    }
  }

  const email = user.email || ''
  if (email.includes('@')) {
    const local = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
    if (local) return local[0].toUpperCase()
  }

  return '?'
}

export default function AvatarButton({ user, onClick }) {
  const initials = computeInitials(user)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open account"
      className="inline-flex items-center justify-center"
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-line-2)',
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.4px',
      }}
    >
      {initials}
    </button>
  )
}
