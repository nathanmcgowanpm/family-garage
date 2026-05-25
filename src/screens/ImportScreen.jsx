/**
 * ImportScreen — v2 Arctic Signal receipt import flow.
 *
 * States:
 *   idle     → dropzone (tap to pick file)
 *   selected → dropzone with file name + "Parse with AI" CTA
 *   parsing  → ReceiptPreview + ReceiptFormSkeleton (already v2, unchanged)
 *   done     → ReceiptPreview + ReceiptForm review (already v2, unchanged)
 *   error    → error card + try-again button
 *
 * All upload / parse / save logic is identical to the inline version that
 * lived in App.jsx. Only the shell and dropzone presentation changed.
 *
 * Props from App.jsx:
 *   onFinalize(parsedData)  — persists to Supabase + navigates to schedule
 *   saving                  — recordSaving boolean from useServiceRecords
 *   vehicles                — display-shape vehicle array
 *   activeVehicleId         — UUID of the active vehicle
 *   user                    — for AvatarButton
 *   onNavigate(screen)      — navigate fn
 *   onOpenAccount()         — opens AccountMenu
 */

import { useState, useRef } from 'react'
import AppShell from '../design-system/AppShell.jsx'
import {
  Logo,
  AvatarButton,
  MicroLabel,
  TabBar,
} from '../design-system/primitives'
import { ReceiptPreview, ReceiptFormSkeleton } from '../components/ReceiptParsingSkeleton'
import ReceiptForm from '../components/ReceiptForm'

export default function ImportScreen({
  onFinalize,
  saving,
  vehicles = [],
  activeVehicleId,
  user,
  onNavigate,
  onOpenAccount,
}) {
  const [parseState, setParseState] = useState('idle')
  const [parsedData, setParsedData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef(null)

  function resetUpload() {
    if (fileRef.current) fileRef.current.value = ''
    setParseState('idle')
    setParsedData(null)
    setErrorMsg('')
  }

  function handleFileSelected(input) {
    if (!input.files || !input.files[0]) return
    const file = input.files[0]
    if (file.size > 10 * 1024 * 1024) return alert('Too large.')
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage = file.type.startsWith('image/')
    if (!isPDF && !isImage) return alert('Choose an image or PDF.')
    setParseState('selected')
    setParsedData({ file, isPDF, isImage, previewUrl: isImage ? URL.createObjectURL(file) : null })
  }

  async function startParsing() {
    if (!parsedData?.file) return
    setParseState('parsing')
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(parsedData.file)
      })
      const mediaType = parsedData.isPDF ? 'application/pdf' : parsedData.file.type
      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ base64, mediaType }),
      })
      if (!response.ok) throw new Error(`API error ${response.status}`)
      const parsed = await response.json()
      setParsedData((prev) => ({ ...prev, ...parsed }))
      setParseState('done')
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.')
      setParseState('error')
    }
  }

  const showDropzone = parseState === 'idle' || parseState === 'selected'
  const showParseGrid = (parseState === 'parsing' || parseState === 'done') && parsedData

  return (
    <>
      <AppShell>
        {/* Header */}
        <header
          className="flex items-center justify-between"
          style={{ padding: '8px 20px 20px' }}
        >
          <Logo />
          <AvatarButton user={user} onClick={onOpenAccount} />
        </header>

        {/* Title block */}
        <section style={{ padding: '0 20px 28px' }}>
          <MicroLabel>Receipt import</MicroLabel>
          <h1
            className="font-display"
            style={{
              fontSize: 30,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-1px',
              color: 'var(--color-text)',
              marginTop: 6,
            }}
          >
            Add a{' '}
            <span style={{ color: 'var(--color-primary)' }}>service record</span>
          </h1>
        </section>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelected(e.target)}
        />

        {/* ── Dropzone — idle + selected ──────────────────────── */}
        {showDropzone && (
          <div style={{ padding: '0 20px' }}>
            <div
              onClick={() => parseState === 'idle' && fileRef.current?.click()}
              style={{
                borderRadius: 20,
                border: `2px dashed ${
                  parseState === 'selected'
                    ? 'var(--color-primary)'
                    : 'var(--color-line-3)'
                }`,
                background: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                padding: '52px 24px',
                cursor: parseState === 'idle' ? 'pointer' : 'default',
                transition: 'border-color 0.15s',
                minHeight: 240,
              }}
            >
              {parseState === 'idle' ? (
                /* ── Idle ───────────────────────────────────── */
                <>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      border: '1px solid var(--color-line-3)',
                      background: 'var(--color-ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Upload arrow SVG — no external icon dependency */}
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p
                      className="font-display"
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        margin: '0 0 8px',
                      }}
                    >
                      Upload a receipt
                    </p>
                    <p
                      className="font-mono uppercase"
                      style={{
                        fontSize: 9,
                        letterSpacing: '1.4px',
                        color: 'var(--color-text-mute)',
                        margin: 0,
                      }}
                    >
                      JPEG · PNG · PDF · up to 10 MB
                    </p>
                  </div>
                </>
              ) : (
                /* ── Selected ───────────────────────────────── */
                <>
                  <div style={{ textAlign: 'center' }}>
                    <p
                      className="font-mono uppercase"
                      style={{
                        fontSize: 9,
                        letterSpacing: '1.4px',
                        color: 'var(--color-primary)',
                        margin: '0 0 6px',
                      }}
                    >
                      File selected
                    </p>
                    <p
                      className="font-display"
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--color-text)',
                        margin: '0 0 24px',
                        maxWidth: 260,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {parsedData?.file?.name}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); startParsing() }}
                      style={{
                        background: 'var(--color-primary)',
                        color: 'var(--color-ink)',
                        padding: '12px 28px',
                        borderRadius: 12,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: '0.02em',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(61,214,255,0.35)',
                      }}
                    >
                      Parse with AI
                    </button>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); resetUpload() }}
                    className="font-mono uppercase"
                    style={{
                      fontSize: 9,
                      letterSpacing: '1.4px',
                      color: 'var(--color-text-mute)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Choose a different file
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Parse grid — parsing + done ─────────────────────── */}
        {showParseGrid && (
          <div style={{ margin: '0 20px' }}>
            <div className="fg-parse-grid">
              <ReceiptPreview
                parsedData={parsedData}
                caption={parseState === 'parsing' ? 'Parsing your receipt...' : null}
              />
              <div style={{ minWidth: 0 }}>
                {parseState === 'parsing' ? (
                  <ReceiptFormSkeleton />
                ) : (
                  <div className="fg-form-fade-in">
                    <p
                      style={{
                        color: 'var(--color-text-dim)',
                        fontSize: 13,
                        fontFamily: 'var(--font-body)',
                        margin: '0 0 16px',
                      }}
                    >
                      Review the parsed details and adjust if needed.
                    </p>
                    <ReceiptForm
                      initialData={parsedData}
                      vehicles={vehicles}
                      activeVehicleId={activeVehicleId}
                      onSave={(patch) => onFinalize({ ...parsedData, ...patch })}
                      saving={saving}
                      saveLabel="Save to Service History"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Error state ─────────────────────────────────────── */}
        {parseState === 'error' && (
          <div style={{ padding: '0 20px' }}>
            <div
              style={{
                borderRadius: 16,
                border: '1px solid rgba(255,77,109,0.30)',
                background: 'rgba(255,77,109,0.07)',
                padding: '20px 22px',
              }}
            >
              <p
                className="font-mono uppercase"
                style={{
                  fontSize: 9,
                  letterSpacing: '1.4px',
                  color: 'var(--color-danger)',
                  margin: '0 0 6px',
                }}
              >
                Parse failed
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                  margin: '0 0 18px',
                }}
              >
                {errorMsg}
              </p>
              <button
                onClick={resetUpload}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-line-3)',
                  borderRadius: 10,
                  padding: '9px 18px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Bottom spacer so TabBar (92px) doesn't clip content */}
        <div style={{ height: 110 }} />
      </AppShell>

      <TabBar
        active={null}
        onHome={() => onNavigate('home')}
        onFleet={() => onNavigate('fleet')}
        onFab={() => onNavigate('import')}
        onNext={() => onNavigate('schedule')}
        onMe={onOpenAccount}
      />
    </>
  )
}
