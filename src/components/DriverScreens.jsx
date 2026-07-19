import { useState, useEffect } from 'react'
import { MapPin, Clock, Truck, Star, DollarSign } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../AuthContext'
import { C, FONT_MONO, FONT_BODY, FONT_DISPLAY, STATUS_FLOW } from '../constants'
import { Logo, Section, Spinner, Btn, inputStyle } from './UI'

export function DriverHome({ onSignOut }) {
  const { profile, user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [quoteReq, setQuoteReq] = useState(null) // 견적 보낼 요청

  useEffect(() => {
    loadRequests()
    const ch = supabase.channel('driver-reqs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, loadRequests)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function loadRequests() {
    const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  async function handleAdvance(req) {
    const next = STATUS_FLOW[STATUS_FLOW.indexOf(req.status) + 1]
    if (!next) return
    await supabase.from('requests').update({ status: next }).eq('id', req.id)
  }

  const open = requests.filter(r => r.status === '요청접수')
  const mine = requests.filter(r => r.driver_id === user?.id && !['수거완료'].includes(r.status))
  const done = requests.filter(r => r.driver_id === user?.id && r.status === '수거완료')
  const todayEarnings = done.reduce((s, r) => s + (r.total_price || 0), 0)

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: '18px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Logo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.deep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={15} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{profile?.name} 도우미</div>
              <div style={{ fontSize: 11, color: '#80796A' }}>
                오늘 완료 {done.length}건 · 수익 {todayEarnings.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ fontSize: 11, color: '#80796A', background: 'none', border: 'none', cursor: 'pointer' }}>로그아웃</button>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* 진행중 */}
          {mine.length > 0 && (
            <Section label={`진행중 (${mine.length})`}>
              {mine.map(r => (
                <DriverCard key={r.id} req={r}>
                  <Btn onClick={() => handleAdvance(r)} style={{ padding: '9px 14px', width: 'auto', fontSize: 12.5 }}>
                    {r.status === '도우미배정' ? '수거 시작' : '수거 완료'}
                  </Btn>
                </DriverCard>
              ))}
            </Section>
          )}

          {/* 새 요청 목록 */}
          <Section label={`새 수거 요청 (${open.length})`}>
            {open.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#A39C8B', fontSize: 13 }}>
                현재 대기중인 요청이 없어요.
              </div>
            ) : open.map(r => (
              <DriverCard key={r.id} req={r}>
                <Btn variant="dark" onClick={() => setQuoteReq(r)} style={{ padding: '9px 14px', width: 'auto', fontSize: 12.5 }}>
                  견적 보내기
                </Btn>
              </DriverCard>
            ))}
          </Section>
        </>
      )}

      {/* 견적 보내기 모달 */}
      {quoteReq && (
        <QuoteModal req={quoteReq} driverId={user?.id} onClose={() => { setQuoteReq(null); loadRequests() }} />
      )}
    </div>
  )
}

function DriverCard({ req, children }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: '#80796A' }}>{req.receipt_no}</span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 13, color: C.terra }}>{req.total_price?.toLocaleString()}원</span>
      </div>

      {/* 사진 */}
      {req.photos?.[0] && (
        <img src={req.photos[0]} alt="" style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
      )}

      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>
        {req.description || req.items?.map(i => `${i.label} ${i.qty}${i.unit}`).join(' · ') || '폐기물 수거'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#80796A', marginBottom: 2 }}>
        <MapPin size={12} /> {req.address}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#80796A', marginBottom: 10 }}>
        <Clock size={12} /> {req.slot}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{children}</div>
    </div>
  )
}

function QuoteModal({ req, driverId, onClose }) {
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function sendQuote() {
    if (!price) return
    setBusy(true)
    try {
      // quotes 테이블에 견적 저장
      await supabase.from('quotes').insert({
        request_id: req.id,
        driver_id: driverId,
        price: parseInt(price),
        message,
        status: 'pending',
      })
      // 요청 상태를 견적대기로 변경
      await supabase.from('requests').update({ status: '견적대기' }).eq('id', req.id)
      onClose()
    } catch(e) {
      alert('견적 전송 실패: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', width: '100%', maxWidth: 420,
        borderRadius: '16px 16px 0 0', padding: 24,
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, marginBottom: 4 }}>견적 보내기</div>
        <div style={{ fontSize: 12.5, color: '#80796A', marginBottom: 16 }}>{req.address}</div>

        <div style={{ fontSize: 12.5, color: '#80796A', marginBottom: 6 }}>견적 금액</div>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="예: 15000"
          style={{ ...inputStyle, marginBottom: 12 }}
        />
        <div style={{ fontSize: 12.5, color: '#80796A', marginBottom: 6 }}>고객에게 한마디 (선택)</div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="예: 오늘 오후에 바로 처리 가능합니다!"
          style={{ ...inputStyle, height: 70, resize: 'none', fontFamily: FONT_BODY, marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>취소</Btn>
          <Btn onClick={sendQuote} disabled={!price || busy} style={{ flex: 2 }}>
            {busy ? '전송중...' : '견적 보내기'}
          </Btn>
        </div>
      </div>
    </div>
  )
}
