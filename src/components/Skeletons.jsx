/**
 * Skeletons — loading state placeholders
 * ---------------------------------------
 * Matches the Family Garage dark aesthetic. Shimmer animation
 * driven by a single keyframe applied inline so it works
 * regardless of global CSS state.
 *
 * Usage:
 *   {loading ? <DashboardSkeleton /> : <Dashboard vehicles={vehicles} />}
 */

const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
  backgroundSize: '200% 100%',
  animation: 'fg-shimmer 1.4s ease-in-out infinite',
  borderRadius: 8,
}

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('fg-shimmer-keyframes')) {
  const style = document.createElement('style')
  style.id = 'fg-shimmer-keyframes'
  style.textContent = `
    @keyframes fg-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `
  document.head.appendChild(style)
}

export function VehicleCardSkeleton() {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ ...shimmerStyle, width: 48, height: 48, borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...shimmerStyle, height: 18, width: '60%', marginBottom: 8 }} />
          <div style={{ ...shimmerStyle, height: 13, width: '40%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ ...shimmerStyle, height: 32, flex: 1, borderRadius: 8 }} />
        <div style={{ ...shimmerStyle, height: 32, flex: 1, borderRadius: 8 }} />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div style={{ padding: '0 20px', paddingTop: 92, maxWidth: 672, margin: '0 auto' }}>
      <div style={{ ...shimmerStyle, height: 28, width: '45%', marginBottom: 8 }} />
      <div style={{ ...shimmerStyle, height: 14, width: '30%', marginBottom: 24 }} />
      <VehicleCardSkeleton />
      <VehicleCardSkeleton />
    </div>
  )
}

export function ServiceRecordSkeleton() {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
      }}
    >
      <div style={{ ...shimmerStyle, height: 16, width: '55%', marginBottom: 8 }} />
      <div style={{ ...shimmerStyle, height: 12, width: '35%' }} />
    </div>
  )
}
