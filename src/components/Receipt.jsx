import { C, FONT_DISPLAY, FONT_MONO, BASE_FEE } from '../constants'

function Dashed() {
  return <div style={{ borderTop: `1.5px dashed ${C.line}`, margin: '6px 0' }} />
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
      <span style={{ color: '#80796A' }}>{label}</span>
      <span style={{ textAlign: 'right', maxWidth: 200 }}>{value}</span>
    </div>
  )
}

export default function Receipt({ req, onClose }) {
  const total = req.total_price ?? (req.items.reduce((s, it) => s + it.qty * it.price, 0) + BASE_FEE)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(27,30,28,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFDF8', width: 340, maxWidth: '100%',
          padding: '26px 22px', fontFamily: FONT_MONO, color: C.ink,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          maxHeight: '85vh', overflowY: 'auto',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.025) 28px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: 1 }}>분리고 SORTING RECEIPT</div>
          <div style={{ fontSize: 10.5, color: '#80796A', marginTop: 4 }}>{req.receipt_no}</div>
        </div>
        <Dashed />
        <Row label="처리일시" value={req.slot} />
        <Row label="배출주소" value={req.address} />
        <Row label="담당기사" value={req.driver_name || '—'} />
        <Dashed />
        <div style={{ fontSize: 10.5, color: '#80796A', margin: '8px 0 6px' }}>
          ITEM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;QTY&nbsp;&nbsp;&nbsp;&nbsp;AMOUNT
        </div>
        {req.items.map(it => (
          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
            <span>[{it.code}] {it.label}</span>
            <span>{it.qty}{it.unit} · {(it.qty * it.price).toLocaleString()}원</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
          <span>[CALL] 출동비</span>
          <span>{BASE_FEE.toLocaleString()}원</span>
        </div>
        <Dashed />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, margin: '8px 0' }}>
          <span>TOTAL</span>
          <span>{total.toLocaleString()}원</span>
        </div>
        <Dashed />
        <div style={{ textAlign: 'center', fontSize: 10.5, color: '#80796A', marginTop: 10, lineHeight: 1.6 }}>
          분리배출 기준 환경부 가이드라인 준수<br />문의 1588-0000 · 감사합니다
        </div>
        <button onClick={onClose} style={{
          width: '100%', marginTop: 16, padding: '10px 0',
          background: C.ink, color: '#FFFDF8', border: 'none',
          fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 0.5, cursor: 'pointer',
        }}>
          닫기
        </button>
      </div>
    </div>
  )
}
