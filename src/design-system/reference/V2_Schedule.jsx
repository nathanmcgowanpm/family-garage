// V2_Schedule.jsx — Service timeline as a horizontal road ahead

function V2Schedule() {
  return (
    <V2Shell tab="schedule">
      <V2StatusBar />
      <div style={{ height: 54 }} />

      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <V2Mark />
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <V2Label>The road ahead</V2Label>
        <div style={{
          marginTop: 10, fontFamily: DISP, fontWeight: 700, fontSize: 30,
          lineHeight: 1.05, letterSpacing: -1,
        }}>
          Next <span style={{ color: V2.primary }}>5,000</span><br/>miles
        </div>
      </div>

      {/* Big odometer readout */}
      <div style={{
        margin: '22px 20px 0', padding: '20px 22px',
        borderRadius: 18, background: V2.surface, border: `1px solid ${V2.line2}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <V2Label color={V2.textMute}>Currently at</V2Label>
          <div style={{
            fontFamily: DISP, fontWeight: 700, fontSize: 34, letterSpacing: -1,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginTop: 6,
          }}>42,000</div>
          <div style={{
            fontFamily: MON, fontSize: 9, letterSpacing: 1.4, color: V2.textDim,
            textTransform: 'uppercase', marginTop: 4,
          }}>MILES · HIGHLANDER</div>
        </div>
        <div style={{
          padding: '8px 12px', borderRadius: 10,
          background: V2.primaryDim, border: `1px solid ${V2.primaryLine}`,
        }}>
          <div style={{
            fontFamily: MON, fontSize: 8, letterSpacing: 1.4, color: V2.primary,
            textTransform: 'uppercase', fontWeight: 600,
          }}>Est ·  Due soon</div>
          <div style={{
            fontFamily: MON, fontSize: 20, fontWeight: 700, color: V2.primary,
            letterSpacing: -0.3, marginTop: 4, fontVariantNumeric: 'tabular-nums',
          }}>3<span style={{ fontSize: 11, letterSpacing: 1 }}>items</span></div>
        </div>
      </div>

      {/* Service stations — road metaphor */}
      <div style={{
        margin: '24px 0 0', padding: '0 20px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 3, height: 14, background: V2.primary, borderRadius: 2 }}/>
        <div style={{
          fontFamily: DISP, fontWeight: 700, fontSize: 13, letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}>Scheduled Stops</div>
      </div>

      {/* Timeline items */}
      <div style={{ margin: '18px 20px 0', position: 'relative' }}>
        {/* Road line */}
        <div style={{
          position: 'absolute', left: 18, top: 20, bottom: 20, width: 2,
          background: `linear-gradient(to bottom, ${V2.primary}, ${V2.line2})`,
        }}/>
        <SchedStop
          at="42,800" when="~Dec 2026" due="IN 800 MI"
          service="Oil & filter" interval="Every 5,000 mi"
          urgent
        />
        <SchedStop
          at="43,240" when="~Jan 2027" due="IN 1,240 MI"
          service="Tire rotation" interval="Every 6,000 mi"
        />
        <SchedStop
          at="44,500" when="~Mar 2027" due="IN 2,500 MI"
          service="Brake fluid flush" interval="Every 30,000 mi"
        />
        <SchedStop
          at="45,800" when="~Apr 2027" due="IN 3,800 MI"
          service="Wheel alignment" interval="Annual"
          last
        />
      </div>

      {/* Pre-visit prep */}
      <div style={{
        margin: '20px 20px 0', padding: 16, borderRadius: 16,
        background: `linear-gradient(135deg, ${V2.primary} 0%, #5EE2FF 100%)`,
        color: V2.ink,
        boxShadow: `0 14px 34px rgba(61,214,255,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12,
          background: `repeating-linear-gradient(45deg, transparent 0 10px, rgba(0,0,0,0.3) 10px 11px)`,
        }}/>
        <div style={{
          fontFamily: MON, fontSize: 9, letterSpacing: 1.6, fontWeight: 700,
          textTransform: 'uppercase', position: 'relative',
        }}>GENERATE · PRE-VISIT BRIEF</div>
        <div style={{
          marginTop: 8, fontFamily: DISP, fontWeight: 700, fontSize: 18,
          letterSpacing: -0.4, position: 'relative',
        }}>One-page summary<br/>for your mechanic</div>
        <div style={{
          marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8, background: V2.ink, color: V2.primary,
          fontFamily: DISP, fontWeight: 700, fontSize: 11, letterSpacing: 1.6,
          textTransform: 'uppercase', position: 'relative',
        }}>
          Build brief <span>→</span>
        </div>
      </div>
    </V2Shell>
  );
}

function SchedStop({ at, when, due, service, interval, urgent, last }) {
  return (
    <div style={{
      display: 'flex', gap: 16, paddingBottom: last ? 0 : 18, position: 'relative',
    }}>
      {/* Node */}
      <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 38,
          background: urgent ? V2.primary : V2.surface2,
          border: `2px solid ${urgent ? V2.primary : V2.line3}`,
          boxShadow: urgent ? `0 0 16px ${V2.primary}` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: MON, fontSize: 10, fontWeight: 700,
          color: urgent ? V2.ink : V2.textDim,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5" stroke={urgent ? V2.ink : V2.textDim} strokeWidth="1.4"/>
            <path d="M8 5v3l2 1.5" stroke={urgent ? V2.ink : V2.textDim} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Card */}
      <div style={{
        flex: 1, padding: 14, borderRadius: 12,
        background: V2.surface,
        border: `1px solid ${urgent ? V2.primaryLine : V2.line}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{
            fontFamily: MON, fontSize: 10, fontWeight: 600, letterSpacing: 1.4,
            color: urgent ? V2.primary : V2.textMute,
            fontVariantNumeric: 'tabular-nums',
          }}>@ {at} MI</span>
          <span style={{
            fontFamily: MON, fontSize: 9, letterSpacing: 1.2, color: V2.textMute,
            textTransform: 'uppercase',
          }}>{when}</span>
        </div>
        <div style={{
          marginTop: 6, fontFamily: DISP, fontWeight: 700, fontSize: 15,
          letterSpacing: -0.2,
        }}>{service}</div>
        <div style={{
          marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 8, borderTop: `1px solid ${V2.line}`,
        }}>
          <span style={{
            fontFamily: MON, fontSize: 9, letterSpacing: 1.2, color: V2.textDim,
            textTransform: 'uppercase',
          }}>{interval}</span>
          <span style={{
            fontFamily: MON, fontSize: 10, fontWeight: 600, letterSpacing: 1.2,
            color: urgent ? V2.primary : V2.text,
          }}>{due}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { V2Schedule });
