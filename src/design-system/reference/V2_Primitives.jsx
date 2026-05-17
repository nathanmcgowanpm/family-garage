// V2_Primitives.jsx — shared for the Arctic Signal v2 exploration
// Assumes window.FG already set to Arctic palette by parent

const V2 = {
  // Use a fresh palette reference pinned to Arctic so these screens
  // don't depend on global FG mutation timing
  ink: '#0A0C0E',
  surface: '#131619',
  surface2: '#1C2024',
  surface3: '#262B31',
  line: 'rgba(120,200,255,0.06)',
  line2: 'rgba(120,200,255,0.14)',
  line3: 'rgba(120,200,255,0.22)',
  text: '#F5F7FA',
  textDim: 'rgba(245,247,250,0.62)',
  textMute: 'rgba(245,247,250,0.36)',
  primary: '#3DD6FF',
  primaryDim: 'rgba(61,214,255,0.12)',
  primaryLine: 'rgba(61,214,255,0.36)',
  signal: '#FFE15D',
  danger: '#FF4D6D',
  go: '#6DFFB0',
};

const DISP = "'Space Grotesk', -apple-system, system-ui, sans-serif";
const MON = "'JetBrains Mono', 'SF Mono', ui-monospace, monospace";
const BOD = "'Inter', -apple-system, system-ui, sans-serif";

// Shared: App chrome for all v2 screens
function V2StatusBar({ dark = true }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 28px 0', position: 'relative', zIndex: 20,
      fontFamily: '-apple-system, system-ui', color: c,
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>9:41</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="0.6" fill={c}/><rect x="4.5" y="5" width="3" height="6" rx="0.6" fill={c}/><rect x="9" y="2.5" width="3" height="8.5" rx="0.6" fill={c}/><rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c}/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="21" height="10" rx="2.5" stroke={c} strokeOpacity="0.45" fill="none"/><rect x="2" y="2" width="18" height="7" rx="1.4" fill={c}/><rect x="22" y="3.5" width="1.5" height="4" rx="0.5" fill={c} opacity="0.5"/></svg>
      </div>
    </div>
  );
}

// Logo mark — minimalist
function V2Mark({ size = 22 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4 20V9l8-5 8 5v11" stroke={V2.primary} strokeWidth="1.6" strokeLinejoin="round"/>
        <circle cx="12" cy="13" r="2.5" fill={V2.primary}/>
      </svg>
      <div style={{
        fontFamily: DISP, fontWeight: 700, fontSize: 13, letterSpacing: 1.8,
        textTransform: 'uppercase', color: V2.text,
      }}>
        FAMILY<span style={{ color: V2.primary, marginLeft: 4 }}>GARAGE</span>
      </div>
    </div>
  );
}

// Tab bar
function V2TabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'fleet', label: 'Fleet' },
    { id: 'log', label: 'Log', fab: true },
    { id: 'schedule', label: 'Next' },
    { id: 'me', label: 'Me' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 92, paddingBottom: 28, zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around',
      padding: '10px 12px 28px',
      background: `linear-gradient(to top, ${V2.ink} 60%, rgba(10,12,14,0.8))`,
      borderTop: `1px solid ${V2.line}`,
      backdropFilter: 'blur(20px)',
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        if (t.fab) {
          return (
            <div key={t.id} style={{
              width: 48, height: 48, borderRadius: 14, marginBottom: 2,
              background: `linear-gradient(180deg, #5EE2FF 0%, ${V2.primary} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 20px rgba(61,214,255,0.4), inset 0 1px 0 rgba(255,255,255,0.4)`,
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 4v14M4 11h14" stroke={V2.ink} strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
          );
        }
        return (
          <div key={t.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            minWidth: 44, paddingTop: 6,
          }}>
            <div style={{
              width: 4, height: 4, borderRadius: 4,
              background: isActive ? V2.primary : 'transparent',
              boxShadow: isActive ? `0 0 8px ${V2.primary}` : 'none',
            }}/>
            <div style={{
              fontFamily: MON, fontSize: 9, letterSpacing: 1.6, fontWeight: 500,
              textTransform: 'uppercase',
              color: isActive ? V2.primary : V2.textMute,
            }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// Micro label
function V2Label({ children, color = V2.primary }) {
  return <div style={{
    fontFamily: MON, fontSize: 9, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase', color,
  }}>{children}</div>;
}

// Tabular number display
function V2Num({ children, size = 16, color = V2.text, bold = true }) {
  return <span style={{
    fontFamily: MON, fontWeight: bold ? 600 : 400, fontSize: size,
    fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3, color,
  }}>{children}</span>;
}

// Shell wraps a v2 screen with iOS frame and consistent top padding
function V2Shell({ children, tab = 'home', dark = true }) {
  return (
    <IOSDevice width={390} height={844} dark={dark}>
      <div style={{
        position: 'absolute', inset: 0,
        background: V2.ink, color: V2.text, fontFamily: BOD,
        overflow: 'hidden',
      }}>
        <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 100 }}>
          {children}
        </div>
        <V2TabBar active={tab}/>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { V2, DISP, MON, BOD, V2StatusBar, V2Mark, V2TabBar, V2Label, V2Num, V2Shell });
