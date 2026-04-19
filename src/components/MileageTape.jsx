/**
 * MileageTape
 * -----------
 * A horizontal "ruler" replacing card-based service lists.
 * Shows a continuous span from current mileage to a horizon
 * (typically +5,000 miles), with service markers along the way.
 *
 * Design rationale (from refresh notes):
 *   "Instead of cards-of-services, a single horizontal ruler shows
 *    the road from 42,000 → 47,000. The 'NOW' tick glows; upcoming
 *    markers cluster ahead."
 *
 * Props:
 *   currentMileage: number        // e.g. 42000
 *   horizonMileage: number         // e.g. 47000
 *   services: Array<{
 *     id: string,
 *     label: string,              // e.g. "Oil", "Rotate"
 *     mileage: number,            // at what mileage
 *     priority?: 'normal' | 'warning' | 'danger',
 *   }>
 */

export default function MileageTape({
  currentMileage,
  horizonMileage,
  services,
}) {
  const range = horizonMileage - currentMileage;

  // Position on the tape, 0-100%
  const positionPct = (mileage) => {
    if (range <= 0) return 0;
    return Math.max(0, Math.min(100, ((mileage - currentMileage) / range) * 100));
  };

  // Generate tick marks every 200 miles
  const ticks = [];
  const tickInterval = 200;
  const firstTick = Math.ceil(currentMileage / tickInterval) * tickInterval;
  for (let m = firstTick; m <= horizonMileage; m += tickInterval) {
    ticks.push(m);
  }

  // Major labels every 1000 miles
  const isMajor = (m) => m % 1000 === 0;

  const priorityColor = (p) => {
    switch (p) {
      case 'warning':
        return 'var(--color-status-warning)';
      case 'danger':
        return 'var(--color-status-danger)';
      default:
        return 'var(--color-accent)';
    }
  };

  return (
    <div className="px-5 py-4">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-label">Mileage Horizon</span>
        <span className="font-mono text-xs text-text-tertiary tabular-nums">
          Next {range.toLocaleString()} mi →
        </span>
      </div>

      {/* The tape */}
      <div className="relative h-24">
        {/* Baseline ruler track */}
        <div
          className="absolute left-0 right-0 h-px"
          style={{
            top: '50%',
            background:
              'linear-gradient(to right, var(--color-border-subtle) 0%, var(--color-border-strong) 5%, var(--color-border-strong) 95%, var(--color-border-subtle) 100%)',
          }}
        />

        {/* Tick marks */}
        {ticks.map((m) => (
          <div
            key={m}
            className="absolute flex flex-col items-center"
            style={{
              left: `${positionPct(m)}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="bg-border-strong"
              style={{
                width: '1px',
                height: isMajor(m) ? '14px' : '6px',
                opacity: isMajor(m) ? 0.8 : 0.4,
              }}
            />
            {isMajor(m) && (
              <span
                className="font-mono text-xs text-text-tertiary tabular-nums absolute top-5"
                style={{ transform: 'translateX(-50%)', left: '50%' }}
              >
                {(m / 1000).toFixed(1)}k
              </span>
            )}
          </div>
        ))}

        {/* NOW tick — glowing cyan marker at current mileage */}
        <div
          className="absolute"
          style={{
            left: `${positionPct(currentMileage)}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: '12px',
              height: '12px',
              background: 'var(--color-accent)',
              boxShadow: 'var(--glow-accent)',
            }}
          />
          <div
            className="absolute top-[-22px] left-1/2 -translate-x-1/2 font-mono text-xs font-semibold tabular-nums whitespace-nowrap"
            style={{ color: 'var(--color-accent)' }}
          >
            NOW
          </div>
        </div>

        {/* Service markers */}
        {services.map((svc, idx) => {
          const pct = positionPct(svc.mileage);
          const color = priorityColor(svc.priority);
          // Alternate labels above/below to reduce overlap
          const labelAbove = idx % 2 === 0;

          return (
            <div
              key={svc.id}
              className="absolute"
              style={{
                left: `${pct}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Marker bar */}
              <div
                style={{
                  width: '2px',
                  height: '28px',
                  background: color,
                  opacity: 0.9,
                }}
              />
              {/* Label */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 ${
                  labelAbove ? 'bottom-[30px]' : 'top-[30px]'
                } whitespace-nowrap`}
              >
                <div
                  className="font-body text-xs font-medium"
                  style={{ color }}
                >
                  {svc.label}
                </div>
                <div className="font-mono text-xs text-text-tertiary tabular-nums">
                  {(svc.mileage / 1000).toFixed(1)}k
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
