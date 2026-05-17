// V2_Home.jsx — Command-center home (Arctic Signal)
// UX shift: single-screen glance, odometer hero, status rail as timeline

function V2Home() {
  return (
    <V2Shell tab="home">
      <V2StatusBar />
      <div style={{ height: 54 }} />

      {/* Top: wordmark + avatar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 20px 20px',
      }}>
        <V2Mark />
        <div style={{
          width: 36, height: 36, borderRadius: 36, background: V2.surface2,
          border: `1px solid ${V2.line2}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: MON, fontSize: 11, fontWeight: 600, color: V2.primary,
        }}>JL</div>
      </div>

      {/* Fleet pill-strip — horizontal scrollable */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 20px 18px', overflowX: 'auto',
      }}>
        <FleetPill active name="Highlander" sub="'21 · 85" health={85}/>
        <FleetPill name="Civic" sub="'18 · 72" health={72}/>
        <FleetPill name="Tacoma" sub="'14 · 94" health={94}/>
        <FleetPill add />
      </div>

      {/* Hero: odometer + status */}
      <div style={{
        margin: '0 20px', padding: '22px 22px 20px',
        borderRadius: 20,
        background: `linear-gradient(180deg, ${V2.surface} 0%, ${V2.ink} 100%)`,
        border: `1px solid ${V2.line2}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 72, height: 1,
          background: `linear-gradient(to right, transparent, ${V2.primary}80, transparent)`,
        }}/>
        <div style={{
          position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 6, background: V2.go, boxShadow: `0 0 8px ${V2.go}` }}/>
          <span style={{ fontFamily: MON, fontSize: 9, letterSpacing: 1.4, color: V2.go }}>SYNCED · 09:42</span>
        </div>

        <V2Label>2021 Toyota Highlander · XLE AWD</V2Label>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <span style={{
            fontFamily: DISP, fontWeight: 700, fontSize: 64, lineHeight: 0.85,
            letterSpacing: -3, fontVariantNumeric: 'tabular-nums', color: V2.text,
          }}>42,000</span>
          <span style={{
            fontFamily: MON, fontSize: 12, letterSpacing: 1.8, color: V2.textMute,
            paddingBottom: 6, textTransform: 'uppercase',
          }}>miles</span>
        </div>
        <div style={{
          marginTop: 6, fontFamily: MON, fontSize: 10, letterSpacing: 1.2, color: V2.textDim,
          textTransform: 'uppercase',
        }}>
          ODO · <span style={{ color: V2.primary }}>+1,240 MI</span> since last log
        </div>

        {/* Health chip */}
        <div style={{
          marginTop: 20, display: 'flex', gap: 8,
        }}>
          <HealthChip score={85} label="Health" />
          <HealthChip score={3} label="Due soon" suffix="items" accent={V2.signal}/>
          <HealthChip score={1} label="Recalls" suffix="open" accent={V2.danger}/>
        </div>
      </div>

      {/* Service rail — horizontal timeline */}
      <div style={{ marginTop: 24, padding: '0 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <V2Label>Mileage horizon</V2Label>
        <span style={{ fontFamily: MON, fontSize: 9, letterSpacing: 1.4, color: V2.textMute }}>NEXT 5,000 MI →</span>
      </div>
      <MileageTape />

      {/* Activity — compact */}
      <div style={{ marginTop: 26, padding: '0 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <V2Label>Recent</V2Label>
        <span style={{ fontFamily: MON, fontSize: 9, letterSpacing: 1.4, color: V2.primary }}>LEDGER →</span>
      </div>
      <div style={{ margin: '10px 20px 0' }}>
        <ActRow title="Brake pad replacement" place="Precision Auto" amount="342.50" date="Aug 12" hot/>
        <ActRow title="Tire rotation" place="Self-service" amount="60.00" date="Jun 22"/>
        <ActRow title="Oil & filter change" place="Jiffy Lube" amount="89.00" date="Mar 04"/>
      </div>
    </V2Shell>
  );
}

function FleetPill({ name, sub, active, add, health }) {
  if (add) return (
    <div style={{
      flexShrink: 0, width: 78, height: 62, borderRadius: 14,
      border: `1px dashed ${V2.line3}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 4,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 2v10M2 7h10" stroke={V2.textDim} strokeWidth="1.6" strokeLinecap="round"/></svg>
      <span style={{ fontFamily: MON, fontSize: 8, letterSpacing: 1.4, color: V2.textMute }}>ADD</span>
    </div>
  );
  return (
    <div style={{
      flexShrink: 0, padding: '10px 14px', borderRadius: 14,
      background: active ? V2.primaryDim : V2.surface,
      border: `1px solid ${active ? V2.primaryLine : V2.line}`,
      minWidth: 120,
    }}>
      <div style={{
        fontFamily: DISP, fontWeight: 700, fontSize: 14, letterSpacing: 0.2,
        color: active ? V2.primary : V2.text,
      }}>{name}</div>
      <div style={{
        fontFamily: MON, fontSize: 9, letterSpacing: 1.2, color: V2.textDim,
        textTransform: 'uppercase', marginTop: 2,
      }}>{sub}</div>
    </div>
  );
}

function HealthChip({ score, label, suffix, accent = V2.primary }) {
  return (
    <div style={{
      flex: 1, padding: '10px 12px', borderRadius: 12,
      background: V2.surface2, border: `1px solid ${V2.line}`,
    }}>
      <div style={{
        fontFamily: MON, fontSize: 8, letterSpacing: 1.6, color: V2.textMute,
        textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
        <span style={{
          fontFamily: DISP, fontWeight: 700, fontSize: 22, letterSpacing: -0.6,
          color: accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{score}</span>
        <span style={{
          fontFamily: MON, fontSize: 9, color: V2.textMute, letterSpacing: 1,
          textTransform: 'uppercase',
        }}>{suffix || '/100'}</span>
      </div>
    </div>
  );
}

function MileageTape() {
  // Horizontal odometer strip with service markers
  const marks = [
    { at: 0, mi: '42,000', label: 'NOW', now: true },
    { at: 0.18, mi: '42,800', label: 'Oil', kind: 'oil' },
    { at: 0.40, mi: '43,240', label: 'Rotate', kind: 'tire' },
    { at: 0.70, mi: '44,500', label: 'Brake fluid', kind: 'brake', warn: true },
    { at: 0.95, mi: '45,800', label: 'Align', kind: 'align' },
  ];
  return (
    <div style={{
      margin: '14px 0 0', padding: '16px 0 22px',
      background: V2.surface, borderTop: `1px solid ${V2.line2}`, borderBottom: `1px solid ${V2.line2}`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Tick ruler */}
      <div style={{ height: 38, position: 'relative', marginBottom: 8 }}>
        <svg width="100%" height="38" style={{ display: 'block' }}>
          {Array.from({length: 40}).map((_, i) => {
            const major = i % 5 === 0;
            return <line key={i} x1={`${(i/40)*100}%`} y1="0" x2={`${(i/40)*100}%`}
              y2={major ? 14 : 7}
              stroke={major ? V2.line3 : V2.line2} strokeWidth="1"/>;
          })}
        </svg>
        {marks.map((m, i) => (
          <div key={i} style={{
            position: 'absolute', top: 18, left: `${m.at*100}%`, transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <div style={{
              width: m.now ? 3 : 2, height: m.now ? 20 : 14,
              background: m.now ? V2.primary : m.warn ? V2.signal : V2.primary,
              boxShadow: m.now ? `0 0 10px ${V2.primary}` : 'none',
              opacity: m.now ? 1 : m.warn ? 1 : 0.6,
            }}/>
          </div>
        ))}
      </div>
      {/* Labels below */}
      <div style={{ position: 'relative', height: 36, padding: '0 4px' }}>
        {marks.map((m, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, left: `${m.at*100}%`, transform: 'translateX(-50%)',
            textAlign: 'center', width: 70,
          }}>
            <div style={{
              fontFamily: MON, fontSize: 9, letterSpacing: 0.8, fontWeight: 600,
              color: m.now ? V2.primary : m.warn ? V2.signal : V2.text,
              fontVariantNumeric: 'tabular-nums',
            }}>{m.mi}</div>
            <div style={{
              fontFamily: MON, fontSize: 8, letterSpacing: 1.2, color: V2.textMute,
              textTransform: 'uppercase', marginTop: 2,
            }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActRow({ title, place, amount, date, hot }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
      borderBottom: `1px solid ${V2.line}`,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: 6,
        background: hot ? V2.primary : V2.textMute,
        boxShadow: hot ? `0 0 8px ${V2.primary}` : 'none',
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: DISP, fontWeight: 600, fontSize: 13, color: V2.text, letterSpacing: 0.2,
        }}>{title}</div>
        <div style={{
          fontFamily: MON, fontSize: 9, letterSpacing: 1.2, color: V2.textDim,
          textTransform: 'uppercase', marginTop: 2,
        }}>{place}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontFamily: MON, fontSize: 9, color: V2.textMute }}>$</span>
        <V2Num size={13} color={hot ? V2.primary : V2.text}>{amount}</V2Num>
        <div style={{
          fontFamily: MON, fontSize: 8, letterSpacing: 1.2, color: V2.textMute,
          textTransform: 'uppercase', marginTop: 2,
        }}>{date}</div>
      </div>
    </div>
  );
}

Object.assign(window, { V2Home });
