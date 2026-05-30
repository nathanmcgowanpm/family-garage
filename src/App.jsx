import HomeScreen from './screens/HomeScreen.jsx'
import FleetScreen from './screens/FleetScreen.jsx'
import ScheduleScreen from './screens/ScheduleScreen.jsx'
import HistoryScreen from './screens/HistoryScreen.jsx'
import ImportScreen from './screens/ImportScreen.jsx'
import OnboardingScreen from './OnboardingScreen'
import LoginScreen from './LoginScreen'
import AccountMenu from './components/AccountMenu'
import VehicleSheet from './components/VehicleSheet'
import PendingReviewBanner from './components/PendingReviewBanner'
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

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-mute)' }}>
        <span style={{ color: 'var(--color-text)' }}>Family </span>
        <span style={{ color: 'var(--color-primary)' }}>Garage</span>
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

  async function handleOnboardingComplete({ year, make, model, trim, nickname, vin, license_plate, miles }) {
    const milesRaw = parseInt(String(miles).replace(/,/g, '')) || 0
    const { error } = await addVehicle({
      year:            parseInt(year) || null,
      make:            make || '',
      model:           model || '',
      trim:            trim || null,
      nickname:        nickname || null,
      vin:             vin || null,
      license_plate:   license_plate || null,
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
      // Normalize to text[] of JSON strings — same shape as the email-forward
      // path (inbound-email.js uses normalizeLineItems for consistency).
      line_items: Array.isArray(parsedData.line_items)
        ? parsedData.line_items.map((item) =>
            typeof item === 'string' ? item : JSON.stringify(item)
          )
        : null,
      raw_parsed_data: parsedData,
      // categories: AI-assigned at parse time. Flows in from parse-receipt
      // response via ImportScreen → ReceiptForm → onFinalize spread.
      // null if the field is missing for any reason (not a hard failure).
      categories: Array.isArray(parsedData.categories) ? parsedData.categories : null,
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

  // While vehicles are loading, show the branded loading screen — same as the
  // auth-loading gate above. Previously this rendered the legacy AppShell with
  // <DashboardSkeleton />, which caused the "Garage / Service / Records" sidebar
  // to flash on hard refresh before the real v2 UI painted.
  if (vehiclesLoading) return <LoadingScreen />

  if (needsOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  const sharedV2Props = {
    user,
    vehicles,
    activeVehicle,
    onSelectVehicle: setActiveVehicleIdx,
    onAddVehicle: () => setVehicleSheet('add'),
    onNavigate: navigate,
    onOpenAccount: () => setAccountOpen(true),
  }

  function renderSurface() {
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
    // 'history' (default)
    return (
      <HistoryScreen
        {...sharedV2Props}
        serviceRecords={serviceRecords}
        onUpdateRecord={updateRecord}
        onDeleteRecord={deleteRecord}
      />
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
