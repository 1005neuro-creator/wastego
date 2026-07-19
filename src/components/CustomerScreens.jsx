import { useState, useEffect } from 'react'
import { Trash2, ChevronRight, MapPin, Clock, User, Star, Plus, Minus, Package } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../AuthContext'
import { C, FONT_DISPLAY, FONT_BODY, FONT_MONO, WASTE_TYPES, TIME_SLOTS, BASE_FEE, STATUS_FLOW } from '../constants'
import { Logo, Header, Section, Pill, StatusTrack, inputStyle, Btn, Spinner } from './UI'
import PhotoUpload from './PhotoUpload'
import KakaoMap from './KakaoMap'

let SEQ = 1042
function genReceiptNo() { SEQ++; return `WG-${new Date().getFullYear()}${String(SEQ).padStart(5,'0')}` }

// ---------- Home ----------
export function CustomerHome({ onNew, onOpen, onSignOut }) {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
    const ch = supabase.channel('cust-reqs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, loadRequests)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function loadRequests() {
    const { data } = await supabase.from('requests')
      .select('*, driver:driver_id(name)')
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  return (
    <div>
      <div style={{ padding: '18px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Logo />
          <div style={{ fontSize: 13, color: '#80796A', marginTop: 8 }}>안녕하세요, <b>{profile?.name}</b>님 👋</div>
        </div>
        <button onClick={onSignOut} style={{ fontSize: 11, color: '#80796A', background: 'none', border: 'none', cursor: 'pointer' }}>로그아웃</button>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <button onClick={onNew} style={{
          width: '100%', padding: 16, borderRadius: 10, border: 'none',
          background: C.deep, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700 }}>
            <Trash2 size={19} /> 새 배출 요청
          </span>
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{ padding: '8px 16px', paddingBottom: 80 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>나의 요청 내역</div>
        {loading ? <Spinner /> : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#A39C8B', fontSize: 13 }}>
            아직 요청 내역이 없어요.<br />첫 배출을 요청해보세요.
          </div>
        ) : requests.map(r => <RequestCard key={r.id} req={r} onOpen={onOpen} />)}
      </div>
    </div>
  )
}

function RequestCard({ req, onOpen }) {
  const toneMap = { 요청접수: 'warn', 견적대기: 'warn', 도우미배정: 'default', 수거중: 'active', 수거완료: 'done' }
  return (
    <div onClick={() => onOpen(req)} style={{
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 10, cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: '#80796A' }}>{req.receipt_no}</span>
        <Pill tone={toneMap[req.status] || 'default'}>{req.status}</Pill>
      </div>
      {req.photos?.[0] && (
        <img src={req.photos[0]} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
      )}
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        {req.items?.map(i => i.label).join(', ') || req.description || '폐기물 수거 요청'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#80796A', marginBottom: 4 }}>
        <Clock size={12} /> {req.slot}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#80796A' }}>
          <MapPin size={12} /> {req.address}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 13 }}>{req.total_price?.toLocaleString()}원</span>
      </div>
    </div>
  )
}

// ---------- New Request ----------
export function NewRequest({ onSubmit, onCancel }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState([])
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState(null)
  const [qty, setQty] = useState({})
  const [slot, setSlot] = useState(TIME_SLOTS[0])
  const [memo, setMemo] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const items = WASTE_TYPES.filter(c => qty[c.id] > 0).map(c => ({ ...c, qty: qty[c.id] }))
  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0) + BASE_FEE
  const setQ = (id, d) => setQty(p => ({ ...p, [id]: Math.max(0, (p[id] || 0) + d) }))

  async function handleSubmit() {
    if (!location) { setError('위치를 선택해주세요.'); return }
    setBusy(true); setError('')
    try {
      const { error: err } = await supabase.from('requests').insert({
        receipt_no: genReceiptNo(),
        customer_id: user.id,
        photos,
        description,
        items,
        slot,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        memo,
        status: '요청접수',
        total_price: subtotal,
      })
      if (err) throw err
      onSubmit()
    } catch(e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ paddingBottom: 120 }}>
      <Header title="배출 요청하기" onBack={onCancel} />

      {/* 스텝 인디케이터 */}
      <div style={{ display: 'flex', margin: '0 16px 16px', gap: 6 }}>
        {[1,2,3].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? C.terra : C.line }} />
        ))}
      </div>

      {step === 1 && (
        <>
          <Section label="① 폐기물 사진 등록">
            <PhotoUpload photos={photos} onChange={setPhotos} />
          </Section>
          <Section label="② 설명 입력">
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="폐기물 종류와 상태를 간단히 설명해주세요 (예: 소파 1개, 냉장고 1대)"
              style={{ ...inputStyle, height: 80, resize: 'none', fontFamily: FONT_BODY }}
            />
          </Section>
          <div style={{ padding: '0 16px' }}>
            <Btn onClick={() => setStep(2)} disabled={photos.length === 0 && !description}>다음 단계</Btn>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Section label="③ 수거 위치 선택">
            <KakaoMap onSelect={setLocation} selectedAddress={location?.address} />
          </Section>
          <Section label="④ 수거 희망 시간">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TIME_SLOTS.map(t => (
                <button key={t} onClick={() => setSlot(t)} style={{
                  padding: '10px 8px', borderRadius: 7,
                  border: `1.5px solid ${slot === t ? C.deep : C.line}`,
                  background: slot === t ? C.deep : C.panel,
                  color: slot === t ? '#fff' : C.ink,
                  fontSize: 12.5, fontFamily: FONT_BODY, cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
          </Section>
          <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
            <Btn variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>이전</Btn>
            <Btn onClick={() => setStep(3)} disabled={!location} style={{ flex: 2 }}>다음 단계</Btn>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <Section label="⑤ 품목 및 수량 선택">
            {WASTE_TYPES.map(c => {
              const n = qty[c.id] || 0
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
                  background: n > 0 ? C.faint : C.panel,
                  border: `1px solid ${n > 0 ? c.color : C.line}`, borderRadius: 8, marginBottom: 8,
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.label}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: '#80796A' }}>
                      {c.price > 0 ? `${c.price.toLocaleString()}원/${c.unit}` : '무료수거'}
                    </div>
                  </div>
                  <button onClick={() => setQ(c.id, -1)} style={stepBtn}><Minus size={13} /></button>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 14, width: 20, textAlign: 'center' }}>{n}</span>
                  <button onClick={() => setQ(c.id, 1)} style={{ ...stepBtn, background: C.deep, color: '#fff', borderColor: C.deep }}>
                    <Plus size={13} />
                  </button>
                </div>
              )
            })}
          </Section>
          <Section label="메모 (선택)">
            <textarea value={memo} onChange={e => setMemo(e.target.value)}
              placeholder="기사님께 전달할 내용 (공동현관 비밀번호 등)"
              style={{ ...inputStyle, height: 60, resize: 'none', fontFamily: FONT_BODY }}
            />
          </Section>
          {error && <div style={{ margin: '0 16px', background: '#FBE4DA', color: C.terra, padding: 10, borderRadius: 7, fontSize: 12.5 }}>{error}</div>}

          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 420, margin: '0 auto', background: C.panel, borderTop: `1px solid ${C.line}`, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: '#80796A' }}>예상 금액</span>
              <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 16 }}>{subtotal.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>이전</Btn>
              <Btn onClick={handleSubmit} disabled={busy} style={{ flex: 2 }}>
                {busy ? '처리중...' : '요청 보내기'}
              </Btn>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const stepBtn = {
  width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.line}`,
  background: C.panel, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
}

// ---------- Request Detail ----------
export function RequestDetail({ reqId, onBack }) {
  const [req, setReq] = useState(null)
  const [quotes, setQuotes] = useState([])

  useEffect(() => {
    loadReq()
    const ch = supabase.channel(`req-${reqId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests', filter: `id=eq.${reqId}` }, loadReq)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes', filter: `request_id=eq.${reqId}` }, loadQuotes)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [reqId])

  async function loadReq() {
    const { data } = await supabase.from('requests').select('*, driver:driver_id(name)').eq('id', reqId).single()
    setReq(data)
    if (data) loadQuotes()
  }

  async function loadQuotes() {
    const { data } = await supabase.from('quotes').select('*, driver:driver_id(name)').eq('request_id', reqId).order('price')
    setQuotes(data || [])
  }

  async function acceptQuote(quote) {
    await supabase.from('requests').update({ driver_id: quote.driver_id, status: '도우미배정', total_price: quote.price }).eq('id', reqId)
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quote.id)
  }

  if (!req) return <Spinner />

  return (
    <div style={{ paddingBottom: 40 }}>
      <Header title="요청 상세" onBack={onBack} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: '#80796A', marginBottom: 4 }}>{req.receipt_no}</div>
          <StatusTrack status={req.status} />
          {req.driver && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.faint, borderRadius: 8, padding: 10, marginTop: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.sage, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{req.driver.name} 도우미</div>
                <div style={{ fontSize: 11, color: '#80796A', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={11} fill={C.terra} color={C.terra} /> 4.9 · 분리고 인증
                </div>
              </div>
            </div>
          )}
        </div>

        {req.photos?.length > 0 && (
          <Section label="등록 사진">
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {req.photos.map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              ))}
            </div>
          </Section>
        )}

        {req.description && (
          <Section label="설명">
            <div style={{ fontSize: 13, color: C.ink, background: C.faint, padding: 10, borderRadius: 7 }}>{req.description}</div>
          </Section>
        )}

        {/* 견적 목록 */}
        {quotes.length > 0 && req.status === '견적대기' && (
          <Section label={`받은 견적 (${quotes.length}개)`}>
            {quotes.map(q => (
              <div key={q.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{q.driver?.name} 도우미</span>
                  <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 15, color: C.terra }}>{q.price?.toLocaleString()}원</span>
                </div>
                {q.message && <div style={{ fontSize: 12.5, color: '#5C5750', marginBottom: 8 }}>{q.message}</div>}
                <Btn onClick={() => acceptQuote(q)} style={{ padding: '8px 0', fontSize: 13 }}>이 도우미 선택</Btn>
              </div>
            ))}
          </Section>
        )}

        {req.memo && (
          <Section label="전달 메모">
            <div style={{ fontSize: 13, color: '#5C5750', background: C.faint, padding: 10, borderRadius: 7 }}>{req.memo}</div>
          </Section>
        )}
      </div>
    </div>
  )
}
