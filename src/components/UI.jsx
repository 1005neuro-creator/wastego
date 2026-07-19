import { ArrowLeft } from 'lucide-react'
import { C, FONT_DISPLAY, FONT_BODY, FONT_MONO, STATUS_FLOW } from '../constants'
import { Recycle } from 'lucide-react'

export function Logo({ size = 22 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: size + 10, height: size + 10,
        background: C.deep, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Recycle size={size} color={C.bg} strokeWidth={2.4} />
      </div>
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 19, letterSpacing: -0.3, color: C.ink }}>
        분리고
      </span>
    </div>
  )
}

export function Header({ title, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 10px' }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={20} color={C.ink} />
        </button>
      )}
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 17, letterSpacing: -0.2 }}>{title}</span>
    </div>
  )
}

export function Section({ label, children }) {
  return (
    <div style={{ padding: '10px 16px' }}>
      {label && <div style={{ fontSize: 12.5, color: '#80796A', marginBottom: 9, fontWeight: 600 }}>{label}</div>}
      {children}
    </div>
  )
}

export function Pill({ children, tone = 'default' }) {
  const tones = {
    default: { bg: C.faint,    fg: C.ink },
    active:  { bg: C.deep,     fg: C.bg },
    warn:    { bg: '#FBE4DA',  fg: C.terra },
    done:    { bg: '#E1ECE3',  fg: '#2F5F44' },
  }
  const t = tones[tone]
  return (
    <span style={{
      background: t.bg, color: t.fg,
      fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600,
      padding: '3px 9px', borderRadius: 4, letterSpacing: 0.3, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

export function StatusTrack({ status }) {
  const idx = STATUS_FLOW.indexOf(status)
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0' }}>
      {STATUS_FLOW.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
            <div style={{
              width: 11, height: 11, borderRadius: '50%',
              background: i <= idx ? C.deep : C.line, flexShrink: 0,
            }} />
            <span style={{
              fontFamily: FONT_MONO, fontSize: 9.5,
              color: i <= idx ? C.ink : '#A39C8B',
              textAlign: 'center', whiteSpace: 'nowrap',
            }}>{s}</span>
          </div>
          {i < STATUS_FLOW.length - 1 && (
            <div style={{ height: 2, flex: 1, background: i < idx ? C.deep : C.line, marginBottom: 16 }} />
          )}
        </div>
      ))}
    </div>
  )
}

export const inputStyle = {
  width: '100%', padding: '11px 12px', borderRadius: 7,
  border: `1px solid ${C.line}`, fontSize: 13.5,
  fontFamily: FONT_BODY, boxSizing: 'border-box',
  background: C.panel, color: C.ink,
}

export function Btn({ children, onClick, disabled, variant = 'primary', style: extra }) {
  const variants = {
    primary:   { background: C.terra,  color: '#fff', border: 'none' },
    secondary: { background: 'transparent', color: C.deep, border: `1.5px solid ${C.deep}` },
    dark:      { background: C.deep,   color: '#fff', border: 'none' },
    ghost:     { background: C.faint,  color: C.ink,  border: 'none' },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '13px 0', borderRadius: 8,
        fontSize: 14, fontWeight: 700, fontFamily: FONT_BODY,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...variants[variant],
        ...extra,
      }}
    >
      {children}
    </button>
  )
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: `3px solid ${C.line}`,
        borderTopColor: C.deep,
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function Toast({ message, onClose }) {
  return message ? (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: C.ink, color: '#fff', padding: '10px 20px',
      borderRadius: 8, fontSize: 13, zIndex: 100, whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  ) : null
}
