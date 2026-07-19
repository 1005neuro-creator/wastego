import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { Logo, Section, inputStyle, Btn } from './UI'
import { C, FONT_BODY, FONT_MONO } from '../constants'

export default function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode]   = useState('login')  // login | signup
  const [role, setRole]   = useState('customer')
  const [form, setForm]   = useState({ email: '', password: '', name: '', phone: '' })
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit() {
    setError(''); setBusy(true)
    try {
      if (mode === 'login') {
        await signIn({ email: form.email, password: form.password })
      } else {
        if (!form.name) throw new Error('이름을 입력해주세요.')
        await signUp({ ...form, role })
      }
    } catch (e) {
      setError(e.message || '오류가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Logo size={28} />
        <p style={{ fontSize: 13, color: '#80796A', margin: 0 }}>분리배출을 대신 해드립니다</p>
      </div>

      {/* 로그인 / 회원가입 탭 */}
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.line}`, marginBottom: 24 }}>
        {['login', 'signup'].map(m => (
          <button key={m} onClick={() => { setMode(m); setError('') }} style={{
            flex: 1, padding: '10px 0', border: 'none',
            background: mode === m ? C.deep : C.panel,
            color: mode === m ? '#fff' : '#80796A',
            fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          }}>
            {m === 'login' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>

      {/* 회원가입 추가 필드 */}
      {mode === 'signup' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#80796A', marginBottom: 8, fontWeight: 600 }}>가입 유형</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'customer', label: '🏠 이용자' },
                { id: 'driver',   label: '🚛 수거기사' },
              ].map(r => (
                <button key={r.id} onClick={() => setRole(r.id)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 7, cursor: 'pointer',
                  border: `1.5px solid ${role === r.id ? C.deep : C.line}`,
                  background: role === r.id ? C.faint : C.panel,
                  fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600,
                  color: role === r.id ? C.ink : '#80796A',
                }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <input value={form.name} onChange={set('name')} placeholder="이름" style={{ ...inputStyle, marginBottom: 10 }} />
          <input value={form.phone} onChange={set('phone')} placeholder="전화번호 (선택)" style={{ ...inputStyle, marginBottom: 10 }} type="tel" />
        </>
      )}

      <input value={form.email} onChange={set('email')} placeholder="이메일" style={{ ...inputStyle, marginBottom: 10 }} type="email" />
      <input value={form.password} onChange={set('password')} placeholder="비밀번호" style={{ ...inputStyle, marginBottom: 16 }} type="password" />

      {error && (
        <div style={{ background: '#FBE4DA', color: C.terra, padding: '10px 12px', borderRadius: 7, fontSize: 12.5, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <Btn onClick={handleSubmit} disabled={busy}>
        {busy ? '처리중...' : mode === 'login' ? '로그인' : '회원가입'}
      </Btn>

      {mode === 'login' && (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#80796A', marginTop: 16 }}>
          계정이 없으신가요?{' '}
          <span onClick={() => setMode('signup')} style={{ color: C.terra, fontWeight: 700, cursor: 'pointer' }}>
            회원가입
          </span>
        </p>
      )}
    </div>
  )
}
