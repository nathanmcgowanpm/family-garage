/**
 * ReceiptParsingSkeleton — two-column "parsing in progress" preview
 * -------------------------------------------------------------------
 * Left column: the uploaded receipt (image preview or PDF icon).
 * Right column: a skeleton of the ReceiptForm fields with a subtle
 * opacity-pulse animation, rows staggered so they don't pulse in unison.
 *
 * Exports:
 *   - ReceiptPreview      — left column, reused by ImportScreen in 'done' state
 *                           so the receipt stays in place when the form fills in
 *   - ReceiptFormSkeleton — right column, just the placeholders
 *   - default             — the combined two-column layout for 'parsing' state
 *
 * The grid + keyframes are injected once via a single <style> tag so the
 * component has no external CSS dependency.
 */

const STYLE_ID = 'fg-receipt-parsing-styles'

if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .fg-parse-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
      gap: var(--space-4);
      margin-top: var(--space-4);
      align-items: start;
    }
    @media (max-width: 640px) {
      .fg-parse-grid {
        grid-template-columns: 1fr;
      }
    }
    @keyframes fg-parsing-pulse {
      from { opacity: 0.6; }
      to   { opacity: 1; }
    }
    .fg-skeleton-row {
      animation: fg-parsing-pulse 1.5s ease-in-out infinite alternate;
    }
    @keyframes fg-form-fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fg-form-fade-in {
      animation: fg-form-fade-in 250ms ease-out both;
    }
  `
  document.head.appendChild(style)
}

function Icon({ name, style = {} }) {
  return <span className="msym" style={style}>{name}</span>
}

export function ReceiptPreview({ parsedData, caption }) {
  if (!parsedData) return null
  const { isPDF, isImage, previewUrl, file } = parsedData
  const fileName = file?.name || 'Receipt'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div
        style={{
          aspectRatio: '4 / 5',
          background: 'var(--color-bg-inset)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isImage && previewUrl && (
          <img
            src={previewUrl}
            alt="Uploaded receipt"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        {isPDF && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', textAlign: 'center' }}>
            <Icon
              name="picture_as_pdf"
              style={{ fontSize: 64, color: 'var(--color-accent)' }}
            />
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                margin: 0,
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {fileName}
            </p>
          </div>
        )}
      </div>
      {caption && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 400,
            color: 'var(--color-text-tertiary)',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {caption}
        </p>
      )}
    </div>
  )
}

function SkeletonField({ label, height = 38, delay = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
        }}
      >
        {label}
      </span>
      <div
        className="fg-skeleton-row"
        style={{
          height,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg-elevated)',
          animationDelay: `${delay}ms`,
        }}
      />
    </div>
  )
}

export function ReceiptFormSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <SkeletonField label="Service type" delay={0} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <SkeletonField label="Date" delay={100} />
        <SkeletonField label="Mileage" delay={200} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <SkeletonField label="Cost ($)" delay={300} />
        <SkeletonField label="Shop" delay={600} />
      </div>
      <SkeletonField label="Vehicle" delay={700} />
      <SkeletonField label="Line items" height={72} delay={400} />
      <SkeletonField label="Notes" height={56} delay={500} />
    </div>
  )
}

export default function ReceiptParsingSkeleton({ parsedData }) {
  return (
    <div className="fg-parse-grid">
      <ReceiptPreview parsedData={parsedData} caption="Parsing your receipt..." />
      <ReceiptFormSkeleton />
    </div>
  )
}
