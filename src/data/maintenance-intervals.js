/**
 * Family Garage — Maintenance Intervals (Seed Data)
 * --------------------------------------------------
 * Seed data for common scheduled maintenance items.
 * Cost estimates sourced from GreaseMonkey public pricing (2025-2026).
 *
 * This is placeholder data for the prototype. At launch, cost estimates
 * and intervals will be replaced by:
 *   - Real OEM schedules (CarScan / VehicleDatabases API)
 *   - User-specific historical pricing from imported receipts
 *   - Location-adjusted cost ranges
 *
 * Data shape — one object per maintenance item:
 *   id: kebab-case identifier (stable across data source swaps)
 *   name: display name
 *   icon: Material Symbols icon name
 *   intervalMiles: recommended mileage between services
 *   intervalMonths: recommended time between services (used if driven less)
 *   cost: { low, high, source } — USD range from seed provider
 *   description: one-sentence explainer
 *   category: 'fluid' | 'filter' | 'wear' | 'inspection' — for future grouping
 */

export const MAINTENANCE_ITEMS = [
  {
    id: 'oil-change',
    name: 'Oil & Filter Change',
    icon: 'oil_barrel',
    kind: 'recurring',
    intervalMiles: 5000,
    intervalMonths: 6,
    cost: { low: 40, high: 80, source: 'GreaseMonkey' },
    description: 'Synthetic blend oil and filter replacement. Most common scheduled service.',
    category: 'fluid',
  },
  {
    id: 'tire-rotation',
    name: 'Tire Rotation',
    icon: 'tire_repair',
    kind: 'recurring',
    intervalMiles: 6000,
    intervalMonths: 6,
    cost: { low: 20, high: 40, source: 'GreaseMonkey' },
    description: 'Swap tire positions to promote even wear. Extends tire life meaningfully.',
    category: 'wear',
  },
  {
    id: 'brake-fluid-flush',
    name: 'Brake Fluid Flush',
    icon: 'water_drop',
    kind: 'milestone',
    dueAroundMiles: 30000,
    intervalMiles: 30000,
    intervalMonths: 36,
    cost: { low: 70, high: 100, source: 'GreaseMonkey' },
    description: 'Replace hydraulic brake fluid. Critical for brake system integrity.',
    category: 'fluid',
  },
  {
    id: 'engine-air-filter',
    name: 'Engine Air Filter',
    icon: 'air',
    kind: 'recurring',
    intervalMiles: 20000,
    intervalMonths: 24,
    cost: { low: 10, high: 30, source: 'GreaseMonkey' },
    description: 'Replace filter to maintain fuel efficiency and engine airflow.',
    category: 'filter',
  },
  {
    id: 'cabin-air-filter',
    name: 'Cabin Air Filter',
    icon: 'hvac',
    kind: 'recurring',
    intervalMiles: 20000,
    intervalMonths: 24,
    cost: { low: 20, high: 40, source: 'GreaseMonkey' },
    description: 'Replace cabin filter for cleaner interior airflow.',
    category: 'filter',
  },
  {
    id: 'coolant-flush',
    name: 'Coolant Flush',
    icon: 'ac_unit',
    kind: 'milestone',
    dueAroundMiles: 60000,
    intervalMiles: 60000,
    intervalMonths: 60,
    cost: { low: 90, high: 150, source: 'GreaseMonkey' },
    description: 'Replace engine coolant. Prevents overheating and corrosion.',
    category: 'fluid',
  },
  {
    id: 'transmission-fluid',
    name: 'Transmission Fluid Service',
    icon: 'settings',
    kind: 'milestone',
    dueAroundMiles: 60000,
    intervalMiles: 60000,
    intervalMonths: 60,
    cost: { low: 120, high: 200, source: 'GreaseMonkey' },
    description: 'Replace transmission fluid. Extends transmission life.',
    category: 'fluid',
  },
  {
    id: 'wheel-alignment',
    name: 'Wheel Alignment Check',
    icon: 'straighten',
    kind: 'recurring',
    intervalMiles: 12000,
    intervalMonths: 12,
    cost: { low: 80, high: 120, source: 'Industry average' },
    description: 'Check and adjust wheel angles. Prevents uneven tire wear.',
    category: 'inspection',
  },
  {
    id: 'battery-test',
    name: 'Battery Health Test',
    icon: 'battery_charging_full',
    kind: 'recurring',
    intervalMiles: 15000,
    intervalMonths: 12,
    cost: { low: 0, high: 20, source: 'GreaseMonkey' },
    description: 'Load test battery capacity. Often complimentary with other services.',
    category: 'inspection',
  },
  {
    id: 'spark-plugs',
    name: 'Spark Plug Replacement',
    icon: 'electrical_services',
    kind: 'milestone',
    dueAroundMiles: 60000,
    intervalMiles: 60000,
    intervalMonths: 60,
    cost: { low: 100, high: 250, source: 'GreaseMonkey' },
    description: 'Replace spark plugs. Iridium plugs can last up to 100k miles.',
    category: 'wear',
  },
  {
    id: 'wiper-blades',
    name: 'Wiper Blade Replacement',
    icon: 'water_drop',
    kind: 'recurring',
    intervalMiles: null,
    intervalMonths: 12,
    cost: { low: 20, high: 50, source: 'GreaseMonkey' },
    description: 'Replace wiper blades annually or when streaking occurs.',
    category: 'wear',
  },
  {
    id: 'brake-pads',
    name: 'Brake Pad Replacement',
    icon: 'disc_full',
    kind: 'milestone',
    dueAroundMiles: 40000,
    intervalMiles: 40000,
    intervalMonths: null,
    cost: { low: 150, high: 300, source: 'GreaseMonkey' },
    description: 'Replace brake pads per axle. Interval varies by driving style.',
    category: 'wear',
  },
]

/**
 * How many miles before a milestone's lower window boundary the road-ahead
 * starts surfacing it as `'milestone-upcoming'`. Below this lead distance
 * the milestone is `'milestone-distant'` and filtered from the screen — it
 * hasn't earned screen real estate yet.
 *
 * Example: coolant (dueAroundMiles: 60000, lowerBound: 48000) surfaces
 * once currentMileage >= 38000 (48000 − 10000). Below 38k it's hidden.
 *
 * Tune this constant to change how early milestones appear.
 */
export const LEAD_MILES = 10000

/**
 * Compute service status for a vehicle's current mileage.
 * Returns items with computed due state for sorting/filtering.
 *
 * Services with no logged history are reported as `'no-baseline'`,
 * NOT `'overdue'`. Without a baseline mileage we don't know when the
 * service was last performed, so calling it overdue would be a lie
 * (a vehicle at 71,000 mi could have had its oil changed last week
 * by a previous owner — we have no idea).
 *
 * The distinction is made by *key presence* in `lastServicedMap`, not
 * truthiness — a record genuinely logged at mile 0 (rare but possible
 * for first-owner brand-new vehicles) is still "has history".
 *
 * Milestone status map (no history):
 *   currentMileage < lowerBound − LEAD_MILES  → 'milestone-distant'   (hidden from road-ahead)
 *   currentMileage < lowerBound               → 'milestone-upcoming'  (approaching window)
 *   currentMileage <= upperBound              → 'consider-now'        (in window, amber)
 *   currentMileage > upperBound               → 'likely-overdue'      (past window, amber)
 */
export function computeServiceStatus(currentMileage, lastServicedMap = {}) {
  return MAINTENANCE_ITEMS.map((item) => {
    const hasHistory = Object.prototype.hasOwnProperty.call(
      lastServicedMap,
      item.id,
    )
    const lastServicedAt = hasHistory ? lastServicedMap[item.id] : null

    if (item.kind === 'milestone') {
      const lowerBound = item.dueAroundMiles * 0.8
      const upperBound = item.dueAroundMiles * 1.2

      if (hasHistory) {
        // Milestone with a logged service → predict next occurrence like recurring
        const nextDueAt = lastServicedAt + item.intervalMiles
        const milesUntilDue = nextDueAt - currentMileage
        let status
        if (milesUntilDue < 0) status = 'overdue'
        else if (milesUntilDue <= 1500) status = 'due-soon'
        else status = 'upcoming'
        return {
          ...item,
          hasHistory,
          lastServicedAt,
          nextDueAt,
          milesUntilDue,
          status,
          lowerBound,
          upperBound,
        }
      }

      // Milestone without history — advisory state based on mileage window.
      // 'milestone-distant' means the car is more than LEAD_MILES before the
      // window; consumers (e.g. the road-ahead screen) suppress it until the
      // vehicle is close enough for the advisory to be actionable.
      let status
      if (currentMileage < lowerBound - LEAD_MILES) status = 'milestone-distant'
      else if (currentMileage < lowerBound) status = 'milestone-upcoming'
      else if (currentMileage <= upperBound) status = 'consider-now'
      else status = 'likely-overdue'

      return {
        ...item,
        hasHistory,
        lastServicedAt,
        nextDueAt: null,
        milesUntilDue: null,
        status,
        lowerBound,
        upperBound,
      }
    }

    // Recurring item — existing logic unchanged
    const nextDueAt = hasHistory
      ? lastServicedAt + (item.intervalMiles || Infinity)
      : null
    const milesUntilDue = hasHistory ? nextDueAt - currentMileage : null

    let status
    if (!hasHistory) {
      status = 'no-baseline'
    } else if (milesUntilDue < 0) {
      status = 'overdue'
    } else if (milesUntilDue <= 1500) {
      status = 'due-soon'
    } else {
      status = 'upcoming'
    }

    return {
      ...item,
      hasHistory,
      lastServicedAt,
      nextDueAt,
      milesUntilDue,
      status,
    }
  })
}

/**
 * Map service-record rows to a `{ itemId: lastMileage }` lookup so the
 * predictor knows when each maintenance item was most recently performed.
 *
 * Primary path: reads record.categories (string[] set by Claude at log time).
 * A record with categories ["oil-change","tire-rotation"] updates both baselines.
 *
 * Legacy fallback: for records where categories is NULL (pre-categorization
 * rows), falls back to keyword matching against SERVICE_KEYWORDS. This branch
 * will be unreachable once all records have been backfilled with categories.
 */

/**
 * @deprecated Keyword matching is used only as a legacy fallback for
 * service_records where categories is NULL. New records are categorized
 * by Claude at log time and this map is no longer the primary path.
 * Remove after a full backfill of existing records clears categories = NULL.
 */
const SERVICE_KEYWORDS = {
  'oil-change':         ['oil change', 'oil & filter', 'synthetic oil'],
  'tire-rotation':      ['tire rotation', 'tire rotate', 'rotate and balance'],
  'brake-fluid-flush':  ['brake fluid', 'brake flush'],
  'engine-air-filter':  ['engine air filter', 'air filter'],
  'cabin-air-filter':   ['cabin air', 'cabin filter'],
  'coolant-flush':      ['coolant', 'antifreeze'],
  'transmission-fluid': ['transmission fluid', 'trans fluid'],
  'wheel-alignment':    ['alignment'],
  'battery-test':       ['battery test', 'battery check'],
  'spark-plugs':        ['spark plug'],
  'wiper-blades':       ['wiper', 'wiper blade'],
  'brake-pads':         ['brake pad'],
}

export function buildLastServicedMap(records = []) {
  const map = {}
  for (const record of records) {
    const mileage = record.mileage_at_service ?? 0
    if (!mileage) continue

    if (record.categories !== null && record.categories !== undefined) {
      // New path: use AI-assigned categories. A record with multiple
      // categories (e.g. ["oil-change","tire-rotation"]) updates all of them.
      const cats = Array.isArray(record.categories) ? record.categories : []
      for (const catId of cats) {
        if (!map[catId] || mileage > map[catId]) {
          map[catId] = mileage
        }
      }
    } else {
      // Legacy fallback: keyword matching for records where categories is NULL
      // (rows created before Phase 2.5b). Hit rate drops to zero once all
      // existing records have categories populated.
      const name = (record.service_type || '').toLowerCase()
      for (const [id, terms] of Object.entries(SERVICE_KEYWORDS)) {
        if (terms.some((t) => name.includes(t))) {
          if (!map[id] || mileage > map[id]) {
            map[id] = mileage
          }
        }
      }
    }
  }
  return map
}

/**
 * Sort helper — overdue first (most overdue first), then due-soon
 * (closest first), then upcoming (closest first), then no-baseline
 * (informational, sorts to the bottom alphabetically by name since
 * those items have `milesUntilDue === null`).
 */
export function sortByUrgency(a, b) {
  const order = {
    overdue:              0,
    'likely-overdue':     1,
    'consider-now':       2,
    'due-soon':           3,
    upcoming:             4,
    'milestone-upcoming': 5,
    'no-baseline':        6,
    'milestone-distant':  7,  // filtered from road-ahead; listed last for other consumers
  }
  if (order[a.status] !== order[b.status]) {
    return order[a.status] - order[b.status]
  }
  // Within-group tiebreaks
  if (a.status === 'no-baseline') return a.name.localeCompare(b.name)
  if (a.status === 'overdue') return a.milesUntilDue - b.milesUntilDue  // most negative first
  // Milestone advisory groups: sort by dueAroundMiles ascending (lower window first)
  if (a.status === 'likely-overdue' || a.status === 'consider-now' || a.status === 'milestone-upcoming') {
    return a.dueAroundMiles - b.dueAroundMiles
  }
  // due-soon, upcoming: closest first
  return a.milesUntilDue - b.milesUntilDue
}
