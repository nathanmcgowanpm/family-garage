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
    intervalMiles: 40000,
    intervalMonths: null,
    cost: { low: 150, high: 300, source: 'GreaseMonkey' },
    description: 'Replace brake pads per axle. Interval varies by driving style.',
    category: 'wear',
  },
]

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
 */
export function computeServiceStatus(currentMileage, lastServicedMap = {}) {
  return MAINTENANCE_ITEMS.map((item) => {
    const hasHistory = Object.prototype.hasOwnProperty.call(
      lastServicedMap,
      item.id,
    )
    const lastServicedAt = hasHistory ? lastServicedMap[item.id] : null
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
 * predictor knows when each maintenance item was most recently
 * performed. Matching is keyword-based (e.g. a record with
 * `service_type` "Synthetic Oil Change" maps to `oil-change`). This is
 * the same stub matcher the legacy ScheduleScreen used inline; lifted
 * here so HomeScreen can reuse it without duplicating logic.
 */
const SERVICE_KEYWORDS = {
  'oil-change':        ['oil change', 'oil & filter', 'synthetic oil'],
  'tire-rotation':     ['tire rotation', 'tire rotate', 'rotate and balance'],
  'brake-fluid-flush': ['brake fluid', 'brake flush'],
  'engine-air-filter': ['engine air filter', 'air filter'],
  'cabin-air-filter':  ['cabin air', 'cabin filter'],
  'coolant-flush':     ['coolant', 'antifreeze'],
  'transmission-fluid':['transmission fluid', 'trans fluid'],
  'wheel-alignment':   ['alignment'],
  'battery-test':      ['battery test', 'battery check'],
  'spark-plugs':       ['spark plug'],
  'wiper-blades':      ['wiper', 'wiper blade'],
  'brake-pads':        ['brake pad'],
}

export function buildLastServicedMap(records = []) {
  const map = {}
  for (const record of records) {
    const name = (record.service_type || '').toLowerCase()
    const mileage = record.mileage_at_service ?? 0
    if (!mileage) continue
    for (const [id, terms] of Object.entries(SERVICE_KEYWORDS)) {
      if (terms.some((t) => name.includes(t))) {
        if (!map[id] || mileage > map[id]) {
          map[id] = mileage
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
  const order = { overdue: 0, 'due-soon': 1, upcoming: 2, 'no-baseline': 3 }
  if (order[a.status] !== order[b.status]) {
    return order[a.status] - order[b.status]
  }
  if (a.status === 'no-baseline') {
    return a.name.localeCompare(b.name)
  }
  // Within same status group, closest-due first
  return a.milesUntilDue - b.milesUntilDue
}
