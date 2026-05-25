import HomeScreen from './screens/HomeScreen.jsx'
import FleetScreen from './screens/FleetScreen.jsx'
import ScheduleScreen from './screens/ScheduleScreen.jsx'
import HistoryScreen from './screens/HistoryScreen.jsx'
import ImportScreen from './screens/ImportScreen.jsx'
import OnboardingScreen from './OnboardingScreen'
import LoginScreen from './LoginScreen'
import AccountMenu from './components/AccountMenu'
import VehicleSheet from './components/VehicleSheet'
import AppShell from './components/AppShell'
import TabBar from './design-system/primitives/TabBar.jsx'
import PendingReviewBanner from './components/PendingReviewBanner'
import { DashboardSkeleton } from './components/Skeletons'
import { useAuth } from './hooks/useAuth'
import { useVehicles } from './hooks/useVehicles'
import { useServiceRecords } from './hooks/useServiceRecords'
import { usePendingRecords } from './hooks/usePendingRecords'
import { useState, useEffect } from 'react'

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
  const [screen, setScreen] = useState('home')
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
    saving: recordSaving,
    addRecord,
    updateRecord,
    deleteRecord,
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
    navigate('home')
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
    // newVehicle comes from VehicleSheet add view (VIN or Manual mode).
    // Fields: year (int or string), make, model, trim, nickname,
    //         vin, license_plate, current_mileage (int) or milesRaw/miles (legacy).
    const milesRaw =
      typeof newVehicle.current_mileage === 'number'
        ? newVehicle.current_mileage
        : parseInt(String(newVehicle.milesRaw ?? newVehicle.miles ?? '').replace(/[^0-9]/g, '')) || 0

    // year may arrive as an integer (VIN mode) or a string (Manual mode select).
    const yearInt = Number.isFinite(newVehicle.year)
      ? newVehicle.year
      : parseInt(newVehicle.year) || null

    const { error } = await addVehicle({
      year:                yearInt,
      make:                newVehicle.make ?? '',
      model:               newVehicle.model ?? '',
      trim:                newVehicle.trim ?? null,
      nickname:            newVehicle.nickname ?? null,
      vin:                 newVehicle.vin ?? null,
      license_plate:       newVehicle.license_plate ?? null,
      current_mileage:     milesRaw,
      mileage_updated_at:  new Date().toISOString(),
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
        screen="home"
        onNavigate={navigate}
        vehicles={[]}
        activeVehicle={0}
        onSelectVehicle={() => {}}
        onAddVehicle={() => {}}
        onOpenAccount={() => {}}
        user={user}
        mobileHeader={<AppHeader screen="home" onNavigate={navigate} onOpenAccount={() => {}} />}
        mobileNav={null}
      >
        <DashboardSkeleton />
      </AppShell>
    )
  }

  if (needsOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  // v2 screens host their own AppShell + TabBar — they bypass the legacy
  // chrome entirely. Legacy screens keep the legacy AppShell wrapper, but
  // its mobile bottom-nav slot is now the v2 TabBar so the navigation
  // experience is consistent across the migration.
  const isV2Screen =
    screen === 'home' ||
    screen === 'fleet' ||
    screen === 'schedule' ||
    screen === 'history' ||
    screen === 'import'

  const sharedV2Props = {
    user,
    vehicles,
    activeVehicle,
    onSelectVehicle: setActiveVehicleIdx,
    onAddVehicle: () => setVehicleSheet('add'),
    onNavigate: navigate,
    onOpenAccount: () => setAccountOpen(true),
  }

  // Tab-bar active state for legacy screens (v2 screens render their own
  // TabBar). Only DefenseScreen uses the legacy wrapper now.
  const legacyActiveTab = null

  function renderSurface() {
    if (isV2Screen) {
      if (screen === 'home') {
        return (
          <HomeScreen
            {...sharedV2Props}
            serviceRecords={serviceRecords}
            onUpdateRecord={updateRecord}
            onDeleteRecord={deleteRecord}
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
        )
      }
      if (screen === 'fleet') return <FleetScreen {...sharedV2Props} />
      if (screen === 'import') {
        return (
          <ImportScreen
            user={user}
            vehicles={vehicles}
            activeVehicleId={activeVehicleId}
            onFinalize={handleFinalizeRecord}
            saving={recordSaving}
            onNavigate={navigate}
            onOpenAccount={() => setAccountOpen(true)}
          />
        )
      }
      if (screen === 'schedule') {
        return (
          <ScheduleScreen
            {...sharedV2Props}
            serviceRecords={serviceRecords}
          />
        )
      }
      // 'history'
      return (
        <HistoryScreen
          {...sharedV2Props}
          serviceRecords={serviceRecords}
          onUpdateRecord={updateRecord}
          onDeleteRecord={deleteRecord}
        />
      )
    }

    // Legacy screens — wrap in legacy AppShell + new TabBar
    return (
      <AppShell
        screen={screen}
        onNavigate={navigate}
        vehicles={vehicles}
        activeVehicle={activeVehicle}
        onSelectVehicle={setActiveVehicleIdx}
        onAddVehicle={() => setVehicleSheet('add')}
        onOpenAccount={() => setAccountOpen(true)}
        user={user}
        mobileHeader={
          <AppHeader
            screen={screen}
            onNavigate={navigate}
            onOpenAccount={() => setAccountOpen(true)}
          />
        }
        mobileNav={
          <TabBar
            active={legacyActiveTab}
            onHome={() => navigate('home')}
            onFleet={() => navigate('fleet')}
            onFab={() => navigate('import')}
            onNext={() => navigate('schedule')}
            onMe={() => setAccountOpen(true)}
          />
        }
      >
        {screen === 'defense' && <DefenseScreen />}
      </AppShell>
    )
  }

  return (
    <>
      {renderSurface()}

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
