import { useEffect, useRef, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { C, FONT_BODY, KAKAO_JS_KEY } from '../constants'

export default function KakaoMap({ onSelect, selectedAddress }) {
  const mapRef    = useRef(null)
  const mapObj    = useRef(null)
  const markerObj = useRef(null)
  const geocoder  = useRef(null)
  const [ready, setReady]       = useState(false)
  const [input, setInput]       = useState('')
  const [locating, setLocating] = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    function init() {
      if (!mapRef.current || mapObj.current) return
      try {
        const center = new window.kakao.maps.LatLng(37.5665, 126.9780)
        const map    = new window.kakao.maps.Map(mapRef.current, { center, level: 5 })
        const marker = new window.kakao.maps.Marker({ position: center, map })
        const gc     = new window.kakao.maps.services.Geocoder()
        mapObj.current    = map
        markerObj.current = marker
        geocoder.current  = gc

        window.kakao.maps.event.addListener(map, 'click', e => {
          const ll = e.latLng
          marker.setPosition(ll)
          gc.coord2Address(ll.getLng(), ll.getLat(), (res, st) => {
            if (st === window.kakao.maps.services.Status.OK) {
              const addr = res[0].road_address?.address_name || res[0].address.address_name
              onSelect({ address: addr, lat: ll.getLat(), lng: ll.getLng() })
              setInput(addr)
            }
          })
        })

        marker.on && marker.on('dragend', () => {
          const ll = marker.getLatLng ? marker.getLatLng() : marker.getPosition()
          gc.coord2Address(ll.getLng(), ll.getLat(), (res, st) => {
            if (st === window.kakao.maps.services.Status.OK) {
              const addr = res[0].road_address?.address_name || res[0].address.address_name
              onSelect({ address: addr, lat: ll.getLat(), lng: ll.getLng() })
              setInput(addr)
            }
          })
        })

        setReady(true)
        setError('')
      } catch(e) {
        setError('지도 초기화 오류: ' + e.message)
      }
    }

    if (window.kakao?.maps?.services) { init(); return }

    const existing = document.querySelector('script[data-kakao-map]')
    if (existing) {
      if (window.kakao?.maps) window.kakao.maps.load(init)
      else existing.addEventListener('load', () => window.kakao.maps.load(init))
      return
    }

    const s = document.createElement('script')
    s.setAttribute('data-kakao-map', 'true')
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`
    s.onload  = () => window.kakao.maps.load(init)
    s.onerror = () => setError('카카오맵 로드 실패. 도메인 설정을 확인해주세요.')
    document.head.appendChild(s)
  }, [])

  function searchAndMove() {
    if (!input.trim() || !geocoder.current) return
    const ps = new window.kakao.maps.services.Places()
    ps.keywordSearch(input, (res, st) => {
      if (st === window.kakao.maps.services.Status.OK) {
        const { y: lat, x: lng, road_address_name, address_name, place_name } = res[0]
        const ll = new window.kakao.maps.LatLng(lat, lng)
        mapObj.current.setCenter(ll)
        mapObj.current.setLevel(4)
        markerObj.current.setPosition(ll)
        const addr = road_address_name || address_name || place_name
        onSelect({ address: addr, lat: parseFloat(lat), lng: parseFloat(lng) })
        setInput(addr)
      } else {
        geocoder.current.addressSearch(input, (res2, st2) => {
          if (st2 === window.kakao.maps.services.Status.OK) {
            const { y: lat, x: lng, address_name } = res2[0]
            const ll = new window.kakao.maps.LatLng(lat, lng)
            mapObj.current.setCenter(ll)
            mapObj.current.setLevel(4)
            markerObj.current.setPosition(ll)
            onSelect({ address: address_name, lat: parseFloat(lat), lng: parseFloat(lng) })
            setInput(address_name)
          } else {
            alert('주소를 찾을 수 없어요.')
          }
        })
      }
    })
  }

  function getCurrentLocation() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      const ll = new window.kakao.maps.LatLng(lat, lng)
      mapObj.current?.setCenter(ll)
      mapObj.current?.setLevel(4)
      markerObj.current?.setPosition(ll)
      geocoder.current?.coord2Address(lng, lat, (res, st) => {
        if (st === window.kakao.maps.services.Status.OK) {
          const addr = res[0].road_address?.address_name || res[0].address.address_name
          onSelect({ address: addr, lat, lng })
          setInput(addr)
        }
        setLocating(false)
      })
    }, () => { alert('위치 권한을 허용해주세요.'); setLocating(false) })
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchAndMove()}
          placeholder="주소 또는 장소명 검색"
          style={{
            flex: 1, padding: '11px 12px', borderRadius: 7,
            border: `1px solid ${C.line}`, fontSize: 13.5,
            fontFamily: FONT_BODY, background: C.panel, color: C.ink,
          }}
        />
        <button onClick={searchAndMove} disabled={!ready} style={{
          padding: '11px 16px', borderRadius: 7, border: 'none',
          background: ready ? C.deep : C.line, color: '#fff',
          cursor: ready ? 'pointer' : 'not-allowed', flexShrink: 0,
        }}>
          <Search size={16} />
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 12px', background: '#FBE4DA', color: C.terra, borderRadius: 7, fontSize: 12.5, marginBottom: 8 }}>
          ⚠️ {error}
        </div>
      )}

      <div ref={mapRef} style={{ width: '100%', height: 220, borderRadius: 8, border: `1px solid ${C.line}`, overflow: 'hidden', background: C.faint }} />

      {!ready && !error && (
        <div style={{ textAlign: 'center', fontSize: 12, color: '#A39C8B', marginTop: 6 }}>지도 로딩중...</div>
      )}

      <button onClick={getCurrentLocation} disabled={!ready || locating} style={{
        width: '100%', marginTop: 8, padding: '10px 0', borderRadius: 7,
        border: `1px solid ${C.line}`, background: C.panel,
        color: C.ink, fontSize: 13, fontFamily: FONT_BODY,
        cursor: ready ? 'pointer' : 'not-allowed',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <MapPin size={14} color={C.terra} />
        {locating ? '위치 찾는 중...' : '현재 위치 사용'}
      </button>

      {selectedAddress && (
        <div style={{ marginTop: 8, padding: '10px 12px', background: '#E8F5E9', borderRadius: 7, fontSize: 12.5, color: '#2E7D32', border: '1px solid #A5D6A7' }}>
          📍 {selectedAddress}
        </div>
      )}
    </div>
  )
}
