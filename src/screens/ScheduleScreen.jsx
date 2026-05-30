/**
 * ScheduleScreen — v2 "Road Ahead" timeline.
 *
 * Pure forward-looking view: odometer card + glowing vertical timeline
 * of upcoming/overdue services within a 5,000-mile horizon. Severity
 * coloring carries all the urgency information — no separate tabs, no
 * overdue banner, no pre-visit CTA (the last one was explicitly cut
 * from Phase 2).
 *
 * History viewing/deleting is NOT in this phase. The legacy
 * src/screens/_legacy/ScheduleScreen.jsx is preserved if needed.
 *
 * All schedule math (`computeServiceStatus`, `sortByUrgency`,
 * `buildLastServicedMap`) comes from src/data/maintenance-intervals.js.
 * The only display-side logic added here is predicted-date estimation
 * (mpm derived from service-record dates) and the next-up promotion.
 */

import { Fragment } from 'react'
import AppShell from '../design-system/AppShell.jsx'
import {
  Logo,
  MicroLabel,
  AvatarButton,
  OdometerCard,
  TimelineRail,
  ServiceStop,
  TabBar,
} from '../design-system/primitives'
import {
  buildLastServicedMap,
  computeServiceStatus,
  sortByUrgency,
} from '../data/maintenance-intervals.js'

const HORIZON_MI = 5000

export default function ScheduleScreen({
  user,
  vehicles = [],
  activeVehicle = 0,
  serviceRecords = [],
  onNavigate,
  onOpenAccount,
}) {
  const v = vehicles[activeVehicle]
  const currentMileage = v?.milesRaw ?? v?.current_mileage ?? 0
  const modelName = (v?.model || v?.nickname || '').toUpperCase()

  // ─── Pipeline ───────────────────────────────────────────────────
  // 1. Build last-serviced map and compute statuses.
  // 2. Filter: overdue, no-baseline, and milestone advisories always
  //    survive; recurring predictions must land inside the horizon.
  //    'milestone-distant' needs no special case — it has nextDueAt:null
  //    and is absent from ALWAYS_SHOW, so Number.isFinite(null) drops it
  //    automatically. It only surfaces once the car is within LEAD_MILES
  //    of the window, at which point it becomes 'milestone-upcoming'.
  // 3. Sort with sortByUrgency (overdue → likely-overdue → consider-now
  //    → due-soon → upcoming → milestone-upcoming → no-baseline).
  // 4. Promote the first non-overdue *recurring* stop to "next-up".
  //    Milestones are never promoted to next-up (no precise timeline).
  // 5. Map to ServiceStop view-models.
  const lastServicedMap = buildLastServicedMap(serviceRecords)
  const horizonCutoff = currentMileage + HORIZON_MI

  const ALWAYS_SHOW = new Set([
    'overdue',
    'no-baseline',
    'consider-now',
    'likely-overdue',
    'milestone-upcoming',
  ])

  const filtered = computeServiceStatus(currentMileage, lastServicedMap, v)
    .filter((s) => {
      if (ALWAYS_SHOW.has(s.status)) return true
      return Number.isFinite(s.nextDueAt) && s.nextDueAt <= horizonCutoff
    })
    .sort(sortByUrgency)

  // Next-up promotion — first recurring item with a real prediction.
  // Milestone items (even with history) are excluded from next-up so the
  // promotion stays anchored to a precise predicted mileage.
  const nextUpIdx = filtered.findIndex(
    (s) =>
      (s.status === 'due-soon' || s.status === 'upcoming') &&
      s.kind === 'recurring',
  )

  const stops = filtered.map((s, i) =>
    toViewModel(s, currentMileage, serviceRecords, i === nextUpIdx),
  )

  // Badge counts the amber tier: due-soon (recurring) + consider-now +
  // likely-overdue (milestones). Overdue items are visually unmissable
  // (red) so they're excluded — the badge is for "worth attending to"
  // items, not "already on fire" items. The promoted next-up shows as
  // cyan and is therefore also excluded.
  const attentionCount = stops.filter(
    (s) =>
      s.severity === 'due-soon' ||
      s.severity === 'consider-now' ||
      s.severity === 'likely-overdue',
  ).length

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
        <section style={{ padding: '22px 20px 0' }}>
          <MicroLabel>The road ahead</MicroLabel>
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
            Next{' '}
            <span style={{ color: 'var(--color-primary)' }}>
              {HORIZON_MI.toLocaleString()}
            </span>{' '}
            miles
          </h1>
        </section>

        {/* Odometer card */}
        <div style={{ margin: '22px 20px 0' }}>
          <OdometerCard
            currentMileage={currentMileage}
            vehicleName={modelName}
            attentionCount={attentionCount}
          />
        </div>

        {/* Section header */}
        <div
          className="flex items-center"
          style={{ margin: '24px 0 0', padding: '0 20px', gap: 10 }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 3,
              height: 14,
              background: 'var(--color-primary)',
              borderRadius: 2,
            }}
          />
          <span
            className="font-display uppercase"
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '1.4px',
              color: 'var(--color-text)',
            }}
          >
            Scheduled Stops
          </span>
        </div>

        {/* Timeline */}
        {stops.length === 0 ? (
          <div
            style={{
              margin: '18px 20px 0',
              padding: '14px 0',
              fontSize: 13,
              color: 'var(--color-text-dim)',
              fontFamily: 'var(--font-body)',
            }}
          >
            No upcoming services predicted yet.
          </div>
        ) : (
          <div
            className="relative"
            style={{ margin: '18px 20px 0' }}
          >
            <TimelineRail />
            {stops.map((stop, i) => {
              // Separator fires only at the transition into the no-baseline
              // group (recurring items with no history). Milestone advisory
              // cards (consider-now, likely-overdue, milestone-upcoming) are
              // interleaved by urgency near the top — they are NOT part of
              // the "no history yet" group and don't trigger this separator.
              const isFirstNoBaseline =
                stop.severity === 'no-baseline' &&
                stops[i - 1]?.severity !== 'no-baseline'
              return (
                <Fragment key={stop.key}>
                  {isFirstNoBaseline && (
                    <div style={{ padding: '4px 0 12px 54px' }}>
                      <MicroLabel color="var(--color-text-mute)">
                        No history yet
                      </MicroLabel>
                    </div>
                  )}
                  <ServiceStop
                    predictedMileage={stop.predictedMileage}
                    predictedDate={stop.predictedDate}
                    dueText={stop.dueText}
                    serviceName={stop.serviceName}
                    intervalText={stop.intervalText}
                    severity={stop.severity}
                    isLast={i === stops.length - 1}
                  />
                </Fragment>
              )
            })}
          </div>
        )}

        {/* Bottom spacer (TabBar is 92px) */}
        <div style={{ height: 110 }} />
      </AppShell>

      <TabBar
        active="next"
        onHome={() => onNavigate('home')}
        onFleet={() => onNavigate('fleet')}
        onFab={() => onNavigate('import')}
        onNext={() => onNavigate('schedule')}
        onMe={onOpenAccount}
      />
    </>
  )
}

// ─── View-model + helpers ─────────────────────────────────────────

function toViewModel(s, currentMileage, serviceRecords, isNextUp) {
  // ── Milestone advisory states (no history) ──────────────────────
  // These have no predicted mileage; they use dueAroundMiles as the
  // approximate anchor. ServiceStop renders `~X MI` for these.
  if (s.status === 'consider-now') {
    return {
      key: s.id,
      predictedMileage: s.dueAroundMiles,
      predictedDate: '',
      dueText: 'CONSIDER NOW',
      serviceName: s.name,
      intervalText: `Typically around ${s.dueAroundMiles.toLocaleString()} mi`,
      severity: 'consider-now',
    }
  }

  if (s.status === 'likely-overdue') {
    return {
      key: s.id,
      predictedMileage: s.dueAroundMiles,
      predictedDate: '',
      dueText: 'LIKELY OVERDUE',
      serviceName: s.name,
      intervalText: `Typically around ${s.dueAroundMiles.toLocaleString()} mi`,
      severity: 'likely-overdue',
    }
  }

  if (s.status === 'milestone-upcoming') {
    const milesAway = Math.round(s.dueAroundMiles - currentMileage)
    return {
      key: s.id,
      predictedMileage: s.dueAroundMiles,
      predictedDate: '',
      dueText: `IN ~${milesAway.toLocaleString()} MI`,
      serviceName: s.name,
      intervalText: `Typically around ${s.dueAroundMiles.toLocaleString()} mi`,
      severity: 'milestone-upcoming',
    }
  }

  // ── No-baseline (recurring, no history) ─────────────────────────
  // Communicates "we have no record — worth logging."
  if (s.status === 'no-baseline') {
    return {
      key: s.id,
      predictedMileage: null,
      predictedDate: '',
      dueText: 'WORTH LOGGING',
      serviceName: s.name,
      intervalText: s.intervalMiles
        ? `Typically every ${s.intervalMiles.toLocaleString()} mi`
        : s.intervalMonths
          ? `Typically every ${s.intervalMonths} mo`
          : 'Manufacturer recommended',
      severity: 'no-baseline',
    }
  }

  // ── Recurring (or milestone with history) ───────────────────────
  const delta = s.milesUntilDue
  const isOverdue = s.status === 'overdue'

  let severity
  if (isOverdue) severity = 'overdue'
  else if (isNextUp) severity = 'next-up'
  else if (s.status === 'due-soon') severity = 'due-soon'
  else severity = 'coming-up'

  const dueText = isOverdue
    ? `OVERDUE BY ${Math.abs(delta).toLocaleString()} MI`
    : `IN ${delta.toLocaleString()} MI`

  return {
    key: s.id,
    predictedMileage: s.nextDueAt,
    predictedDate: predictDateLabel(
      s.nextDueAt,
      currentMileage,
      serviceRecords,
    ),
    dueText,
    serviceName: s.name,
    intervalText: s.intervalMiles
      ? `Every ${s.intervalMiles.toLocaleString()} mi`
      : 'Custom',
    severity,
  }
}

/**
 * Project a calendar date for when a target mileage will be reached.
 * Strategy:
 *   - If 2+ dated service records exist, derive miles-per-month from
 *     the date range.
 *   - If 1 exists, use (currentMileage - that mileage) / (months since
 *     that date) as the estimate.
 *   - Else default to 1,000 mi/month (~12k mi/year, typical commuter).
 * Returns a formatted "~MON YYYY" string. Always prefixed with `~` to
 * communicate it's an estimate.
 */
function predictDateLabel(targetMileage, currentMileage, serviceRecords) {
  if (!Number.isFinite(targetMileage)) return ''
  const mpm = estimateMilesPerMonth(currentMileage, serviceRecords)
  const monthsAhead = (targetMileage - currentMileage) / mpm
  const date = new Date()
  date.setMonth(date.getMonth() + monthsAhead)
  return (
    '~' +
    date
      .toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      .toUpperCase()
  )
}

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44
const DEFAULT_MPM = 1000

function estimateMilesPerMonth(currentMileage, serviceRecords) {
  const dated = (serviceRecords || [])
    .filter(
      (r) =>
        r.service_date &&
        Number.isFinite(r.mileage_at_service) &&
        r.mileage_at_service > 0,
    )
    .sort(
      (a, b) => new Date(a.service_date) - new Date(b.service_date),
    )

  if (dated.length >= 2) {
    const first = dated[0]
    const last = dated[dated.length - 1]
    const dMi = last.mileage_at_service - first.mileage_at_service
    const dMonths =
      (new Date(last.service_date) - new Date(first.service_date)) /
      MS_PER_MONTH
    if (dMonths > 0.1 && dMi > 0) return dMi / dMonths
  } else if (dated.length === 1) {
    const r = dated[0]
    const dMi = currentMileage - r.mileage_at_service
    const dMonths =
      (Date.now() - new Date(r.service_date).getTime()) / MS_PER_MONTH
    if (dMonths > 0.1 && dMi > 0) return dMi / dMonths
  }
  return DEFAULT_MPM
}
