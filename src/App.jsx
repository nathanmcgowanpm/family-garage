import { Analytics } from '@vercel/analytics/react'
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
import { useState, useEffect, useRef } from 'react'

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
  return (
  <>
    <SignedInApp user={user} onSignOut={signOut} />
    <Analytics />
  </>
)
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

  // ─── OEM interval fetch ────────────────────────────────────
  // Fire-and-forget after any vehicle save. Does NOT block the save.
  // On success, updateVehicle sets oem_intervals on the row (optimistic),
  // which re-renders the advisor with manufacturer-specific intervals.
  // On any failure, the vehicle's oem_intervals stays null and the advisor
  // falls back to generic intervals indefinitely — no retry storm.
  const fetchingIntervalsRef = useRef(new Set())

  async function fetchAndStoreOemIntervals(vehicle) {
    const { id, year, make, model, trim } = vehicle
    if (!year || !make || !model) return  // can't fetch without YMMT
    if (fetchingIntervalsRef.current.has(id)) return  // already in-flight this session
    fetchingIntervalsRef.current.add(id)
    try {
      const res = await fetch('/api/fetch-vehicle-intervals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ year, make, model, trim }),
      })
      if (!res.ok) {
        console.warn(`OEM intervals fetch failed for vehicle ${id}: HTTP ${res.status}`)
        return
      }
      const { intervals } = await res.json()
      // Store the result even if intervals is {} — that marks the vehicle
      // as "fetched but no OEM data" and prevents redundant future fetches.
      const { error } = await updateVehicle(id, { oem_intervals: intervals })
      if (error) console.warn(`Failed to store OEM intervals for vehicle ${id}:`, error)
    } catch (err) {
      console.warn(`OEM intervals fetch error for vehicle ${id}:`, err)
    }
  }

  // ─── Backfill: fetch OEM intervals for existing null-interval vehicles ─
  // Runs whenever rawVehicles changes (e.g. on initial load). Vehicles that
  // already have oem_intervals (including {}) are skipped. The fetchingIntervalsRef
  // Set prevents duplicate in-flight requests within a session.
  useEffect(() => {
    if (vehiclesLoading) return
    for (const vehicle of rawVehicles) {
      if (vehicle.oem_intervals === null || vehicle.oem_intervals === undefined) {
        fetchAndStoreOemIntervals(vehicle)
      }
    }
    // fetchAndStoreOemIntervals closes over updateVehicle which is stable
    // across renders where rawVehicles hasn't changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawVehicles, vehiclesLoading])

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
    // The backfill useEffect detects oem_intervals === null on the new vehicle
    // and calls fetchAndStoreOemIntervals after React re-renders — at which
    // point updateVehicle's closure has the correct vehicle list and any
    // rollback on error won't wipe the newly added vehicle from UI state.
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
    if (error) {
      alert(`Could not update vehicle: ${error.message}`)
      return
    }
    // If year/make/model/trim changed, the existing OEM intervals are stale.
    // Clear them and re-fetch. Nickname, VIN, plate, and mileage changes
    // don't affect the maintenance schedule, so they don't trigger a re-fetch.
    const ymmt_changed =
      (patch.year  !== undefined && patch.year  !== row.year)  ||
      (patch.make  !== undefined && patch.make  !== row.make)  ||
      (patch.model !== undefined && patch.model !== row.model) ||
      (patch.trim  !== undefined && patch.trim  !== row.trim)
    if (ymmt_changed) {
      // Wipe stale intervals so the vehicle re-enters the backfill effect.
      await updateVehicle(row.id, { oem_intervals: null })
      // Remove from in-flight guard so the backfill effect can re-fetch.
      fetchingIntervalsRef.current.delete(row.id)
    }
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
    // The backfill useEffect handles OEM interval fetch — runs after re-render
    // so updateVehicle closure has the correct (post-insertion) vehicle list.
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
