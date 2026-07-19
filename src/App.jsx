import { useState } from 'react'
import { useAuth } from './AuthContext'
import AuthScreen from './components/AuthScreen'
import { CustomerHome, NewRequest, RequestDetail } from './components/CustomerScreens'
import { DriverHome } from './components/DriverScreens'
import AdminScreen from './components/AdminScreen'
import { Spinner } from './components/UI'
import { C, FONT_BODY } from './constants'

export default function App() {
  const { user, profile, loading, signOut } = useAuth()
  const [view, setView]           = useState('home')
  const [activeReqId, setActiveReqId] = useState(null)

  if (loading) return <Shell><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><Spinner /></div></Shell>
  if (!user || !profile) return <Shell><AuthScreen /></Shell>

  if (profile.role === 'admin')  return <Shell><AdminScreen onSignOut={signOut} /></Shell>
  if (profile.role === 'driver') return <Shell><DriverHome onSignOut={signOut} /></Shell>

  return (
    <Shell>
      {view === 'home' && (
        <CustomerHome
          onNew={() => setView('new')}
          onOpen={req => { setActiveReqId(req.id); setView('detail') }}
          onSignOut={signOut}
        />
      )}
      {view === 'new' && (
        <NewRequest onSubmit={() => setView('home')} onCancel={() => setView('home')} />
      )}
      {view === 'detail' && activeReqId && (
        <RequestDetail reqId={activeReqId} onBack={() => setView('home')} />
      )}
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div style={{ fontFamily: FONT_BODY, background: C.bg, color: C.ink, minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Noto+Sans+KR:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: #A39C8B; }
        input:focus, textarea:focus { outline: 2px solid #7BA88A; }
        button:focus-visible { outline: 2px solid #E8633A; outline-offset: 2px; }
      `}</style>
      <div style={{ width: 420, minHeight: '100vh', background: C.bg, position: 'relative', borderLeft: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}` }}>
        {children}
      </div>
    </div>
  )
}
