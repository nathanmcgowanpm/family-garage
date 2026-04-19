import { useState, useRef } from 'react'

// ─── Shared UI pieces ────────────────────────────────────────

function Icon({ name, fill = false, className = '', style = {} }) {
  return (
    <span
      className={`msym ${fill ? 'msym-fill' : ''} ${className}`}
      style={style}
    >
      {name}
    </span>
  )
}

function AppHeader({ screen, onNavigate, vehicleName }) {
  if (screen === 'onboarding') return null

  const isDefense = screen === 'defense'

  return (
    <header
      style={{
        background: isDefense ? 'rgba(248,250,252,0.92)' : 'rgba(2,6,23,0.85)',
        backdropFilter: 'blur(20px)',
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        borderBottom: '3px solid #ea580c',
        boxShadow: '0 4px 20px rgba(255,182,147,0.07)',
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px', height:72, maxWidth:672, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => onNavigate('dashboard')}>
          <Icon name="home_repair_service" style={{ color:'#f97316', fontSize:28 }} />
          <span style={{ fontFamily:'"Space Grotesk"', fontSize:20, fontWeight:900, letterSpacing:'-0.03em', fontStyle:'italic', textTransform:'uppercase', color: isDefense ? '#0f172a' : '#f8fafc' }}>
            Family Garage
          </span>
        </div>
        <HeaderActions screen={screen} onNavigate={onNavigate} />
      </div>
    </header>
  )
}

function HeaderActions({ screen, onNavigate }) {
  if (screen === 'dashboard') {
    return (
      <div style={{ width:34, height:34, borderRadius:'50%', border:'2px solid rgba(249,115,22,0.3)', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
        <Icon name="person" style={{ color:'#475569', fontSize:17 }} />
      </div>
    )
  }
  if (screen === 'import') {
    return <button onClick={() => onNavigate('schedule')} style={{ background:'none', border:'none', cursor:'pointer', color:'#f97316', fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>History</button>
  }
  if (screen === 'defense') {
    return <button onClick={() => onNavigate('dashboard')} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>Close</button>
  }
  return null
}

function BottomNav({ screen, onNavigate }) {
  if (screen === 'onboarding') return null
  const items = [
    { id:'dashboard', icon:'directions_car', label:'Garage' },
    { id:'schedule',  icon:'build',          label:'Service' },
    { id:'import',    icon:'receipt_long',   label:'Records' },
    { id:'defense',   icon:'security',       label:'Report' },
  ]
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, width:'100%', zIndex:50, background:'rgba(2,6,23,0.75)', backdropFilter:'blur(24px)', boxShadow:'0 -8px 30px rgba(0,0,0,0.5)', borderTopLeftRadius:'1.5rem', borderTopRightRadius:'1.5rem', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 8px 16px' }}>
      {items.map(item => {
        const active = screen === item.id
        return (
          <div key={item.id} onClick={() => onNavigate(item.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 14px', borderRadius:12, cursor:'pointer', color: active ? '#f97316' : '#475569', background: active ? 'rgba(249,115,22,0.1)' : 'transparent', transition:'all 0.2s' }}>
            <Icon name={item.icon} style={{ fontSize:22 }} />
            <span style={{ fontFamily:'Manrope', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em' }}>{item.label}</span>
          </div>
        )
      })}
    </nav>
  )
}

const contentArea = { padding:'88px 20px 100px', maxWidth:672, margin:'0 auto' }
const slab = { fontFamily:'"Space Grotesk"', fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.25em', color:'#f97316' }
const stitle = { fontFamily:'"Space Grotesk"', fontWeight:800, color:'#f8fafc', textTransform:'uppercase', letterSpacing:'-0.02em', fontStyle:'italic' }

function BtnPrimary({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'#f97316', color:'white', fontFamily:'"Space Grotesk"', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', borderRadius:'1rem', padding:'1.1rem 2rem', cursor:'pointer', border:'none', width:'100%', fontSize:'0.9rem', boxShadow:'0 8px 20px rgba(249,115,22,0.25)', transition:'all 0.15s', ...style }}>
      {children}
    </button>
  )
}

// ─── Screen 1: Onboarding ────────────────────────────────────

function OnboardingScreen({ onComplete, onSkip }) {
  const [year, setYear] = useState('2021')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [miles, setMiles] = useState('')

  const inputStyle = { background:'rgba(15,23,42,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'1rem', padding:'1rem', color:'#f8fafc', fontFamily:'Manrope', fontWeight:600, width:'100%', outline:'none', fontSize:'1rem' }
  const labelStyle = { fontFamily:'"Space Grotesk"', fontSize:10, fontWeight:700, color:'#f97316', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:6, display:'block', paddingLeft:4 }

  return (
    <div className="animate-page-in" style={{ minHeight:'100dvh' }}>
      {/* Onboarding-only header */}
      <header style={{ background:'rgba(2,6,23,0.85)', backdropFilter:'blur(20px)', position:'fixed', top:0, width:'100%', zIndex:50, borderBottom:'3px solid #ea580c' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px', height:72, maxWidth:672, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Icon name="home_repair_service" style={{ color:'#f97316', fontSize:28 }} />
            <span style={{ fontFamily:'"Space Grotesk"', fontSize:20, fontWeight:900, letterSpacing:'-0.03em', fontStyle:'italic', textTransform:'uppercase' }}>Family Garage</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
            <span style={{ ...slab, fontSize:9 }}>Step 1 of 3</span>
            <div style={{ display:'flex', gap:4 }}>
              <div style={{ height:4, width:24, background:'#f97316', borderRadius:2 }} />
              <div style={{ height:4, width:8, background:'#1e293b', borderRadius:2 }} />
              <div style={{ height:4, width:8, background:'#1e293b', borderRadius:2 }} />
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:560, margin:'0 auto', padding:'88px 20px 40px' }}>
        {/* Hero */}
        <div style={{ position:'relative', width:'100%', borderRadius:'1.5rem', overflow:'hidden', marginBottom:28, aspectRatio:'16/10', boxShadow:'0 20px 40px -15px rgba(249,115,22,0.2)' }}>
          <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1e293b,#0f172a)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="garage" style={{ fontSize:100, color:'rgba(249,115,22,0.15)' }} />
          </div>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#020617,transparent 60%)' }} />
          <div style={{ position:'absolute', bottom:16, left:20 }}><span style={slab}>Your vehicles. Your data.</span></div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ ...stitle, fontSize:'2.2rem', lineHeight:1, margin:'0 0 12px' }}>
            Meet your<br /><span style={{ color:'#f97316' }}>vehicle.</span>
          </h1>
          <p style={{ color:'#94a3b8', fontSize:14, lineHeight:1.7, borderLeft:'2px solid rgba(249,115,22,0.3)', paddingLeft:14, maxWidth:300, margin:0 }}>
            Enter your car details to start your precision maintenance ledger.
          </p>
        </div>

        {/* Form */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>Year</label>
              <select value={year} onChange={e => setYear(e.target.value)} style={{ ...inputStyle, appearance:'none' }}>
                {['2024','2023','2022','2021','2020','2019','2018','2017'].map(y => <option key={y} value={y} style={{ background:'#0f172a' }}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Make</label>
              <input style={inputStyle} type="text" placeholder="TOYOTA" value={make} onChange={e => setMake(e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Model</label>
            <input style={inputStyle} type="text" placeholder="HIGHLANDER" value={model} onChange={e => setModel(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Trim <span style={{ color:'#334155', fontWeight:400 }}>(optional)</span></label>
            <input style={inputStyle} type="text" placeholder="XLE AWD" />
          </div>
          <div>
            <label style={labelStyle}>Current Mileage</label>
            <div style={{ background:'rgba(15,23,42,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'1rem', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ padding:'1rem', display:'flex', alignItems:'center', gap:10, flex:1 }}>
                <Icon name="speed" style={{ color:'#f97316' }} />
                <input style={{ background:'transparent', border:'none', color:'#f8fafc', fontFamily:'Manrope', fontWeight:600, width:'100%', outline:'none', fontSize:'1rem' }} type="number" placeholder="42,000" value={miles} onChange={e => setMiles(e.target.value)} />
              </div>
              <span style={{ paddingRight:14, fontFamily:'"Space Grotesk"', fontSize:10, fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'0.15em' }}>mi</span>
            </div>
          </div>

          {/* Trust badge */}
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:14, background:'rgba(249,115,22,0.05)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:'1rem' }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'rgba(249,115,22,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name="verified_user" style={{ color:'#f97316' }} />
            </div>
            <div>
              <p style={{ fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 2px' }}>Secure & Local</p>
              <p style={{ fontSize:11, color:'#64748b', margin:0 }}>Your data is stored privately on this device.</p>
            </div>
          </div>

          <div style={{ paddingTop:4, display:'flex', flexDirection:'column', gap:8 }}>
            <BtnPrimary onClick={() => onComplete({ year, make: make||'Toyota', model: model||'Highlander', miles: miles||'42000' })}>
              Continue to Dashboard
            </BtnPrimary>
            <button onClick={onSkip} style={{ background:'none', border:'none', color:'#475569', fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', padding:10 }}>
              I'll do this later
            </button>
          </div>
        </div>

        {/* Tips */}
        <div style={{ marginTop:40, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { icon:'notifications_active', title:'Smart Alerts', desc:'Never miss a service interval.' },
            { icon:'history_edu', title:'Full History', desc:'Track every repair with ease.' },
          ].map(tip => (
            <div key={tip.icon} style={{ background:'rgba(15,23,42,0.4)', padding:20, borderRadius:'1.5rem', border:'1px solid rgba(255,255,255,0.04)' }}>
              <Icon name={tip.icon} style={{ color:'#f97316', fontSize:28, marginBottom:8, display:'block' }} />
              <p style={{ fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 4px' }}>{tip.title}</p>
              <p style={{ fontSize:10, color:'#475569', margin:0 }}>{tip.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// ─── Screen 2: Dashboard ─────────────────────────────────────

function DashboardScreen({ vehicles, activeVehicle, onSwitchVehicle, onNavigate }) {
  const v = vehicles[activeVehicle]
  return (
    <div className="animate-page-in" style={{ ...contentArea, display:'flex', flexDirection:'column', gap:18 }}>

      {/* Recall alert */}
      <div className="animate-pulse-dot" style={{ background:'#0f172a', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'1.25rem', padding:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div style={{ background:'rgba(239,68,68,0.15)', padding:10, borderRadius:12, flexShrink:0 }}>
            <Icon name="error" fill style={{ color:'#ef4444', fontSize:26 }} />
          </div>
          <div>
            <p style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:15, textTransform:'uppercase', letterSpacing:'-0.01em', margin:'0 0 3px' }}>Recall Alert: Airbag System</p>
            <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>Safety notice for 2018 Honda Odyssey. Schedule immediately.</p>
          </div>
        </div>
        <button onClick={() => onNavigate('defense')} style={{ background:'#ef4444', color:'white', padding:11, borderRadius:10, fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', border:'none', cursor:'pointer', width:'100%' }}>
          View Defense Report
        </button>
      </div>

      {/* Vehicle header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <h2 style={{ ...stitle, fontSize:'1.9rem', lineHeight:1, margin:'0 0 8px' }}>{v.name}</h2>
          <div style={{ display:'flex', gap:8 }}>
            <span style={{ background:'rgba(249,115,22,0.1)', color:'#f97316', padding:'3px 10px', borderRadius:6, fontSize:11, fontFamily:'"Space Grotesk"', fontWeight:800, textTransform:'uppercase' }}>{v.type}</span>
            <span style={{ background:'#1e293b', color:'#94a3b8', padding:'3px 10px', borderRadius:6, fontSize:11, fontFamily:'"Space Grotesk"', fontWeight:800, textTransform:'uppercase' }}>{v.miles}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onSwitchVehicle} style={{ color:'#f97316', display:'flex', alignItems:'center', gap:4, fontFamily:'Manrope', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', background:'none', border:'none', cursor:'pointer' }}>
            Switch <Icon name="expand_more" style={{ fontSize:16 }} />
          </button>
          <button onClick={() => onNavigate('onboarding')} style={{ color:'#475569', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
            <Icon name="add_circle" style={{ fontSize:20 }} />
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Health score */}
        <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:'1.25rem', padding:22, display:'flex', flexDirection:'column', alignItems:'center', gap:14, textAlign:'center', boxShadow:'0 10px 40px -10px rgba(249,115,22,0.08)' }}>
          <p style={{ fontFamily:'"Space Grotesk"', fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.2em', margin:0 }}>Health Score</p>
          <div style={{ position:'relative', width:108, height:108, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg style={{ position:'absolute', transform:'rotate(-90deg)' }} width="108" height="108">
              <circle cx="54" cy="54" r="44" fill="transparent" stroke="#1e293b" strokeWidth="7" />
              <circle cx="54" cy="54" r="44" fill="transparent" stroke="#f97316" strokeWidth="7" strokeDasharray="277" strokeDashoffset="42" strokeLinecap="round" />
            </svg>
            <div style={{ position:'absolute', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <span style={{ fontFamily:'"Space Grotesk"', fontSize:'2rem', fontWeight:900, lineHeight:1 }}>85</span>
              <span style={{ fontSize:8, fontFamily:'Manrope', fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'0.2em' }}>index</span>
            </div>
          </div>
          <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>Status: <span style={{ color:'#10b981', fontWeight:800, textTransform:'uppercase', fontStyle:'italic' }}>Good</span></p>
        </div>

        {/* Next due */}
        <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:'1.25rem', padding:20, display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden', boxShadow:'0 10px 40px -10px rgba(249,115,22,0.08)' }}>
          <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:'rgba(249,115,22,0.05)', borderRadius:'50%', filter:'blur(20px)' }} />
          <div>
            <span style={{ ...slab, fontSize:9, display:'block', marginBottom:6 }}>Next Due</span>
            <p style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1.05rem', textTransform:'uppercase', lineHeight:1.2, margin:0 }}>Oil Change<br /><span style={{ color:'#f97316' }}>450 mi</span></p>
          </div>
          <div style={{ marginTop:14 }}>
            <p style={{ fontSize:10, color:'#334155', textTransform:'uppercase', fontFamily:'"Space Grotesk"', fontWeight:700, letterSpacing:'0.1em', margin:'0 0 2px' }}>Est. Cost</p>
            <p style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1.05rem', margin:0 }}>$85–$110</p>
          </div>
          <button onClick={() => onNavigate('schedule')} style={{ marginTop:12, background:'#f97316', color:'white', padding:10, borderRadius:10, fontFamily:'"Space Grotesk"', fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', border:'none', cursor:'pointer', boxShadow:'0 4px 12px rgba(249,115,22,0.3)' }}>
            Schedule →
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
        {[
          { label:'Services', value:'14', sub:'total logged', color:'#f8fafc' },
          { label:'Spent',    value:'$2.4k', sub:'this year',    color:'#f97316' },
          { label:'Recalls',  value:'1',     sub:'open',         color:'#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:'1rem', padding:14, textAlign:'center' }}>
            <p style={{ fontSize:9, color:'#334155', textTransform:'uppercase', fontFamily:'"Space Grotesk"', fontWeight:700, letterSpacing:'0.12em', margin:'0 0 4px' }}>{s.label}</p>
            <p style={{ fontFamily:'"Space Grotesk"', fontWeight:900, fontSize:'1.5rem', color:s.color, margin:0 }}>{s.value}</p>
            <p style={{ fontSize:9, color:'#475569', margin:'2px 0 0' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:14 }}>
          <div>
            <h3 style={{ ...stitle, fontSize:'1.2rem', margin:'0 0 2px' }}>Recent Activity</h3>
            <p style={{ fontSize:12, color:'#475569', margin:0 }}>Maintenance logs & history</p>
          </div>
          <button onClick={() => onNavigate('schedule')} style={{ color:'#f97316', fontFamily:'Manrope', fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', background:'none', border:'none', cursor:'pointer' }}>Full Ledger</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { icon:'build', name:'Brake Pad Replacement', sub:'Front Axle · Precision Auto', cost:'$342.50', date:'Aug 12', opacity:1 },
            { icon:'tire_repair', name:'Tire Rotation', sub:'Routine · Self-service', cost:'$60.00', date:'Jun 22', opacity:0.75 },
            { icon:'oil_barrel', name:'Oil & Filter Change', sub:'Routine · Jiffy Lube', cost:'$89.00', date:'Mar 4', opacity:0.6 },
          ].map((item, i) => (
            <div key={i} className="technical-card" onClick={() => onNavigate('schedule')} style={{ borderRadius:'1rem', padding:16, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', opacity:item.opacity }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:46, height:46, background: i===0 ? 'rgba(249,115,22,0.1)' : '#1e293b', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', border: i===0 ? '1px solid rgba(249,115,22,0.2)' : 'none' }}>
                  <Icon name={item.icon} style={{ color: i===0 ? '#f97316' : '#475569' }} />
                </div>
                <div>
                  <p style={{ fontFamily:'"Space Grotesk"', fontWeight:700, fontSize:13, textTransform:'uppercase', margin:'0 0 2px' }}>{item.name}</p>
                  <p style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'0.03em', margin:0 }}>{item.sub}</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontFamily:'"Space Grotesk"', fontWeight:800, color: i===0 ? '#f97316' : '#94a3b8', fontSize:15, margin:0 }}>{item.cost}</p>
                  <p style={{ fontSize:10, color:'#334155', textTransform:'uppercase', fontWeight:700, margin:0 }}>{item.date}</p>
                </div>
                <Icon name="chevron_right" style={{ color:'#334155', fontSize:18 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import CTA */}
      <div onClick={() => onNavigate('import')} style={{ background:'#f97316', borderRadius:'1.25rem', padding:22, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', boxShadow:'0 10px 30px rgba(249,115,22,0.25)' }}>
        <div>
          <p style={{ ...stitle, fontSize:'1.1rem', color:'white', margin:'0 0 4px' }}>Import a Receipt</p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.75)', margin:0 }}>AI parses your service history automatically.</p>
        </div>
        <Icon name="add_a_photo" style={{ color:'white', fontSize:32, flexShrink:0 }} />
      </div>
    </div>
  )
}

// ─── Screen 3: Schedule ──────────────────────────────────────

function ScheduleScreen({ vehicles, activeVehicle, onNavigate }) {
  const [tab, setTab] = useState('due')
  const v = vehicles[activeVehicle]

  const dueItems = [
    { icon:'oil_barrel',  name:'Oil & Filter Change',     interval:'Every 5,000 miles', due:'IN 800 MI',   when:'DEC 2024' },
    { icon:'tire_repair', name:'Tire Rotation & Balance', interval:'Every 6,000 miles', due:'IN 1,240 MI', when:'JAN 2025' },
    { icon:'water_drop',  name:'Brake Fluid Flush',       interval:'Every 30,000 miles',due:'IN 2,500 MI', when:'MAR 2025' },
    { icon:'straighten',  name:'Wheel Alignment Check',   interval:'Annual',             due:'IN 3,800 MI', when:'APR 2025' },
  ]

  const historyItems = [
    { name:'Brake Pad Replacement', sub:'Precision Auto Care · Front Axle', cost:'$342.50', date:'Aug 12, 2024 · 41,820 mi', accent:true },
    { name:'Tire Rotation',         sub:'Self-service · All 4 tires',        cost:'$60.00',  date:'Jun 22, 2024 · 39,200 mi', accent:false },
    { name:'Full Synthetic Oil Change', sub:'Jiffy Lube · 5w-30',           cost:'$89.00',  date:'Mar 4, 2024 · 37,000 mi',  accent:false },
  ]

  return (
    <div className="animate-page-in" style={{ ...contentArea }}>
      {/* Vehicle header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20 }}>
        <div>
          <span style={{ ...slab, display:'block', marginBottom:4 }}>Maintenance Schedule</span>
          <h2 style={{ ...stitle, fontSize:'1.75rem', lineHeight:1, margin:'0 0 4px' }}>{v.name}</h2>
          <p style={{ fontSize:12, color:'#475569', margin:0 }}>Last synced: Today, 9:42 AM</p>
        </div>
        <div style={{ background:'#ea580c', padding:'10px 16px', borderRadius:8, borderBottom:'4px solid #9a3412', boxShadow:'0 4px 12px rgba(234,88,12,0.3)' }}>
          <span style={{ fontFamily:'"Space Grotesk"', fontWeight:900, fontSize:'0.95rem' }}>{v.milesRaw.toLocaleString()} MI</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'rgba(15,23,42,0.5)', border:'1px solid #1e293b', borderRadius:12, display:'flex', gap:4, padding:4, marginBottom:22 }}>
        {['due','overdue','history'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:10, borderRadius:8, fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', border:'none', background: tab===t ? '#ea580c' : 'transparent', color: tab===t ? 'white' : '#475569', boxShadow: tab===t ? '0 4px 12px rgba(249,115,22,0.3)' : 'none', transition:'all 0.2s' }}>
            {t === 'due' ? 'Due Soon' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Due tab */}
      {tab === 'due' && (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderLeft:'4px solid #f97316', paddingLeft:14, marginBottom:16 }}>
            <h3 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1.05rem', textTransform:'uppercase', letterSpacing:'-0.01em', margin:0 }}>Scheduled Maintenance</h3>
            <span style={{ background:'#1c1408', border:'1px solid rgba(249,115,22,0.3)', color:'#f97316', fontSize:9, fontFamily:'"Space Grotesk"', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', padding:'4px 10px', borderRadius:999 }}>Normal</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:22 }}>
            {dueItems.map((item, i) => (
              <div key={i} className="technical-card" style={{ borderRadius:'1rem', padding:16, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:44, height:44, background:'#1e293b', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #334155' }}>
                    <Icon name={item.icon} style={{ color:'#f97316' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily:'Manrope', fontWeight:800, fontSize:13, textTransform:'uppercase', letterSpacing:'0.02em', margin:'0 0 3px' }}>{item.name}</p>
                    <p style={{ fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700, margin:0 }}>{item.interval}</p>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontFamily:'"Space Grotesk"', fontWeight:800, color:'#f97316', fontSize:12, margin:0 }}>{item.due}</p>
                    <p style={{ fontSize:9, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700, margin:0 }}>{item.when}</p>
                  </div>
                  <Icon name="chevron_right" style={{ color:'#334155', fontSize:18 }} />
                </div>
              </div>
            ))}
          </div>
          {/* Tip */}
          <div style={{ background:'#0f172a', borderTop:'2px solid #ea580c', borderRadius:'1.5rem', padding:26, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:-60, bottom:-60, width:180, height:180, background:'rgba(249,115,22,0.06)', borderRadius:'50%', filter:'blur(30px)' }} />
            <h3 style={{ ...stitle, fontSize:'1.2rem', margin:'0 0 8px' }}>Pro Mechanic Tip</h3>
            <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.6, maxWidth:280, margin:'0 0 18px' }}>
              Rotating tires regularly extends their life by up to <span style={{ color:'#f97316', fontWeight:800 }}>10,000 miles</span>.
            </p>
            <button onClick={() => onNavigate('defense')} style={{ background:'#f97316', color:'white', padding:'11px 22px', borderRadius:'1rem', fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', border:'none', cursor:'pointer' }}>
              Pre-Visit Report →
            </button>
          </div>
        </>
      )}

      {/* Overdue tab */}
      {tab === 'overdue' && (
        <div>
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'1.25rem', padding:18, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <Icon name="error" fill style={{ color:'#ef4444' }} />
              <h3 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1rem', textTransform:'uppercase', margin:0 }}>System Critical (2)</h3>
            </div>
            {[
              { icon:'oil_barrel', name:'Oil & Filter Change', msg:'OVERDUE: +450 MI' },
              { icon:'air',        name:'Engine Air Filter',   msg:'OVERDUE: +1,200 MI' },
            ].map((item, i) => (
              <div key={i} style={{ background:'#020617', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:14, display:'flex', alignItems:'center', gap:12, marginBottom: i===0 ? 8 : 0 }}>
                <div style={{ width:38, height:38, background:'#dc2626', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name={item.icon} style={{ color:'white', fontSize:17 }} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:13, textTransform:'uppercase', margin:'0 0 2px' }}>{item.name}</p>
                  <p style={{ fontSize:10, color:'#ef4444', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>{item.msg}</p>
                </div>
                <button onClick={() => onNavigate('defense')} style={{ background:'#ef4444', color:'white', padding:'7px 12px', borderRadius:8, fontSize:10, fontFamily:'"Space Grotesk"', fontWeight:800, textTransform:'uppercase', border:'none', cursor:'pointer' }}>Fix</button>
              </div>
            ))}
          </div>
          <BtnPrimary onClick={() => onNavigate('defense')}>Generate Pre-Visit Report</BtnPrimary>
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {historyItems.map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:16, background:'#0f172a', border:'1px solid #1e293b', borderRadius:'1rem', opacity: i===0 ? 1 : i===1 ? 0.8 : 0.65 }}>
              <div style={{ width:2, background: i===0 ? '#f97316' : '#334155', borderRadius:1, alignSelf:'stretch', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <p style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:13, textTransform:'uppercase', margin:'0 0 2px' }}>{item.name}</p>
                    <p style={{ fontSize:11, color:'#475569', margin:0 }}>{item.sub}</p>
                  </div>
                  <p style={{ fontFamily:'"Space Grotesk"', fontWeight:800, color: i===0 ? '#f97316' : '#94a3b8', fontSize:14, margin:0, flexShrink:0 }}>{item.cost}</p>
                </div>
                <p style={{ fontSize:10, color:'#334155', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.08em', margin:'8px 0 0' }}>{item.date}</p>
              </div>
            </div>
          ))}
          <BtnPrimary onClick={() => onNavigate('import')} style={{ marginTop:6 }}>
            <Icon name="add" style={{ marginRight:8, fontSize:18 }} /> Import New Record
          </BtnPrimary>
        </div>
      )}
    </div>
  )
}

// ─── Screen 4: Import ────────────────────────────────────────

function ImportScreen({ onFinalize }) {
  const [parseState, setParseState] = useState('idle') // idle | parsing | done | error
  const [parsedData, setParsedData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef(null)

  function resetUpload() {
    if (fileRef.current) fileRef.current.value = ''
    setParseState('idle')
    setParsedData(null)
    setErrorMsg('')
  }

  function handleFileSelected(input) {
    if (!input.files || !input.files[0]) return
    const file = input.files[0]
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Please choose a file under 10MB.')
      input.value = ''
      return
    }
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage = file.type.startsWith('image/')
    if (!isPDF && !isImage) {
      alert('Please choose an image (JPEG, PNG) or PDF file.')
      input.value = ''
      return
    }
    setParseState('selected')
    setParsedData({ file, isPDF, isImage, previewUrl: isImage ? URL.createObjectURL(file) : null })
  }

  async function startParsing() {
    if (!parsedData?.file) return
    setParseState('parsing')
    setErrorMsg('')

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(parsedData.file)
      })

      const mediaType = parsedData.isPDF ? 'application/pdf' : parsedData.file.type

      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              {
                type: parsedData.isPDF ? 'document' : 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 },
              },
              {
                type: 'text',
                text: `You are parsing a vehicle service receipt. Extract the following fields and respond ONLY with valid JSON, no explanation, no markdown:
{
  "service_type": "short name of the service performed (e.g. Oil Change, Tire Rotation)",
  "shop_name": "name of the shop or dealership",
  "date": "date of service in MMM DD, YYYY format",
  "mileage": "odometer reading as a number string, or null if not found",
  "cost": "total cost as a number string without $ sign, or null if not found",
  "line_items": ["list of individual services or parts listed on the receipt"],
  "notes": "any other relevant info like oil type, part numbers, technician notes"
}
If a field cannot be found, use null. Do not guess.`,
              },
            ],
          }],
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${response.status}`)
      }

      const data = await response.json()
      const text = data.content?.find(b => b.type === 'text')?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setParsedData(prev => ({ ...prev, ...parsed }))
      setParseState('done')

    } catch (err) {
      console.error('Parse error:', err)
      setErrorMsg(err.message || 'Something went wrong. Try again.')
      setParseState('error')
    }
  }

  const inputStyle = { background:'rgba(15,23,42,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'1rem', padding:'1rem', color:'#f8fafc', fontFamily:'Manrope', fontWeight:600, width:'100%', outline:'none', fontSize:'1rem' }
  const labelStyle = { fontFamily:'"Space Grotesk"', fontSize:10, fontWeight:700, color:'#f97316', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:6, display:'block', paddingLeft:4 }

  return (
    <div className="animate-page-in" style={{ ...contentArea, maxWidth:480 }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ ...stitle, fontSize:'2rem', lineHeight:1, margin:'0 0 8px' }}>Ingest Record</h2>
        <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>Snap a photo of your receipt and let our AI handle the data entry.</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        style={{ display:'none' }}
        onChange={e => handleFileSelected(e.target)}
      />

      {/* Upload zone — idle or selected */}
      {(parseState === 'idle' || parseState === 'selected') && (
        <div style={{ position:'relative', marginBottom:28 }}>
          <div
            onClick={() => parseState === 'idle' && fileRef.current?.click()}
            style={{ aspectRatio:'4/3', borderRadius:'1.5rem', background:'#111827', border:`2px dashed ${parseState === 'selected' ? '#f97316' : '#334155'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, position:'relative', overflow:'hidden', cursor: parseState === 'idle' ? 'pointer' : 'default', transition:'all .2s' }}
          >
            {parseState === 'idle' && (
              <>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(249,115,22,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name="add_a_photo" style={{ color:'#f97316', fontSize:26 }} />
                </div>
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontFamily:'"Space Grotesk"', fontWeight:700, fontSize:16, margin:'0 0 4px' }}>Upload Receipt or Invoice</p>
                  <p style={{ fontSize:11, color:'#475569', margin:0 }}>JPEG, PNG or PDF · up to 10MB</p>
                </div>
              </>
            )}

            {parseState === 'selected' && parsedData && (
              <>
                {parsedData.isImage && parsedData.previewUrl && (
                  <img src={parsedData.previewUrl} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} alt="Receipt preview" />
                )}
                {parsedData.isPDF && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                    <Icon name="picture_as_pdf" style={{ color:'#f97316', fontSize:48 }} />
                    <p style={{ fontFamily:'"Space Grotesk"', fontWeight:700, fontSize:13, color:'#94a3b8', margin:0, padding:'0 20px', textAlign:'center' }}>{parsedData.file.name}</p>
                  </div>
                )}
                {/* Overlay */}
                <div style={{ position:'absolute', inset:0, background:'rgba(2,6,23,0.65)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', padding:20, gap:8 }}>
                  <p style={{ fontFamily:'"Space Grotesk"', fontSize:11, color:'rgba(255,255,255,0.6)', margin:0, textAlign:'center' }}>{parsedData.file?.name}</p>
                  <button
                    onClick={e => { e.stopPropagation(); startParsing() }}
                    style={{ width:'100%', background:'#f97316', color:'white', padding:14, borderRadius:12, fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:13, textTransform:'uppercase', letterSpacing:'0.1em', border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(249,115,22,0.4)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                  >
                    <Icon name="auto_awesome" style={{ fontSize:16 }} /> Parse with AI
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); resetUpload(); fileRef.current?.click() }}
                    style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', padding:4 }}
                  >
                    Choose different file
                  </button>
                </div>
              </>
            )}

            <div style={{ position:'absolute', bottom:-1, right:-1, width:42, height:42, background:'#ea580c', borderRadius:'12px 0 12px 0', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(249,115,22,0.3)' }}>
              <Icon name="auto_awesome" style={{ color:'white', fontSize:17 }} />
            </div>
          </div>
        </div>
      )}

      {/* Parsing state */}
      {parseState === 'parsing' && (
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Icon name="psychology" className="animate-spin-slow" style={{ color:'#f97316', fontSize:24 }} />
              <h3 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1.05rem', textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>AI Parsing...</h3>
            </div>
            <span style={{ background:'#f97316', color:'white', fontSize:9, fontFamily:'"Space Grotesk"', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', padding:'4px 10px', borderRadius:999 }}>ACTIVE</span>
          </div>
          <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:10, borderRadius:'1rem', overflow:'hidden', padding:1 }}>
            <div className="scanning-line animate-scan" />
            {['Service Type', 'Date', 'Shop', 'Cost'].map(label => (
              <div key={label} style={{ background:'#1e293b', padding:16, borderRadius:'1rem', border:'1px solid rgba(51,65,85,0.4)' }}>
                <p style={{ ...slab, margin:'0 0 8px' }}>{label}</p>
                <div className="skeleton animate-shimmer" style={{ height:18, width: label === 'Cost' ? '30%' : '60%' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {parseState === 'error' && (
        <div style={{ marginBottom:28 }}>
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'1.25rem', padding:20, display:'flex', flexDirection:'column', alignItems:'center', gap:12, textAlign:'center' }}>
            <Icon name="error_outline" style={{ color:'#ef4444', fontSize:36 }} />
            <div>
              <p style={{ fontFamily:'"Space Grotesk"', fontWeight:700, fontSize:14, margin:'0 0 6px' }}>Couldn't parse this receipt</p>
              <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>{errorMsg}</p>
            </div>
            <button onClick={resetUpload} style={{ background:'#1e293b', color:'#f8fafc', padding:'10px 20px', borderRadius:10, fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', border:'none', cursor:'pointer' }}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Done — confirmed items from real parse */}
      {parseState === 'done' && parsedData && (
        <div style={{ marginBottom:24 }}>
          <h3 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'0.95rem', textTransform:'uppercase', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:10, margin:'0 0 14px' }}>
            <span style={{ width:4, height:22, background:'#f97316', borderRadius:2, display:'inline-block' }} />
            Extracted from Receipt
          </h3>

          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {[
              { label:'Service', value: parsedData.service_type, icon:'build' },
              { label:'Shop', value: parsedData.shop_name, icon:'storefront' },
              { label:'Date', value: parsedData.date, icon:'calendar_today' },
              { label:'Mileage', value: parsedData.mileage ? parseInt(parsedData.mileage).toLocaleString() + ' mi' : null, icon:'speed' },
              { label:'Total', value: parsedData.cost ? '$' + parseFloat(parsedData.cost).toFixed(2) : null, icon:'payments' },
            ].filter(f => f.value).map((field, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(30,41,59,0.5)', border:'1px solid rgba(51,65,85,0.2)', borderRadius:12 }}>
                <Icon name={field.icon} style={{ color:'#f97316', fontSize:18, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <p style={{ ...slab, fontSize:9, margin:'0 0 2px' }}>{field.label}</p>
                  <p style={{ fontFamily:'"Space Grotesk"', fontWeight:700, fontSize:14, margin:0 }}>{field.value}</p>
                </div>
                <Icon name="verified" fill style={{ color:'#10b981', fontSize:18 }} />
              </div>
            ))}

            {parsedData.line_items?.length > 0 && (
              <div style={{ padding:'12px 14px', background:'rgba(30,41,59,0.5)', border:'1px solid rgba(51,65,85,0.2)', borderRadius:12 }}>
                <p style={{ ...slab, fontSize:9, margin:'0 0 8px' }}>Line Items</p>
                {parsedData.line_items.map((item, i) => (
                  <p key={i} style={{ fontSize:12, color:'#94a3b8', margin:'0 0 3px', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:4, height:4, borderRadius:'50%', background:'#334155', display:'inline-block', flexShrink:0 }}/>
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>

          <BtnPrimary onClick={() => onFinalize(parsedData)}>
            Save to Service History
          </BtnPrimary>
          <button onClick={resetUpload} style={{ marginTop:8, background:'none', border:'none', color:'#475569', fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', padding:8, width:'100%' }}>
            Parse another receipt
          </button>
        </div>
      )}

      {/* Manual entry — only shown in idle state */}
      {parseState === 'idle' && (
        <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:'1.25rem', padding:18 }}>
          <p style={{ fontFamily:'"Space Grotesk"', fontSize:12, fontWeight:700, color:'#475569', textAlign:'center', margin:'0 0 14px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Or enter manually</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div><label style={labelStyle}>Service Type</label><input style={inputStyle} type="text" placeholder="Oil Change, Tire Rotation..." /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={labelStyle}>Date</label><input style={inputStyle} type="date" /></div>
              <div><label style={labelStyle}>Mileage</label><input style={inputStyle} type="text" inputMode="numeric" placeholder="41,500" /></div>
            </div>
            <div><label style={labelStyle}>Shop Name</label><input style={inputStyle} type="text" placeholder="Jiffy Lube, Dealer..." /></div>
            <div><label style={labelStyle}>Cost ($)</label><input style={inputStyle} type="text" inputMode="decimal" placeholder="89.00" /></div>
            <BtnPrimary onClick={() => onFinalize({})} style={{ marginTop:4 }}>Save Record</BtnPrimary>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Screen 5: Defense Report ────────────────────────────────

function DefenseScreen({ onNavigate }) {
  const criticalItems = [
    { badge:'Overdue', icon:'oil_barrel', title:'Full Synthetic Oil Change', desc:'Last at 37,000 mi. OEM interval 5,000 mi. Now 450 miles overdue.', warning:'Verify viscosity & filter' },
    { badge:'Critical', icon:'water_drop', title:'Brake Fluid Flush', desc:'Moisture threshold exceeded. Due at 30k interval. Now at 42,000 mi.', warning:'Hydraulic integrity risk' },
  ]
  const deferredItems = [
    { icon:'air',                   name:'Engine Air Filter',    note:'Replaced 3,200 miles ago. Visually clean.',      status:'12k mi left',   statusColor:'#10b981', statusIcon:'check_circle', fill:true },
    { icon:'tire_repair',           name:'Tire Rotation',        note:'Wear patterns optimal. Postpone to next cycle.', status:'Wait 5k mi',    statusColor:'#f97316', statusIcon:'schedule',     fill:false },
    { icon:'battery_charging_full', name:'Battery Health Test',  note:'12.6V static. Load test passed.',               status:'94% capacity',  statusColor:'#10b981', statusIcon:'bolt',         fill:false },
    { icon:'electrical_services',   name:'Spark Plugs',          note:'Iridium plugs installed at 12,000 mi.',         status:'58k mi left',   statusColor:'#10b981', statusIcon:'check_circle', fill:true },
  ]

  return (
    <div className="animate-page-in" style={{ background:'#f8fafc', color:'#0f172a', minHeight:'100dvh', paddingBottom:160 }}>
      <main style={{ maxWidth:672, margin:'0 auto', padding:'88px 20px 0' }}>

        {/* Header */}
        <header style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'#0f172a', color:'white', padding:'5px 12px', borderRadius:6, fontSize:11, fontFamily:'"Space Grotesk"', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', border:'1px solid rgba(249,115,22,0.4)', boxShadow:'0 0 16px rgba(249,115,22,0.1)' }}>
              <Icon name="security" style={{ fontSize:13, color:'#f97316' }} /> Shop Defense Report
            </div>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
          </div>
          <h1 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'2rem', color:'#0f172a', letterSpacing:'-0.02em', margin:'0 0 12px' }}>Maintenance Summary</h1>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f97316', color:'white', padding:'6px 12px', borderRadius:8, fontSize:11, fontFamily:'"Space Grotesk"', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em', boxShadow:'0 4px 12px rgba(249,115,22,0.2)' }}>
              <Icon name="verified" style={{ fontSize:14 }} /> AI-Verified
            </div>
            <span style={{ color:'#64748b', fontSize:12, display:'flex', alignItems:'center', gap:5 }}><Icon name="fingerprint" style={{ fontSize:13 }} />VIN: 1GYS4CKJ9MR******</span>
            <span style={{ color:'#64748b', fontSize:12, display:'flex', alignItems:'center', gap:5 }}><Icon name="speed" style={{ fontSize:13 }} />42,000 miles</span>
          </div>
        </header>

        {/* Critical */}
        <section style={{ marginBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
            <h2 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1rem', color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.05em', margin:0, whiteSpace:'nowrap' }}>Do These Now</h2>
            <div style={{ flex:1, height:2, background:'#e2e8f0' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {criticalItems.map((item, i) => (
              <div key={i} style={{ background:'white', padding:22, borderRadius:'1.25rem', borderTop:'4px solid #ea580c', position:'relative', overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ position:'absolute', top:0, right:0, padding:'8px 10px' }}>
                  <span style={{ fontSize:9, fontWeight:800, color:'white', background:'#dc2626', padding:'3px 8px', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{item.badge}</span>
                </div>
                <div style={{ width:48, height:48, borderRadius:14, background:'#f8fafc', border:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                  <Icon name={item.icon} style={{ fontSize:24, color:'#0f172a' }} />
                </div>
                <h3 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1rem', color:'#0f172a', lineHeight:1.2, margin:'0 0 8px' }}>{item.title}</h3>
                <p style={{ fontSize:12, color:'#64748b', lineHeight:1.6, margin:'0 0 14px' }}>{item.desc}</p>
                <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'9px 12px' }}>
                  <Icon name="warning" style={{ color:'#dc2626', fontSize:15 }} />
                  <span style={{ fontSize:11, color:'#dc2626', fontWeight:700 }}>{item.warning}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Deferred */}
        <section style={{ marginBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
            <h2 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1rem', color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.05em', margin:0, whiteSpace:'nowrap' }}>Tell Them to Wait</h2>
            <div style={{ flex:1, height:2, background:'#e2e8f0' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {deferredItems.map((item, i) => (
              <div key={i} style={{ background:'#f8fafc', padding:16, borderRadius:'1rem', border:'1px solid rgba(226,232,240,0.5)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:'white', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon name={item.icon} style={{ color:'#475569' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily:'"Space Grotesk"', fontWeight:700, fontSize:14, color:'#0f172a', margin:'0 0 2px' }}>{item.name}</p>
                    <p style={{ fontSize:11, color:'#64748b', margin:0 }}>{item.note}</p>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:9, color:'#94a3b8', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.1em', margin:'0 0 3px' }}>Defense</p>
                  <div style={{ display:'flex', alignItems:'center', gap:4, color:item.statusColor, fontWeight:700, fontSize:12 }}>
                    <Icon name={item.statusIcon} fill={item.fill} style={{ fontSize:13 }} />{item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1rem', color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 22px' }}>What's Coming Next</h2>
          <div style={{ position:'relative', paddingLeft:26, borderLeft:'3px solid #e2e8f0' }}>
            <div style={{ position:'relative', marginBottom:32 }}>
              <div style={{ position:'absolute', left:-38, top:2, width:16, height:16, borderRadius:'50%', background:'#f97316', boxShadow:'0 0 0 4px rgba(249,115,22,0.15)' }} />
              <span style={{ fontSize:9, fontFamily:'"Space Grotesk"', fontWeight:800, color:'white', background:'#0f172a', padding:'3px 8px', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.12em' }}>Now · 42,000 MI</span>
              <h4 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1.05rem', color:'#0f172a', margin:'8px 0 4px' }}>Fluid & Friction Protocol</h4>
              <p style={{ fontSize:12, color:'#64748b', lineHeight:1.6, maxWidth:280, margin:0 }}>Focus on oil change and brake fluid. No other critical defects identified.</p>
            </div>
            <div style={{ position:'relative', opacity:0.5 }}>
              <div style={{ position:'absolute', left:-38, top:2, width:16, height:16, borderRadius:'50%', background:'#cbd5e1' }} />
              <span style={{ fontSize:9, fontFamily:'"Space Grotesk"', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.12em' }}>Phase 2 · 65,000 MI</span>
              <h4 style={{ fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:'1.05rem', color:'#0f172a', margin:'8px 0 4px' }}>Ignition & Belt Drive</h4>
              <p style={{ fontSize:12, color:'#64748b', lineHeight:1.6, maxWidth:280, margin:0 }}>Spark plugs and serpentine belt. Deferred to 2026 cycle.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Share CTA */}
      <div style={{ position:'fixed', bottom:84, left:0, width:'100%', padding:'0 20px 12px', background:'linear-gradient(to top,#f8fafc 55%,transparent)', zIndex:40 }}>
        <div style={{ maxWidth:672, margin:'0 auto', display:'flex', gap:10 }}>
          <button onClick={() => alert('In production: generates a shareable PDF link to send your mechanic.')} style={{ flex:1, padding:15, background:'#0f172a', color:'white', borderRadius:'1rem', fontFamily:'"Space Grotesk"', fontWeight:800, fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em', border:'1px solid rgba(249,115,22,0.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }}>
            <Icon name="ios_share" style={{ color:'#f97316' }} /> Share with Mechanic
          </button>
          <button onClick={() => window.print()} style={{ padding:15, background:'#f97316', color:'white', borderRadius:'1rem', border:'none', cursor:'pointer', boxShadow:'0 8px 20px rgba(249,115,22,0.25)' }}>
            <Icon name="print" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Root App ────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const [vehicles, setVehicles] = useState([
    { name:'2021 Toyota Highlander', type:'SUV', miles:'42,000 miles', milesRaw:42000 },
    { name:'2018 Honda Odyssey', type:'Minivan', miles:'84,200 miles', milesRaw:84200 },
  ])
  const [activeVehicle, setActiveVehicle] = useState(0)
  const [serviceRecords, setServiceRecords] = useState([]) 

  function navigate(s) {
    setScreen(s)
    window.scrollTo(0, 0)
  }

  function handleOnboardingComplete({ year, make, model, miles }) {
    const milesRaw = parseInt(miles) || 42000
    setVehicles(v => {
      const updated = [...v]
      updated[0] = { name:`${year} ${make} ${model}`, type:'Vehicle', miles:`${milesRaw.toLocaleString()} miles`, milesRaw }
      return updated
    })
    navigate('dashboard')
  }

 function handleFinalizeRecord(parsedData) {
  setServiceRecords(prev => [parsedData, ...prev])
  navigate('schedule')
}

  return (
    <>
      <AppHeader screen={screen} onNavigate={navigate} />

      {screen === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} onSkip={() => navigate('dashboard')} />
      )}
      {screen === 'dashboard' && (
        <DashboardScreen vehicles={vehicles} activeVehicle={activeVehicle} onSwitchVehicle={() => setActiveVehicle(i => (i+1) % vehicles.length)} onNavigate={navigate} />
      )}
      {screen === 'schedule' && (
        <ScheduleScreen vehicles={vehicles} activeVehicle={activeVehicle} onNavigate={navigate} />
      )}
      {screen === 'import' && (
        <ImportScreen onFinalize={handleFinalizeRecord} />
      )}
      {screen === 'defense' && (
        <DefenseScreen onNavigate={navigate} />
      )}

      <BottomNav screen={screen} onNavigate={navigate} />
    </>
  )
}