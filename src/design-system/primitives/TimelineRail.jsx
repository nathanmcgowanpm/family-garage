/**
 * TimelineRail — the glowing vertical line behind a stack of ServiceStops.
 *
 * Renders as an absolutely-positioned 2px-wide gradient bar. Inset
 * top/bottom by 20px so it ends at the centers of the first and last
 * stop nodes (nodes are 38px tall, 19px center; 20px gives a tight
 * visual lap).
 *
 * Must be rendered as a child of a `position: relative` container that
 * also holds the ServiceStops. Stops should have their own
 * `position: relative; zIndex: 1` so they paint over the rail.
 */

export default function TimelineRail({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={'absolute ' + className}
      style={{
        left: 18,
        top: 20,
        bottom: 20,
        width: 2,
        background:
          'linear-gradient(to bottom, var(--color-primary), var(--color-line-2))',
        pointerEvents: 'none',
      }}
    />
  )
}
