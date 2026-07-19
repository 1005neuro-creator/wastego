import { useState, useEffect } from 'react'
import { Users, ClipboardList, AlertTriangle, BarChart2 } from 'lucide-react'
import { supabase } from '../supabase'
import { C, FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../constants'
import { Logo, Spinner, Pill } from './UI'

export default function AdminScreen({ onSignOut }) {
  const [tab, setTab] = useState('stats')
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: u }, { data: r }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('requests').select('*').order('created_at', { ascending: false }),
    ])
    setUsers(u || [])
    setRequests(r || [])
    setLoading(false)
  }

  const customers = users.filter(u => u.role === 'customer')
  const drivers   = users.filter(u => u.role === 'driver')
  const completed = requests.filter(r => r.status === '수거완료')
  const revenue   = completed.reduce((s, r) => s + (r.total_price || 0), 0)

  const TABS = [
    { id: 'stats',    label: '통계',    icon: BarChart2 },
    { id: 'users',    label: '회원',    icon: Users },
    { id: 'requests', label: '거래',    icon: ClipboardList },
  ]

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: '18px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, background: C.deep, color: '#fff', padding: '3px 8px', borderRadius: 4, fontFamily: FONT_MONO }}>ADMIN</span>
          <button onClick={onSignOut} style={{ fontSize: 11, color: '#80796A', background: 'none', border: 'none', cursor: 'pointer' }}>로그아웃</button>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.line}`, margin: '0 16px' }}>
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '10px 0', border: 'none', background: 'none',
              borderBottom: tab === t.id ? `2.5px solid ${C.terra}` : '2.5px solid transparent',
              color: tab === t.id ? C.ink : '#A39C8B',
              fontSize: 12.5, fontWeight: 700, fontFamily: FONT_BODY,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer',
            }}>
              <Icon size={13} /> {t.label}
            </button>
          )
        })}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ padding: '12px 16px' }}>
          {tab === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: '전체 이용자', value: customers.length + '명', color: C.deep },
                { label: '전체 도우미', value: drivers.length + '명', color: C.sage },
                { label: '완료 거래', value: completed.length + '건', color: C.terra },
                { label: '총 거래액', value: revenue.toLocaleString() + '원', color: '#A8763E' },
              ].map(s => (
                <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, color: '#80796A', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: s.color }}>{s.value}</div>
                </div>
              ))}
              <div style={{ gridColumn: '1/-1', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: '#80796A', marginBottom: 10 }}>전체 요청 현황</div>
                {['요청접수','견적대기','도우미배정','수거중','수거완료'].map(s => {
                  const cnt = requests.filter(r => r.status === s).length
                  return (
                    <div key={s} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span>{s}</span>
                      <span style={{ fontFamily: FONT_MONO, fontWeight: 700 }}>{cnt}건</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div>
              {users.map(u => (
                <div key={u.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: '#80796A' }}>{u.phone || '전화번호 없음'}</div>
                  </div>
                  <Pill tone={u.role === 'driver' ? 'active' : 'default'}>
                    {u.role === 'driver' ? '도우미' : u.role === 'admin' ? '관리자' : '이용자'}
                  </Pill>
                </div>
              ))}
            </div>
          )}

          {tab === 'requests' && (
            <div>
              {requests.map(r => {
                const toneMap = { 요청접수: 'warn', 견적대기: 'warn', 도우미배정: 'default', 수거중: 'active', 수거완료: 'done' }
                return (
                  <div key={r.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: '#80796A' }}>{r.receipt_no}</span>
                      <Pill tone={toneMap[r.status] || 'default'}>{r.status}</Pill>
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 2 }}>{r.address}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#80796A' }}>
                      <span>{r.slot}</span>
                      <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: C.ink }}>{r.total_price?.toLocaleString()}원</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
