/**
 * MobileContainer
 * ---------------
 * Wraps the app in a mobile-first layout.
 * On mobile: full width.
 * On desktop: constrained to iPhone Pro Max width, centered, with subtle
 * ambient cyan glow bleeding off the edges.
 *
 * Usage:
 *   <MobileContainer>
 *     <YourScreen />
 *   </MobileContainer>
 */

export default function MobileContainer({ children }) {
  return (
    <div className="min-h-screen w-full flex justify-center bg-bg-base">
      {/* Ambient glow — only visible on desktop where container is centered */}
      <div
        className="hidden md:block fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0, 212, 255, 0.06), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* The phone-width container */}
      <div
        className="
          relative w-full max-w-mobile min-h-screen
          flex flex-col
          md:my-8 md:rounded-xl md:overflow-hidden
          md:shadow-2xl md:border md:border-border-subtle
        "
        style={{
          background: 'var(--color-bg-base)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
