import DashboardScreen from './DashboardScreen'
import AppShell from './components/AppShell'
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

function AppHeader({ screen, onNavigate }) {
  if (screen === 'onboarding') return null

  const isDefense = screen === 'defense'

  return (
    <header
      style={{
        background: isDefense ? 'rgba(248,250,252,0.92)' : 'rgba(10,13,16,0.85)',
        backdropFilter: 'blur(20px)',
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px', height:64, maxWidth:672, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => onNavigate('dashboard')}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase' }}>
            <span style={{ color: isDefense ? '#0f172a' : 'var(--color-text-primary)' }}>Family </span>
            <span style={{ color: 'var(--color-accent)' }}>Garage</span>
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
      <div style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--color-border-subtle)', background:'var(--color-bg-surface)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
        <Icon name="person" style={{ color:'var(--color-text-secondary)', fontSize:17 }} />
      </div>
    )
  }
  if (screen === 'import') {
    return <button onClick={() => onNavigate('schedule')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-accent)', fontFamily:'var(--font-body)', fontSize:12, fontWeight:600 }}>History</button>
  }
  if (screen === 'defense') {
    return <button onClick={() => onNavigate('dashboard')} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', fontFamily:'var(--font-body)', fontSize:12, fontWeight:600 }}>Close</button>
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
    <nav style={{ position:'fixed', bottom:0, left:0, width:'100%', zIndex:50, background:'rgba(10,13,16,0.85)', backdropFilter:'blur(24px)', borderTop:'1px solid var(--color-border-subtle)', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 8px 16px' }}>
      {items.map(item => {
        const active = screen === item.id
        return (
          <div key={item.id} onClick={() => onNavigate(item.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 14px', borderRadius:12, cursor:'pointer', color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)', background: active ? 'var(--color-accent-bg)' : 'transparent', transition:'all 0.2s' }}>
            <Icon name={item.icon} style={{ fontSize:22 }} />
            <span style={{ fontFamily:'var(--font-body)', fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.15em' }}>{item.label}</span>
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
        <div style={{ position:'relative', width:'100%', borderRadius:'1.5rem', overflow:'hidden', marginBottom:28, aspectRatio:'16/10', boxShadow:'0 20px 40px -15px rgba(249,115,22,0.2)' }}>
          <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1e293b,#0f172a)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="garage" style={{ fontSize:100, color:'rgba(249,115,22,0.15)' }} />
          </div>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#020617,transparent 60%)' }} />
          <div style={{ position:'absolute', bottom:16, left:20 }}><span style={slab}>Your vehicles. Your data.</span></div>
        </div>

        <div style={{ marginBottom:28 }}>
          <h1 style={{ ...stitle, fontSize:'2.2rem', lineHeight:1, margin:'0 0 12px' }}>
            Meet your<br /><span style={{ color:'#f97316' }}>vehicle.</span>
          </h1>
          <p style={{ color:'#94a3b8', fontSize:14, lineHeight:1.7, borderLeft:'2px solid rgba(249,115,22,0.3)', paddingLeft:14, maxWidth:300, margin:0 }}>
            Enter your car details to start your precision maintenance ledger.
          </p>
        </div>

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
                <input style={{ background:'transparent', border:'none', color:'#f8fafc', fontFamily:'Manrope', fontWeight:600, width:'100%', outline:'none', fontSize:'1rem' }} type="text" inputMode="numeric" placeholder="42,000" value={miles} onChange={e => setMiles(e.target.value)} />
              </div>
              <span style={{ paddingRight:14, fontFamily:'"Space Grotesk"', fontSize:10, fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'0.15em' }}>mi</span>
            </div>
          </div>

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
      </main>
    </div>
  )
}

// ─── Screen 3: Schedule (unmigrated) ─────────────────────────

function ScheduleScreen({ vehicles, activeVehicle, onNavigate }) {
  const [tab, setTab] = useState('due')
  const v = vehicles[activeVehicle]

  const dueItems = [
    { icon:'oil_barrel',  name:'Oil & Filter Change',     interval:'Every 5,000 miles', due:'IN 800 MI',   when:'DEC 2024' },
    { icon:'tire_repair', name:'Tire Rotation & Balance', interval:'Every 6,000 miles', due:'IN 1,240 MI', when:'JAN 2025' },
    { icon:'water_drop',  name:'Brake Fluid Flush',       interval:'Every 30,000 miles',due:'IN 2,500 MI', when:'MAR 2025' },
    { icon:'straighten',  name:'Wheel Alignment Check',   interval:'Annual',             due:'IN 3,800 MI', when:'APR 2025' },
  ]

  return (
    <div className="animate-page-in" style={{ paddingTop: 88, paddingBottom: 100, paddingLeft: 20, paddingRight: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ ...stitle, fontSize:'1.75rem', lineHeight:1, margin:'0 0 4px' }}>{v.name}</h2>
        <p style={{ fontSize:12, color:'#475569', margin:0 }}>Last synced: Today, 9:42 AM · {v.milesRaw.toLocaleString()} mi</p>
      </div>

      <div style={{ background:'rgba(15,23,42,0.5)', border:'1px solid #1e293b', borderRadius:12, display:'flex', gap:4, padding:4, marginBottom:22 }}>
        {['due','overdue','history'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:10, borderRadius:8, fontFamily:'"Space Grotesk"', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', border:'none', background: tab===t ? '#ea580c' : 'transparent', color: tab===t ? 'white' : '#475569', transition:'all 0.2s' }}>
            {t === 'due' ? 'Due Soon' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'due' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {dueItems.map((item, i) => (
            <div key={i} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius:'1rem', padding:16, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, background:'#1e293b', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name={item.icon} style={{ color:'#f97316' }} />
                </div>
                <div>
                  <p style={{ fontFamily:'Manrope', fontWeight:800, fontSize:13, textTransform:'uppercase', margin:'0 0 3px' }}>{item.name}</p>
                  <p style={{ fontSize:10, color:'#475569', margin:0 }}>{item.interval}</p>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:'"Space Grotesk"', fontWeight:800, color:'#f97316', fontSize:12, margin:0 }}>{item.due}</p>
                <p style={{ fontSize:9, color:'#475569', margin:0 }}>{item.when}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Screen 4: Import (unmigrated) ───────────────────────────

function ImportScreen({ onFinalize }) {
  const [parseState, setParseState] = useState('idle')
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
              { type: parsedData.isPDF ? 'document' : 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              { type: 'text', text: `Parse this vehicle service receipt. Respond ONLY with valid JSON: {"service_type": "...", "shop_name": "...", "date": "...", "mileage": "...", "cost": "...", "line_items": [], "notes": "..."}. Use null for missing fields.` },
            ],
          }],
        }),
      })
      if (!response.ok) throw new Error(`API error ${response.status}`)
      const data = await response.json()
      const text = data.content?.find(b => b.type === 'text')?.text || ''
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      setParsedData(prev => ({ ...prev, ...parsed }))
      setParseState('done')
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.')
      setParseState('error')
    }
  }

  return (
    <div className="animate-page-in" style={{ paddingTop: 88, paddingBottom: 100, paddingLeft: 20, paddingRight: 20 }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ ...stitle, fontSize:'2rem', lineHeight:1, margin:'0 0 8px' }}>Import Record</h2>
        <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>Snap a photo of your receipt and let AI handle the data entry.</p>
      </div>

      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e => handleFileSelected(e.target)} />

      {(parseState === 'idle' || parseState === 'selected') && (
        <div onClick={() => parseState === 'idle' && fileRef.current?.click()} style={{ aspectRatio:'4/3', borderRadius:'1.5rem', background: 'var(--color-bg-surface)', border: `2px dashed ${parseState === 'selected' ? 'var(--color-accent)' : 'var(--color-border-default)'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, cursor: parseState === 'idle' ? 'pointer' : 'default' }}>
          {parseState === 'idle' ? (
            <>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--color-accent-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="add_a_photo" style={{ color:'var(--color-accent)', fontSize:26 }} />
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:16, margin:'0 0 4px' }}>Upload Receipt</p>
                <p style={{ fontSize:11, color:'var(--color-text-tertiary)', margin:0 }}>JPEG, PNG or PDF · up to 10MB</p>
              </div>
            </>
          ) : (
            <button onClick={e => { e.stopPropagation(); startParsing() }} style={{ background:'var(--color-accent)', color:'var(--color-text-inverse)', padding:'12px 24px', borderRadius:12, fontWeight:600, fontSize:13, border:'none', cursor:'pointer', boxShadow:'var(--glow-accent)' }}>
              Parse with AI
            </button>
          )}
        </div>
      )}

      {parseState === 'parsing' && <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 40 }}>Parsing receipt...</p>}
      {parseState === 'error' && <p style={{ color: 'var(--color-status-danger)', padding: 20 }}>Error: {errorMsg} <button onClick={resetUpload}>Try again</button></p>}
      {parseState === 'done' && parsedData && (
        <div>
          <p style={{ color: 'var(--color-text-primary)', marginBottom: 16 }}>Parsed: {parsedData.service_type} — ${parsedData.cost}</p>
          <BtnPrimary onClick={() => onFinalize(parsedData)}>Save to Service History</BtnPrimary>
        </div>
      )}
    </div>
  )
}

// ─── Screen 5: Defense Report (unmigrated) ───────────────────

function DefenseScreen({ onNavigate }) {
  return (
    <div className="animate-page-in" style={{ paddingTop: 88, paddingBottom: 100, paddingLeft: 20, paddingRight: 20 }}>
      <h2 style={{ ...stitle, fontSize:'1.75rem', margin:'0 0 16px' }}>Defense Report</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>Defense report screen — still uses old styling. Will be migrated in the next pass.</p>
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

  const screenContent = (
    <>
      {screen === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} onSkip={() => navigate('dashboard')} />
      )}
      {screen === 'dashboard' && (
        <DashboardScreen
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          onSwitchVehicle={(i) => setActiveVehicle(typeof i === 'number' ? i : (activeVehicle + 1) % vehicles.length)}
          onNavigate={navigate}
          serviceRecords={serviceRecords}
        />
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
    </>
  )

  return (
    <AppShell
      screen={screen}
      onNavigate={navigate}
      vehicles={vehicles}
      activeVehicle={activeVehicle}
      onSelectVehicle={setActiveVehicle}
      mobileHeader={<AppHeader screen={screen} onNavigate={navigate} />}
      mobileNav={<BottomNav screen={screen} onNavigate={navigate} />}
    >
      {screenContent}
    </AppShell>
  )
}
