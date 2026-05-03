import DashboardScreen from './DashboardScreen'
import ScheduleScreen from './ScheduleScreen'
import OnboardingScreen from './OnboardingScreen'
import LoginScreen from './LoginScreen'
import AccountMenu from './components/AccountMenu'
import VehicleSheet from './components/VehicleSheet'
import AppShell from './components/AppShell'
import PendingReviewBanner from './components/PendingReviewBanner'
import ReceiptForm from './components/ReceiptForm'
import { buildReceiptParseRequest, extractParsedReceipt } from '../lib/receiptParsing'
import { DashboardSkeleton } from './components/Skeletons'
import { useAuth } from './hooks/useAuth'
import { useVehicles } from './hooks/useVehicles'
import { useServiceRecords } from './hooks/useServiceRecords'
import { usePendingRecords } from './hooks/usePendingRecords'
import { useState, useRef, useEffect } from 'react'

// ─── Vehicle shape adapters ──────────────────────────────────
// The UI components were built around a flat display shape:
//   { name, nickname, type, miles, milesRaw, ...dbFields }
// Supabase rows use: { year, make, model, trim, nickname, current_mileage, ... }
// These helpers bridge the two worlds so screen components don't
// need to change.

function toDisplay(row) {
  if (!row) return null
  const miles = row.current_mileage ?? 0
  return {
    ...row,  // keep all raw db fields available
    name: `${row.year ?? ''} ${row.make ?? ''} ${row.model ?? ''}`.trim(),
    nickname: row.nickname || row.model || 'Vehicle',
    type: row.trim || 'Vehicle',
    miles: `${miles.toLocaleString()} miles`,
    milesRaw: miles,
  }
}

// ─── Shared UI pieces ────────────────────────────────────────

function Icon({ name, fill = false, className = '', style = {} }) {
  return (
    <span className={`msym ${fill ? 'msym-fill' : ''} ${className}`} style={style}>
      {name}
    </span>
  )
}

function AppHeader({ screen, onNavigate, onOpenAccount }) {
  if (screen === 'onboarding') return null

  return (
    <header
      style={{
        background: 'rgba(10,13,16,0.85)',
        backdropFilter: 'blur(20px)',
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px', height:64, maxWidth:672, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => onNavigate('dashboard')}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase' }}>
            <span style={{ color: 'var(--color-text-primary)' }}>Family </span>
            <span style={{ color: 'var(--color-accent)' }}>Garage</span>
          </span>
        </div>
        <button
          onClick={onOpenAccount}
          title="Account"
          style={{
            width:32, height:32, borderRadius:'50%',
            border:'1px solid var(--color-border-subtle)',
            background:'var(--color-bg-surface)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer',
          }}
        >
          <Icon name="person" style={{ color:'var(--color-text-secondary)', fontSize:17 }} />
        </button>
      </div>
    </header>
  )
}

function BottomNav({ screen, onNavigate }) {
  if (screen === 'onboarding') return null
  const items = [
    { id:'dashboard', icon:'directions_car', label:'Garage' },
    { id:'schedule',  icon:'build',          label:'Service' },
    { id:'import',    icon:'receipt_long',   label:'Records' },
    { id:'defense',   icon:'security',       label:'Report' },
  ]
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, width:'100%', zIndex:50, background:'rgba(10,13,16,0.85)', backdropFilter:'blur(24px)', borderTop:'1px solid var(--color-border-subtle)', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 8px 16px' }}>
      {items.map(item => {
        const active = screen === item.id
        return (
          <div key={item.id} onClick={() => onNavigate(item.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 14px', borderRadius:12, cursor:'pointer', color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)', background: active ? 'var(--color-accent-bg)' : 'transparent', transition:'all 0.2s' }}>
            <Icon name={item.icon} style={{ fontSize:22 }} />
            <span style={{ fontFamily:'var(--font-body)', fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.15em' }}>{item.label}</span>
          </div>
        )
      })}
    </nav>
  )
}

// ─── Import screen ───────────────────────────────────────────

function ImportScreen({ onFinalize, saving, vehicles, activeVehicleId }) {
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
        body: JSON.stringify(buildReceiptParseRequest({ base64, mediaType })),
      })
      if (!response.ok) throw new Error(`API error ${response.status}`)
      const data = await response.json()
      const parsed = extractParsedReceipt(data)
      setParsedData((prev) => ({ ...prev, ...parsed }))
      setParseState('done')
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.')
      setParseState('error')
    }
  }

  return (
    <div className="animate-page-in" style={{ paddingTop: 88, paddingBottom: 100, paddingLeft: 20, paddingRight: 20 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, margin: '0 0 24px' }}>Import record</h2>
      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e => handleFileSelected(e.target)} />
      {(parseState === 'idle' || parseState === 'selected') && (
        <div onClick={() => parseState === 'idle' && fileRef.current?.click()} style={{ aspectRatio:'4/3', borderRadius:'var(--radius-lg)', background: 'var(--color-bg-surface)', border: `2px dashed ${parseState === 'selected' ? 'var(--color-accent)' : 'var(--color-border-default)'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, cursor: parseState === 'idle' ? 'pointer' : 'default' }}>
          {parseState === 'idle' ? (
            <>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--color-accent-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="add_a_photo" style={{ color:'var(--color-accent)', fontSize:26 }} />
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:16, margin:'0 0 4px' }}>Upload receipt</p>
                <p style={{ fontSize:11, color:'var(--color-text-tertiary)', margin:0 }}>JPEG, PNG or PDF · up to 10MB</p>
              </div>
            </>
          ) : (
            <button onClick={e => { e.stopPropagation(); startParsing() }} style={{ background:'var(--color-accent)', color:'var(--color-text-inverse)', padding:'12px 24px', borderRadius:12, fontWeight:600, fontSize:13, border:'none', cursor:'pointer', boxShadow:'var(--glow-accent)' }}>
              Parse with AI
            </button>
          )}
        </div>
      )}
      {parseState === 'parsing' && <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 40 }}>Parsing receipt...</p>}
      {parseState === 'error' && <p style={{ color: 'var(--color-status-danger)', padding: 20 }}>Error: {errorMsg} <button onClick={resetUpload}>Try again</button></p>}
      {parseState === 'done' && parsedData && (
        <div style={{ marginTop: 16 }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
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
  )
}

function DefenseScreen() {
  return (
    <div className="animate-page-in" style={{ paddingTop: 88, paddingBottom: 100, paddingLeft: 20, paddingRight: 20 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, margin:'0 0 16px' }}>Defense Report</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>Defense report screen — still needs migration.</p>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
        <span style={{ color: 'var(--color-text-primary)' }}>Family </span>
        <span style={{ color: 'var(--color-accent)' }}>Garage</span>
      </div>
    </div>
  )
}

// ─── Root App ────────────────────────────────────────────────

export default function App() {
  const { user, loading, signOut } = useAuth()

  // One-time cleanup of stale localStorage from the pre-Supabase prototype.
  useEffect(() => {
    if (user && !localStorage.getItem('fg_migrated_to_supabase')) {
      localStorage.removeItem('fg_vehicles')
      localStorage.removeItem('fg_service_records')
      localStorage.setItem('fg_migrated_to_supabase', '1')
    }
  }, [user])

  if (loading) return <LoadingScreen />
  if (!user) return <LoginScreen />
  return <SignedInApp user={user} onSignOut={signOut} />
}

function SignedInApp({ user, onSignOut }) {
  const [screen, setScreen] = useState('dashboard')
  const [activeVehicleIdx, setActiveVehicleIdx] = useState(0)
  const [accountOpen, setAccountOpen] = useState(false)
  const [vehicleSheet, setVehicleSheet] = useState(null)  // null | 'list' | 'add'

  // ─── Supabase-backed data ──────────────────────────────────
  const {
    vehicles: rawVehicles,
    loading: vehiclesLoading,
    saving: vehicleSaving,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  } = useVehicles()

  // Adapt rows to the display shape UI components expect
  const vehicles = rawVehicles.map(toDisplay)
  const activeVehicle = Math.min(activeVehicleIdx, Math.max(0, vehicles.length - 1))
  const activeVehicleId = vehicles[activeVehicle]?.id ?? null

  // Service records scoped to the active vehicle
  const {
    records: serviceRecords,
    loading: recordsLoading,
    saving: recordSaving,
    addRecord,
  } = useServiceRecords(activeVehicleId)

  // Pending review records — household-scoped, separate from
  // per-vehicle records since they may not be matched correctly yet.
  const {
    records: pendingRecords,
    confirm: confirmPending,
    update: updatePending,
    dismiss: dismissPending,
  } = usePendingRecords()

  function navigate(s) {
    setScreen(s)
    window.scrollTo(0, 0)
  }

  // ─── Empty-state onboarding ────────────────────────────────
  // No vehicles yet? Show onboarding instead of the dashboard.
  const needsOnboarding = !vehiclesLoading && vehicles.length === 0

  async function handleOnboardingComplete({ year, make, model, miles, nickname }) {
    const milesRaw = parseInt(String(miles).replace(/,/g, '')) || 0
    const { error } = await addVehicle({
      year: parseInt(year) || null,
      make: make || '',
      model: model || '',
      nickname: nickname || null,
      current_mileage: milesRaw,
      mileage_updated_at: new Date().toISOString(),
    })
    if (error) {
      alert(`Could not save vehicle: ${error.message}`)
      return
    }
    setActiveVehicleIdx(0)
    navigate('dashboard')
  }

  async function handleFinalizeRecord(parsedData) {
    if (!activeVehicleId) {
      alert('Add a vehicle first.')
      return
    }
    // ReceiptForm passes back DB-shaped fields in the patch
    // (cost_cents, mileage_at_service, service_date, vehicle_id),
    // merged on top of the original parsedData. Prefer the patch
    // values, fall back to re-deriving from raw parsed strings if
    // the patch fields are missing for any reason.

    const cost_cents =
      parsedData.cost_cents ??
      (() => {
        const n = parseFloat(String(parsedData.cost ?? '').replace(/[^0-9.]/g, ''))
        return Number.isFinite(n) ? Math.round(n * 100) : null
      })()

    const mileage_at_service =
      parsedData.mileage_at_service ??
      (() => {
        const n = parseInt(String(parsedData.mileage ?? '').replace(/[^0-9]/g, ''))
        return Number.isFinite(n) ? n : null
      })()

    const targetVehicleId = parsedData.vehicle_id || activeVehicleId

    const { error } = await addRecord({
      service_type: parsedData.service_type || 'Service',
      shop_name: parsedData.shop_name || null,
      service_date: parsedData.service_date || parsedData.date || null,
      mileage_at_service,
      cost_cents,
      notes: parsedData.notes || null,
      line_items: Array.isArray(parsedData.line_items) ? parsedData.line_items : null,
      raw_parsed_data: parsedData,
      source: 'upload',
      status: 'confirmed',
      // If user reassigned via the dropdown, override the
      // active-vehicle assignment that useServiceRecords would set.
      ...(targetVehicleId !== activeVehicleId ? { vehicle_id: targetVehicleId } : {}),
    })
    if (error) {
      alert(`Could not save record: ${error.message}`)
      return
    }
    navigate('schedule')
  }

  // ─── Vehicle management callbacks ──────────────────────────
  async function handleUpdateVehicle(index, updated) {
    const row = rawVehicles[index]
    if (!row) return
    // VehicleSheet may pass either display-shape or raw-shape fields.
    // Keep only raw DB columns on the way out.
    const {
      year, make, model, trim, nickname, vin, license_plate,
      current_mileage, mileage_updated_at,
    } = updated
    const patch = {}
    if (year !== undefined) patch.year = year
    if (make !== undefined) patch.make = make
    if (model !== undefined) patch.model = model
    if (trim !== undefined) patch.trim = trim
    if (nickname !== undefined) patch.nickname = nickname
    if (vin !== undefined) patch.vin = vin
    if (license_plate !== undefined) patch.license_plate = license_plate
    if (current_mileage !== undefined) {
      patch.current_mileage = current_mileage
      patch.mileage_updated_at = mileage_updated_at ?? new Date().toISOString()
    }
    const { error } = await updateVehicle(row.id, patch)
    if (error) alert(`Could not update vehicle: ${error.message}`)
  }

  async function handleArchiveVehicle(index) {
    const row = rawVehicles[index]
    if (!row) return
    const { error } = await deleteVehicle(row.id)
    if (error) {
      alert(`Could not remove vehicle: ${error.message}`)
      return
    }
    if (activeVehicleIdx >= rawVehicles.length - 1) {
      setActiveVehicleIdx(Math.max(0, rawVehicles.length - 2))
    }
  }

  async function handleAddVehicle(newVehicle) {
    // newVehicle comes from VehicleSheet in either display or raw shape.
    const milesRaw =
      typeof newVehicle.current_mileage === 'number'
        ? newVehicle.current_mileage
        : parseInt(String(newVehicle.milesRaw ?? newVehicle.miles ?? '').replace(/[^0-9]/g, '')) || 0

    const { error } = await addVehicle({
      year: newVehicle.year ?? null,
      make: newVehicle.make ?? '',
      model: newVehicle.model ?? '',
      trim: newVehicle.trim ?? null,
      nickname: newVehicle.nickname ?? null,
      current_mileage: milesRaw,
      mileage_updated_at: new Date().toISOString(),
    })
    if (error) {
      alert(`Could not add vehicle: ${error.message}`)
      return
    }
    setActiveVehicleIdx(rawVehicles.length)  // newly added row will land at end
  }

  // ─── Render ────────────────────────────────────────────────

  if (vehiclesLoading) {
    return (
      <AppShell
        screen="dashboard"
        onNavigate={navigate}
        vehicles={[]}
        activeVehicle={0}
        onSelectVehicle={() => {}}
        onAddVehicle={() => {}}
        onOpenAccount={() => {}}
        user={user}
        mobileHeader={<AppHeader screen="dashboard" onNavigate={navigate} onOpenAccount={() => {}} />}
        mobileNav={null}
      >
        <DashboardSkeleton />
      </AppShell>
    )
  }

  if (needsOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  const screenContent = (
    <>
      {screen === 'dashboard' && (
        <DashboardScreen
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          onSwitchVehicle={(i) => setActiveVehicleIdx(typeof i === 'number' ? i : (activeVehicle + 1) % vehicles.length)}
          onAddVehicle={() => setVehicleSheet('add')}
          onNavigate={navigate}
          serviceRecords={serviceRecords}
          recordsLoading={recordsLoading}
          pendingBanner={
            <PendingReviewBanner
              records={pendingRecords}
              vehicles={vehicles}
              onConfirm={confirmPending}
              onUpdate={updatePending}
              onDismiss={dismissPending}
            />
          }
        />
      )}
      {screen === 'schedule' && (
        <ScheduleScreen
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          onNavigate={navigate}
          serviceRecords={serviceRecords}
          recordsLoading={recordsLoading}
        />
      )}
      {screen === 'import' && (
        <ImportScreen
          onFinalize={handleFinalizeRecord}
          saving={recordSaving}
          vehicles={vehicles}
          activeVehicleId={activeVehicleId}
        />
      )}
      {screen === 'defense' && <DefenseScreen />}
    </>
  )

  return (
    <>
      <AppShell
        screen={screen}
        onNavigate={navigate}
        vehicles={vehicles}
        activeVehicle={activeVehicle}
        onSelectVehicle={setActiveVehicleIdx}
        onAddVehicle={() => setVehicleSheet('add')}
        onOpenAccount={() => setAccountOpen(true)}
        user={user}
        mobileHeader={<AppHeader screen={screen} onNavigate={navigate} onOpenAccount={() => setAccountOpen(true)} />}
        mobileNav={<BottomNav screen={screen} onNavigate={navigate} />}
      >
        {screenContent}
      </AppShell>

      {/* Account dropdown */}
      {accountOpen && (
        <AccountMenu
          user={user}
          onSignOut={onSignOut}
          onClose={() => setAccountOpen(false)}
          onManageVehicles={() => setVehicleSheet('list')}
        />
      )}

      {/* Vehicle management sheet */}
      {vehicleSheet && (
        <VehicleSheet
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          onSelectVehicle={setActiveVehicleIdx}
          onUpdateVehicle={handleUpdateVehicle}
          onArchiveVehicle={handleArchiveVehicle}
          onAddVehicle={handleAddVehicle}
          onClose={() => setVehicleSheet(null)}
          initialView={vehicleSheet}
          saving={vehicleSaving}
        />
      )}
    </>
  )
}
