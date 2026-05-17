// V2_Onboard.jsx — Scan-first onboarding with camera as hero

function V2Onboard() {
  return (
    <V2Shell tab="fleet">
      <V2StatusBar />
      <div style={{ height: 54 }} />

      <div style={{ padding: '8px 20px 0' }}>
        <V2Mark />
      </div>

      {/* Progress rail */}
      <div style={{ padding: '24px 20px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          flex: 1, height: 2, background: V2.primary, borderRadius: 2,
          boxShadow: `0 0 8px ${V2.primary}`,
        }}/>
        <div style={{ flex: 1, height: 2, background: V2.line2, borderRadius: 2 }}/>
        <div style={{ flex: 1, height: 2, background: V2.line2, borderRadius: 2 }}/>
        <span style={{
          fontFamily: MON, fontSize: 10, letterSpacing: 1.4, color: V2.primary,
          marginLeft: 6,
        }}>01/03</span>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <V2Label>Add Vehicle · Scan mode</V2Label>
        <div style={{
          marginTop: 10,
          fontFamily: DISP, fontWeight: 700, fontSize: 34, lineHeight: 1.02,
          letterSpacing: -1.2,
        }}>
          Point at your<br/>
          <span style={{ color: V2.primary }}>VIN or plate.</span>
        </div>
        <div style={{
          marginTop: 10, fontSize: 13, color: V2.textDim, lineHeight: 1.5,
          paddingLeft: 12, borderLeft: `2px solid ${V2.primaryLine}`,
        }}>
          We'll pull year, make, model and trim automatically.
        </div>
      </div>

      {/* Camera viewfinder */}
      <div style={{
        margin: '22px 20px 0', height: 300, borderRadius: 20,
        background: '#050709',
        border: `1px solid ${V2.line2}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* simulated dashboard VIN plate */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 60%, #1a2329 0%, #050709 80%)',
        }}/>
        <div style={{
          position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%, -50%)',
          width: 210, height: 48, borderRadius: 4,
          background: 'linear-gradient(180deg, #b8a88e 0%, #8a7a60 100%)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: MON, fontSize: 14, letterSpacing: 2, fontWeight: 700,
          color: '#1a0f05', textShadow: '0 1px 0 rgba(255,255,255,0.2)',
        }}>1T4BK3DJXMU042188</div>

        {/* Viewfinder frame */}
        <div style={{
          position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%, -50%)',
          width: 240, height: 74,
        }}>
          {/* Corner brackets */}
          {['tl','tr','bl','br'].map(pos => {
            const isTop = pos[0] === 't', isLeft = pos[1] === 'l';
            return <div key={pos} style={{
              position: 'absolute',
              [isTop ? 'top' : 'bottom']: 0,
              [isLeft ? 'left' : 'right']: 0,
              width: 22, height: 22,
              borderTop: isTop ? `2.5px solid ${V2.primary}` : 'none',
              borderBottom: !isTop ? `2.5px solid ${V2.primary}` : 'none',
              borderLeft: isLeft ? `2.5px solid ${V2.primary}` : 'none',
              borderRight: !isLeft ? `2.5px solid ${V2.primary}` : 'none',
              boxShadow: `0 0 10px ${V2.primary}88`,
            }}/>;
          })}
          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '50%',
            height: 2, background: V2.primary, opacity: 0.9,
            boxShadow: `0 0 12px ${V2.primary}`,
          }}/>
        </div>

        {/* Recognized text overlay */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(10,12,14,0.85)', border: `1px solid ${V2.primaryLine}`,
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: 8, background: V2.go,
            boxShadow: `0 0 8px ${V2.go}`,
          }}/>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: MON, fontSize: 9, letterSpacing: 1.4, color: V2.go,
              textTransform: 'uppercase',
            }}>VIN RECOGNIZED</div>
            <div style={{
              fontFamily: MON, fontSize: 12, color: V2.text, fontWeight: 600,
              letterSpacing: 0.8, marginTop: 2,
            }}>2021 · TOYOTA · HIGHLANDER · XLE AWD</div>
          </div>
        </div>

        {/* Mode switcher */}
        <div style={{
          position: 'absolute', top: 12, left: 12, display: 'flex', gap: 0,
          padding: 3, borderRadius: 8,
          background: 'rgba(10,12,14,0.7)', border: `1px solid ${V2.line2}`,
          backdropFilter: 'blur(10px)',
        }}>
          {['VIN', 'PLATE', 'MANUAL'].map((m, i) => (
            <div key={m} style={{
              padding: '5px 10px', borderRadius: 6,
              background: i === 0 ? V2.primary : 'transparent',
              color: i === 0 ? V2.ink : V2.textDim,
              fontFamily: MON, fontSize: 9, fontWeight: 600, letterSpacing: 1.2,
            }}>{m}</div>
          ))}
        </div>

        {/* Flash toggle */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(10,12,14,0.7)', border: `1px solid ${V2.line2}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 1L3 8h3l-1 5 5-7H7l1-5z" fill={V2.signal}/></svg>
        </div>
      </div>

      {/* Confirm card */}
      <div style={{
        margin: '18px 20px 0', padding: 16, borderRadius: 14,
        background: V2.surface, border: `1px solid ${V2.line2}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: V2.primaryDim, border: `1px solid ${V2.primaryLine}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l4 4 8-8" stroke={V2.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <V2Label>Auto-filled</V2Label>
            <div style={{
              fontFamily: DISP, fontWeight: 700, fontSize: 18, marginTop: 4, letterSpacing: -0.3,
            }}>2021 Toyota Highlander</div>
            <div style={{
              fontFamily: MON, fontSize: 10, color: V2.textDim, letterSpacing: 1,
              textTransform: 'uppercase', marginTop: 4,
            }}>XLE AWD · 3.5L V6 · 8-spd auto</div>
          </div>
        </div>

        <div style={{
          marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          paddingTop: 14, borderTop: `1px solid ${V2.line}`,
        }}>
          <Metric label="Current ODO" value="42,000" unit="MI"/>
          <Metric label="Est. service due" value="800" unit="MI"/>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '18px 20px 0' }}>
        <button style={{
          width: '100%', height: 56, border: 'none', borderRadius: 14, cursor: 'pointer',
          background: `linear-gradient(180deg, #5EE2FF 0%, ${V2.primary} 100%)`,
          color: V2.ink, fontFamily: DISP, fontWeight: 700, fontSize: 13,
          letterSpacing: 2, textTransform: 'uppercase',
          boxShadow: `0 8px 24px rgba(61,214,255,0.3), inset 0 1px 0 rgba(255,255,255,0.4)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>Looks right — continue <span>→</span></button>
        <div style={{
          marginTop: 12, textAlign: 'center',
          fontFamily: MON, fontSize: 10, color: V2.textMute, letterSpacing: 1.4, textTransform: 'uppercase',
        }}>Not my vehicle · Edit details</div>
      </div>
    </V2Shell>
  );
}

function Metric({ label, value, unit }) {
  return (
    <div>
      <div style={{
        fontFamily: MON, fontSize: 9, letterSpacing: 1.4, color: V2.textMute,
        textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{
          fontFamily: MON, fontWeight: 600, fontSize: 18, color: V2.text,
          letterSpacing: -0.2, fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>
        <span style={{ fontFamily: MON, fontSize: 10, color: V2.textMute, letterSpacing: 1 }}>{unit}</span>
      </div>
    </div>
  );
}

Object.assign(window, { V2Onboard });
