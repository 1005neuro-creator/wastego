import { useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { C, FONT_BODY } from '../constants'

const REST_KEY = 'a9601b8d1e1cd7a7118b0798ae1b27117'

export default function KakaoMap({ onSelect, selectedAddress }) {
  const [input, setInput]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function search() {
    if (!input.trim()) return
    setLoading(true); setError(''); setResults([])
    try {
      // 키워드 검색 (장소명, 도로명 주소 모두 검색)
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(input)}&size=5`,
        { headers: { Authorization: `KakaoAK ${REST_KEY}` } }
      )
      const data = await res.json()
      if (data.documents?.length > 0) {
        setResults(data.documents)
      } else {
        // 키워드 안되면 주소 검색
        const res2 = await fetch(
          `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(input)}&size=5`,
          { headers: { Authorization: `KakaoAK ${REST_KEY}` } }
        )
        const data2 = await res2.json()
        if (data2.documents?.length > 0) {
          setResults(data2.documents.map(d => ({
            place_name: d.address_name,
            road_address_name: d.road_address?.address_name || '',
            address_name: d.address_name,
            x: d.x, y: d.y,
          })))
        } else {
          setError('검색 결과가 없어요. 다르게 입력해보세요.')
        }
      }
    } catch(e) {
      setError('검색 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  function select(doc) {
    const address = doc.road_address_name || doc.address_name || doc.place_name
    onSelect({ address, lat: parseFloat(doc.y), lng: parseFloat(doc.x) })
    setResults([])
    setInput(address)
  }

  function useDirectInput() {
    if (!input.trim()) return
    onSelect({ address: input, lat: 0, lng: 0 })
    setResults([])
  }

  return (
    <div>
      {/* 검색창 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setResults([]); setError('') }}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="예: 마포구 망원동, 스타벅스 홍대점"
            style={{
              width: '100%', padding: '11px 36px 11px 12px',
              borderRadius: 7, border: `1px solid ${C.line}`,
              fontSize: 13.5, fontFamily: FONT_BODY,
              background: C.panel, color: C.ink, boxSizing: 'border-box',
            }}
          />
          {input && (
            <button onClick={() => { setInput(''); setResults([]); setError('') }} style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            }}>
              <X size={14} color="#A39C8B" />
            </button>
          )}
        </div>
        <button onClick={search} style={{
          padding: '11px 16px', borderRadius: 7, border: 'none',
          background: C.deep, color: '#fff', cursor: 'pointer', flexShrink: 0,
        }}>
          {loading ? '...' : <Search size={16} />}
        </button>
      </div>

      {/* 오류 */}
      {error && (
        <div style={{ fontSize: 12.5, color: C.terra, marginBottom: 8, padding: '8px 12px', background: '#FBE4DA', borderRadius: 7 }}>
          {error}
        </div>
      )}

      {/* 검색 결과 */}
      {results.length > 0 && (
        <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', marginBottom: 8, background: C.panel }}>
          {results.map((doc, i) => (
            <div key={i} onClick={() => select(doc)} style={{
              padding: '12px 14px', cursor: 'pointer',
              borderBottom: i < results.length - 1 ? `1px solid ${C.faint}` : 'none',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.faint}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{doc.place_name}</div>
              {doc.road_address_name && (
                <div style={{ fontSize: 11.5, color: '#80796A', marginTop: 2 }}>{doc.road_address_name}</div>
              )}
              {!doc.road_address_name && doc.address_name && (
                <div style={{ fontSize: 11.5, color: '#80796A', marginTop: 2 }}>{doc.address_name}</div>
              )}
            </div>
          ))}
          {/* 직접 입력 옵션 */}
          <div onClick={useDirectInput} style={{
            padding: '10px 14px', cursor: 'pointer',
            background: C.faint, fontSize: 12.5, color: '#80796A',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <MapPin size={12} color={C.terra} />
            "{input}" 주소로 직접 사용
          </div>
        </div>
      )}

      {/* 선택된 주소 표시 */}
      {selectedAddress && (
        <div style={{
          padding: '12px 14px', background: '#E8F5E9',
          borderRadius: 8, fontSize: 13.5, color: C.ink,
          display: 'flex', alignItems: 'center', gap: 8,
          border: `1px solid #A5D6A7`,
        }}>
          <MapPin size={16} color={C.terra} />
          <span>{selectedAddress}</span>
        </div>
      )}

      {/* 안내 */}
      {!selectedAddress && results.length === 0 && !error && (
        <div style={{ padding: '16px', background: C.faint, borderRadius: 8, fontSize: 12.5, color: '#80796A', lineHeight: 1.6 }}>
          💡 주소나 장소명을 검색해서 선택하거나<br />
          주소를 직접 입력 후 엔터를 눌러주세요.
        </div>
      )}
    </div>
  )
}
