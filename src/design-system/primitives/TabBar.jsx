/**
 * TabBar — fixed bottom navigation with center FAB.
 *
 * 5 tabs: Home / Fleet / [Log FAB] / Next / Me
 *
 * Position: fixed at the bottom of the viewport but horizontally
 * constrained so it matches the AppShell content column on tablet /
 * desktop. This is implemented by using the same `mx-auto` +
 * `max-w-shell-*` rule as AppShell on a fixed-bottom wrapper.
 *
 * Tab handlers are passed explicitly so the bar is agnostic to the
 * app's routing scheme (we're state-routed, no URL router yet).
 */

const TABS = [
  { id: 'home',  label: 'Home' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'fab' },
  { id: 'next',  label: 'Next' },
  { id: 'me',    label: 'Me' },
]

export default function TabBar({
  active = 'home',
  onHome,
  onFleet,
  onFab,
  onNext,
  onMe,
}) {
  const handlers = {
    home: onHome,
    fleet: onFleet,
    fab: onFab,
    next: onNext,
    me: onMe,
  }

  return (
    <div
      role="navigation"
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ pointerEvents: 'none' }}
    >
      {/* Inner: width-matched to the AppShell content column. The
         pointer-events split lets the outer be a full-width gradient
         catcher in future but for Phase 1 stays inert. */}
      <div
        className="mx-auto w-full sm:max-w-shell-tablet lg:max-w-shell-desktop"
        style={{ pointerEvents: 'auto' }}
      >
        <div
          className="flex items-end justify-around"
          style={{
            height: 92,
            paddingTop: 10,
            paddingBottom: 28,
            paddingLeft: 12,
            paddingRight: 12,
            background: 'var(--gradient-tab-bar)',
            borderTop: '1px solid var(--color-line)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {TABS.map((tab) => {
            if (tab.id === 'fab') {
              return (
                <button
                  key="fab"
                  type="button"
                  aria-label="Log a service record"
                  onClick={handlers.fab}
                  className="inline-flex items-center justify-center transition-transform active:scale-95"
                  style={{
                    width: 48,
                    height: 48,
                    marginBottom: 2,
                    borderRadius: 14,
                    background: 'var(--gradient-primary-button)',
                    boxShadow: 'var(--shadow-fab)',
                    border: 'none',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                    <path
                      d="M11 4v14M4 11h14"
                      stroke="var(--color-ink)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )
            }
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={handlers[tab.id]}
                aria-current={isActive ? 'page' : undefined}
                className="inline-flex flex-col items-center justify-center"
                style={{
                  minWidth: 44,
                  paddingTop: 6,
                  background: 'transparent',
                  border: 'none',
                  gap: 4,
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block rounded-pill"
                  style={{
                    width: 4,
                    height: 4,
                    background: isActive ? 'var(--color-primary)' : 'transparent',
                    boxShadow: isActive ? 'var(--shadow-primary-glow)' : 'none',
                    transition: 'background-color 150ms ease, box-shadow 150ms ease',
                  }}
                />
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '1.6px',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-mute)',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
