import DashboardScreen from './DashboardScreen'
import ScheduleScreen from './ScheduleScreen'
import OnboardingScreen from './OnboardingScreen'
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

  return (
    <header
      style={{
        background: 'rgba(10,13,16,0.85)',
        backdropFilter: 'blur(20px)',
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px', height:64, maxWidth:672, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => onNavigate('dashboard')}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase' }}>
            <span style={{ color: 'var(--color-text-primary)' }}>Family </span>
            <span style={{ color: 'var(--color-accent)' }}>Garage</span>
          </span>
        </div>
        {screen === 'dashboard' && (
          <div style={{ width:32, height:32, borderRadius:'50%', border:'1px solid var(--color-border-subtle)', background:'var(--color-bg-surface)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Icon name="person" style={{ color:'var(--color-text-secondary)', fontSize:17 }} />
          </div>
        )}
      </div>
    </header>
  )
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

// ─── Screen 4: Import (simplified stub for now) ──────────────

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
    if (file.size > 10 * 1024 * 1024) return alert('Too large.')
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage = file.type.startsWith('image/')
    if (!isPDF && !isImage) return alert('Choose an image or PDF.')
    setParseState('selected')
    setParsedData({ file, isPDF, isImage, previewUrl: isImage ? URL.createObjectURL(file) : null })
  }

  async function startParsing() {
    if (!parsedData?.file) return
    setParseState('parsing')
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
              { type: 'text', text: `Parse this vehicle service receipt. Respond ONLY with JSON: {"service_type": "...", "shop_name": "...", "date": "...", "mileage": "...", "cost": "...", "line_items": [], "notes": "..."}. Use null for missing.` },
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
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, margin: '0 0 24px' }}>Import record</h2>
      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e => handleFileSelected(e.target)} />
      {(parseState === 'idle' || parseState === 'selected') && (
        <div onClick={() => parseState === 'idle' && fileRef.current?.click()} style={{ aspectRatio:'4/3', borderRadius:'var(--radius-lg)', background: 'var(--color-bg-surface)', border: `2px dashed ${parseState === 'selected' ? 'var(--color-accent)' : 'var(--color-border-default)'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, cursor: parseState === 'idle' ? 'pointer' : 'default' }}>
          {parseState === 'idle' ? (
            <>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--color-accent-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="add_a_photo" style={{ color:'var(--color-accent)', fontSize:26 }} />
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:16, margin:'0 0 4px' }}>Upload receipt</p>
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
        <div style={{ marginTop: 16 }}>
          <p style={{ color: 'var(--color-text-primary)', marginBottom: 16 }}>Parsed: {parsedData.service_type} — ${parsedData.cost}</p>
          <button onClick={() => onFinalize(parsedData)} style={{ background:'var(--color-accent)', color:'var(--color-text-inverse)', padding:'12px 24px', borderRadius:12, fontWeight:600, fontSize:13, border:'none', cursor:'pointer', width: '100%' }}>Save to Service History</button>
        </div>
      )}
    </div>
  )
}

// ─── Screen 5: Defense Report (stub) ─────────────────────────

function DefenseScreen({ onNavigate }) {
  return (
    <div className="animate-page-in" style={{ paddingTop: 88, paddingBottom: 100, paddingLeft: 20, paddingRight: 20 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, margin:'0 0 16px' }}>Defense Report</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>Defense report screen — still needs migration.</p>
    </div>
  )
}

// ─── Root App ────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const [vehicles, setVehicles] = useState([
    { name:'2021 Toyota Highlander', nickname: 'Highlander', type:'SUV', miles:'42,000 miles', milesRaw:42000 },
    { name:'2018 Honda Odyssey', nickname: 'Odyssey', type:'Minivan', miles:'84,200 miles', milesRaw:84200 },
  ])
  const [activeVehicle, setActiveVehicle] = useState(0)
  const [serviceRecords, setServiceRecords] = useState([])
  const [preferences, setPreferences] = useState({
    serviceReminders: true,
    recalls: true,
    email: false,
  })

  function navigate(s) {
    setScreen(s)
    window.scrollTo(0, 0)
  }

  function handleOnboardingComplete({ year, make, model, miles, nickname, preferences: prefs }) {
    const milesRaw = parseInt(miles) || 42000
    setVehicles(v => {
      const updated = [...v]
      updated[0] = {
        name: `${year} ${make} ${model}`,
        nickname: nickname || model,
        type: 'Vehicle',
        miles: `${milesRaw.toLocaleString()} miles`,
        milesRaw,
      }
      return updated
    })
    if (prefs) setPreferences(prefs)
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
        <ScheduleScreen
          vehicles={vehicles}
          activeVehicle={activeVehicle}
          onNavigate={navigate}
          serviceRecords={serviceRecords}
        />
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
