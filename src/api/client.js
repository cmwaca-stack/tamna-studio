// React 화면이 우리 서버 함수(/api/...)를 부를 때 쓰는 함수 모음.
// 공공데이터 API 를 브라우저에서 직접 부르지 않습니다 (키 노출 + CORS) → 반드시 /api 를 거칩니다.

async function readJson(res) {
  let data
  try { data = await res.json() }
  catch { throw new Error(`서버 응답이 JSON이 아님 (${res.status}) — npm run dev 로 실행했는지 확인하세요`) }
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export const get = async (path) => readJson(await fetch(path))
export const post = async (path, body) =>
  readJson(await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }))

export const fetchPlaces = (keyword = '', type = '12', rows = 12, arrange = '', detail = false) => get(`/api/tour?keyword=${encodeURIComponent(keyword)}&type=${type}&rows=${rows}${arrange ? `&arrange=${arrange}` : ''}${detail ? '&detail=1' : ''}`) // ① 한국관광공사
export const fetchNear = (lat, lng, type = '12', rows = 8, radius = 5000) => get(`/api/tour?lat=${lat}&lng=${lng}&type=${type}&rows=${rows}&radius=${radius}`) // ① 한국관광공사 (좌표 주변)
export const fetchVjFood = (keyword = '', src = 'vj') => get(`/api/olle?kind=food&src=${src}&keyword=${encodeURIComponent(keyword)}`) // 제주관광공사 비짓제주 음식점 (이름·영업시간, data.go.kr)
export const fetchPlacesIn = (q, rect) => get(`/api/olle?kind=places&q=${encodeURIComponent(q)}&rect=${rect}`) // 생활정보 지도: 카카오 장소 검색(지도 범위 안)
export const fetchAir = () => get('/api/olle?kind=air') // 에어코리아 제주시·서귀포시 실측값 + 경보 기록 (data.go.kr)
export const fetchAlerts = () => get('/api/olle?kind=alerts') // 제주 기상특보(기상청) + 재난문자(행정안전부, data.go.kr)
export const fetchFuel = () => get('/api/olle?kind=fuel') // 제주 휘발유·경유 평균가, LPG 전국 평균가 (한국석유공사 오피넷)
export const fetchKomsa = () => get('/api/olle?kind=komsa') // 가파도·마라도·추자도 등 제주 섬 여객선 운항 현황 (한국해양교통안전공단)
export const fetchShips = () => get('/api/olle?kind=ship') // 제주항 여객선 운항 현황 (한국해운조합 제주여객터미널)
export const fetchEvStations = () => get('/api/olle?kind=ev') // 한국전력 제주 전기차 충전소 목록(위치·이용 시간, data.go.kr)
export const fetchHospitalData = (kind) => get(`/api/olle?kind=${kind}`) // 제주 의료기관 자료: emergency 응급 · stats 개소 현황 · public 공공의료기관 (data.go.kr)
export const fetchWeather = (place = '제주시') => get(`/api/weather?place=${encodeURIComponent(place)}`) //                      ② 기상청
export const fetchWeatherAll = () => get('/api/weather?place=all') //                                                             ② 기상청 (제주 전 지역)
export const fetchHeritage = (keyword = '') => get(`/api/heritage?keyword=${encodeURIComponent(keyword)}`) //                   ③ 국가유산청
export const askAgent = (message, history) => post('/api/agent', { message, history }) //                                     AI 에이전트
export const fetchTraffic = () => get('/api/traffic') //                                                                        ④ 국가교통정보센터
export const fetchJejueo = (kind = 'dialect', { page = 1, q = '', type = '' } = {}) =>
  get(`/api/jejueo?kind=${kind}&page=${page}&q=${encodeURIComponent(q)}&type=${type}`) //                                         ⑤ 제주도청 제주어
export const fetchOlle = () => get('/api/olle') //                                                                           ⑥ 제주올레 코스현황
export const fetchCulture = () => get('/api/culture') //                                                                          ⑦ 한국문화정보원 전시·공연
export const fetchSnowCctv = () => get('/api/snowcctv') //                                                                       ⑧ 제주시 적설 감시 CCTV
export const fetchFlights = (dir = 'depart') => get(`/api/flight?dir=${dir}`) // ⑨ 제주공항 항공편
export const fetchPolicies = (scope = 'jeju') => get(`/api/youth?scope=${scope}`) // ⑩ 온통청년 청년정책
