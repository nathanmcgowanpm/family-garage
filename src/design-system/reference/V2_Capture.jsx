// V2_Capture.jsx — Receipt capture as live camera + auto-detected fields

function V2Capture() {
  return (
    <V2Shell tab="log">
      {/* Full-bleed camera viewport */}
      <div style={{
        position: 'absolute', inset: 0, background: '#050709',
      }}>
        {/* Simulated receipt in viewport */}
        <div style={{
          position: 'absolute', top: '42%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-2deg)',
          width: 250, minHeight: 320, padding: '18px 16px',
          background: '#f8f5ec', color: '#1a1612',
          fontFamily: MON, fontSize: 10, lineHeight: 1.45,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}>
          <div style={{ fontFamily: DISP, fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>JIFFY LUBE</div>
          <div style={{ fontSize: 8, letterSpacing: 0.8 }}>1247 MAIN ST · #04218</div>
          <div style={{ borderTop: '1px dashed #333', margin: '10px 0', opacity: 0.4 }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>DATE</span><span>04.18.26</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>TIME</span><span>14:32</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>MILEAGE</span><span>42,000</span></div>
          <div style={{ borderTop: '1px dashed #333', margin: '10px 0', opacity: 0.4 }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Oil Change · 5W-30</span><span>$59.99</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Filter</span><span>$12.50</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Labor</span><span>$16.51</span></div>
          <div style={{ borderTop: '1px dashed #333', margin: '10px 0', opacity: 0.4 }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>TOTAL</span><span>$89.00</span></div>
        </div>

        {/* Dim mask with hole */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(5,7,9,0.55)',
          mask: 'radial-gradient(ellipse 52% 40% at 50% 42%, transparent 98%, #000)',
          WebkitMask: 'radial-gradient(ellipse 52% 40% at 50% 42%, transparent 98%, #000)',
        }}/>

        {/* Detection bounding box — cyan */}
        <div style={{
          position: 'absolute', top: '42%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-2deg)',
          width: 262, height: 336,
          border: `1.5px solid ${V2.primary}`,
          boxShadow: `0 0 20px ${V2.primary}66, inset 0 0 20px ${V2.primary}22`,
        }}/>
        {/* Corner marks */}
        {['tl','tr','bl','br'].map(pos => {
          const isTop = pos[0] === 't', isLeft = pos[1] === 'l';
          return <div key={pos} style={{
            position: 'absolute',
            top: isTop ? 'calc(42% - 178px)' : 'auto',
            bottom: !isTop ? 'calc(58% - 178px)' : 'auto',
            left: isLeft ? 'calc(50% - 140px)' : 'auto',
            right: !isLeft ? 'calc(50% - 140px)' : 'auto',
            width: 16, height: 16,
            borderTop: isTop ? `3px solid ${V2.primary}` : 'none',
            borderBottom: !isTop ? `3px solid ${V2.primary}` : 'none',
            borderLeft: isLeft ? `3px solid ${V2.primary}` : 'none',
            borderRight: !isLeft ? `3px solid ${V2.primary}` : 'none',
            transform: `rotate(-2deg)`,
            boxShadow: `0 0 10px ${V2.primary}`,
          }}/>;
        })}

        {/* Top bar */}
        <div style={{
          position: 'absolute', top: 44, left: 0, right: 0,
          padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 36,
            background: 'rgba(10,12,14,0.6)', border: `1px solid ${V2.line2}`,
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M11 1L3 7l8 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          </div>
          <div style={{
            padding: '6px 12px', borderRadius: 100,
            background: 'rgba(10,12,14,0.6)', border: `1px solid ${V2.line2}`,
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: V2.go, boxShadow: `0 0 8px ${V2.go}` }}/>
            <span style={{ fontFamily: MON, fontSize: 10, letterSpacing: 1.6, color: V2.go, fontWeight: 600 }}>DETECTING</span>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 36,
            background: 'rgba(10,12,14,0.6)', border: `1px solid ${V2.line2}`,
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 1L3 8h3l-1 5 5-7H7l1-5z" fill={V2.signal}/></svg>
          </div>
        </div>

        {/* Detected fields floating around the receipt */}
        <FloatChip top={280} left={22} label="Shop" value="Jiffy Lube"/>
        <FloatChip top={305} right={22} label="Date" value="04.18.26"/>
        <FloatChip top={385} left={22} label="Service" value="Oil Change"/>
        <FloatChip top={450} right={22} label="Total" value="$89.00" accent/>

        {/* Bottom panel */}
        <div style={{
          position: 'absolute', bottom: 92, left: 0, right: 0, padding: '0 20px',
        }}>
          <div style={{
            background: 'rgba(10,12,14,0.85)', border: `1px solid ${V2.line2}`,
            borderRadius: 18, padding: 16, backdropFilter: 'blur(16px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <V2Label>Auto-parsed · 4 fields</V2Label>
              <span style={{
                fontFamily: MON, fontSize: 9, color: V2.go, letterSpacing: 1.2,
              }}>96% confidence</span>
            </div>
            <div style={{
              marginTop: 10, fontFamily: DISP, fontWeight: 700, fontSize: 17,
              letterSpacing: -0.3,
            }}>Oil Change · <V2Num size={17} color={V2.primary}>$89.00</V2Num></div>
            <div style={{
              marginTop: 2, fontFamily: MON, fontSize: 10, letterSpacing: 1.2,
              color: V2.textDim, textTransform: 'uppercase',
            }}>Jiffy Lube · Apr 18 · 42,000 mi</div>

            {/* Capture button */}
            <div style={{
              marginTop: 16, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: V2.surface2, border: `1px solid ${V2.line2}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h2l1-2h4l1 2h2v7H3V5z" stroke={V2.textDim} strokeWidth="1.4"/><circle cx="8" cy="8.5" r="2" stroke={V2.textDim} strokeWidth="1.4"/></svg>
              </div>
              <button style={{
                flex: 1, height: 40, border: 'none', borderRadius: 10, cursor: 'pointer',
                background: V2.primary, color: V2.ink,
                fontFamily: DISP, fontWeight: 700, fontSize: 12,
                letterSpacing: 1.8, textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 6px 18px rgba(61,214,255,0.35)`,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3h8v8H3z M5 5h4v4H5z" fill={V2.ink}/></svg>
                Capture & save
              </button>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: V2.surface2, border: `1px solid ${V2.line2}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v9m0 0l-3-3m3 3l3-3M3 13h10" stroke={V2.textDim} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </V2Shell>
  );
}

function FloatChip({ label, value, top, left, right, accent }) {
  return (
    <div style={{
      position: 'absolute', top, left, right,
      padding: '6px 10px', borderRadius: 8,
      background: accent ? V2.primary : 'rgba(10,12,14,0.85)',
      color: accent ? V2.ink : V2.text,
      border: accent ? 'none' : `1px solid ${V2.primaryLine}`,
      backdropFilter: 'blur(10px)',
      boxShadow: accent ? `0 6px 16px rgba(61,214,255,0.4)` : `0 2px 8px rgba(0,0,0,0.4)`,
      animation: 'pulse 2s infinite',
    }}>
      <div style={{
        fontFamily: MON, fontSize: 8, letterSpacing: 1.4,
        color: accent ? 'rgba(10,12,14,0.7)' : V2.textMute,
        textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: MON, fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, { V2Capture });
