/**
 * AppShell — v2 design system
 *
 * Centered, max-width content container. Philosophy C: mobile design is
 * primary; on larger viewports the content widens to 600px (tablet) /
 * 720px (desktop) but the layout itself does not reflow into a sidebar.
 *
 * Breakpoints (Tailwind defaults — sm=640, lg=1024):
 *   <640px      full width
 *   640–1023px  max-width 600px, centered, 20px side padding
 *   ≥1024px     max-width 720px, centered, 24px side padding
 *
 * Phase 0 deliberately omits the iOS status bar, bottom tab bar, and any
 * other chrome. Those are Phase 1+ decisions. This wraps page content only.
 *
 * Not a replacement for src/components/AppShell.jsx — that one is still in
 * use by the legacy screens.
 */

export default function AppShell({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-ink text-text">
      <div
        className={
          'mx-auto w-full ' +
          'px-0 ' +
          'sm:max-w-shell-tablet sm:px-5 ' +
          'lg:max-w-shell-desktop lg:px-6 ' +
          className
        }
      >
        {children}
      </div>
    </div>
  )
}
