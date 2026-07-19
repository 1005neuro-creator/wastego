export const C = {
  ink: '#2E2C28',
  bg: '#F4F2EA',
  panel: '#FFFFFF',
  deep: '#1B3B2F',
  sage: '#7BA88A',
  terra: '#E8633A',
  line: '#C9C2B0',
  faint: '#EDE9DC',
}

export const FONT_DISPLAY = "'Archivo Black', 'Noto Sans KR', sans-serif"
export const FONT_BODY = "'Noto Sans KR', 'Inter', sans-serif"
export const FONT_MONO = "'JetBrains Mono', 'Noto Sans KR', monospace"

export const WASTE_TYPES = [
  { id: 'general',  label: '일반쓰레기',   code: 'GEN', unit: 'L',  price: 800,  color: '#5C5750' },
  { id: 'food',     label: '음식물쓰레기', code: 'FOD', unit: 'L',  price: 600,  color: '#8A6A3C' },
  { id: 'recycle',  label: '재활용',       code: 'RCY', unit: 'kg', price: 0,    color: '#3E7C5C' },
  { id: 'glass',    label: '유리병',       code: 'GLS', unit: '개', price: 300,  color: '#4A7A8C' },
  { id: 'paper',    label: '폐지/박스',    code: 'PPR', unit: 'kg', price: 200,  color: '#A8763E' },
  { id: 'large',    label: '대형폐기물',   code: 'LRG', unit: '건', price: 5000, color: '#8C3E3E' },
]

export const TIME_SLOTS = [
  '오늘 18:00-20:00',
  '오늘 20:00-22:00',
  '내일 08:00-10:00',
  '내일 18:00-20:00',
]

export const STATUS_FLOW = ['요청접수', '견적대기', '도우미배정', '수거중', '수거완료']
export const BASE_FEE = 1500
export const KAKAO_JS_KEY = '4b1439ddb272224a5e89dd29c79e609c'
