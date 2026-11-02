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

export const ping = () => get('/api/hello')
export const fetchPlaces = (keyword = '', type = '12', rows = 12) => get(`/api/tour?keyword=${encodeURIComponent(keyword)}&type=${type}&rows=${rows}`) // ① 한국관광공사
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
