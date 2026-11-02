// 공공 API ② 기상청 단기예보 조회서비스 (VilageFcstInfoService_2.0)
import { dataKey, fetchJson, toList } from './http.js'

const BASE = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'
// 기상청 격자 좌표 (nx, ny). 지역 위·경도를 기상청 공식(람베르트 투영)으로 환산한 값이에요.
// 인구는 2020 인구주택총조사 기준이에요(통계청). 제주시·서귀포시 각각 인구 많은 순서 10곳을 고정해서 보여 줘요.
const DEFS = [
  { city: '제주시', place: '노형동', people: 56117, g: [52, 38] },
  { city: '제주시', place: '이도2동', people: 49267, g: [53, 38] },
  { city: '제주시', place: '연동', people: 43182, g: [52, 38] },
  { city: '제주시', place: '아라동', people: 39565, g: [53, 37] },
  { city: '제주시', place: '애월읍', people: 36146, g: [49, 37] },
  { city: '제주시', place: '일도2동', people: 32791, g: [53, 38] },
  { city: '제주시', place: '삼양동', people: 25104, g: [54, 39] },
  { city: '제주시', place: '조천읍', people: 24579, g: [55, 39] },
  { city: '제주시', place: '화북동', people: 24491, g: [53, 38] },
  { city: '제주시', place: '한림읍', people: 22230, g: [48, 36] },
  { city: '서귀포시', place: '대정읍', people: 22773, g: [48, 32] },
  { city: '서귀포시', place: '동홍동', people: 22767, g: [54, 33] },
  { city: '서귀포시', place: '남원읍', people: 17957, g: [56, 33] },
  { city: '서귀포시', place: '성산읍', people: 15308, g: [60, 37] },
  { city: '서귀포시', place: '대륜동', people: 14222, g: [52, 32] },
  { city: '서귀포시', place: '대천동', people: 13448, g: [52, 33] },
  { city: '서귀포시', place: '표선면', people: 11839, g: [58, 34] },
  { city: '서귀포시', place: '안덕면', people: 11419, g: [49, 33] },
  { city: '서귀포시', place: '중문동', people: 11348, g: [51, 33] },
  { city: '서귀포시', place: '서홍동', people: 10133, g: [53, 33] },
]
const GRID = { 제주시: [53, 38], 서귀포시: [52, 33], ...Object.fromEntries(DEFS.map((d) => [d.place, d.g])) }
// 화면에서 돌아가며 보여 줄 지역: 제주시 10곳 → 서귀포시 10곳 (각각 인구 많은 순)
export const REGIONS = DEFS.map((d) => d.place)
const SKY = { 1: '맑음', 3: '구름많음', 4: '흐림' }
const PTY = { 0: '없음', 1: '비', 2: '비/눈', 3: '눈', 4: '소나기' }
const ISSUE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23] // 발표시각 (발표 약 10분 뒤부터 조회 가능)

// 지금 시각(한국) 기준으로 가장 최근 발표분의 base_date / base_time
function latestIssue() {
  const kst = new Date(Date.now() + 9 * 3600e3 - 15 * 60e3)
  const hour = kst.getUTCHours()
  const issued = [...ISSUE_HOURS].reverse().find((h) => h <= hour)
  const day = issued === undefined ? new Date(kst.getTime() - 24 * 3600e3) : kst
  return {
    base_date: day.toISOString().slice(0, 10).replaceAll('-', ''),
    base_time: String(issued ?? 23).padStart(2, '0') + '00',
  }
}

export async function getWeather({ place = '제주시', slots = 6 } = {}) {
  const [nx, ny] = GRID[place] ?? GRID.제주시
  const params = new URLSearchParams({
    serviceKey: dataKey(), dataType: 'JSON', numOfRows: '300', pageNo: '1',
    nx: String(nx), ny: String(ny), ...latestIssue(),
  })
  const data = await fetchJson(`${BASE}?${params}`, '기상청')
  const header = data?.response?.header
  if (header && header.resultCode !== '00') throw new Error(`기상청 ${header.resultCode}: ${header.resultMsg}`)

  // 같은 시각의 항목(TMP·SKY·PTY·POP·WSD·VEC)을 한 줄로 묶기
  const byTime = {}
  for (const it of toList(data?.response?.body?.items?.item)) {
    ;(byTime[`${it.fcstDate} ${it.fcstTime}`] ??= {})[it.category] = it.fcstValue
  }
  return Object.entries(byTime)
    .slice(0, slots)
    .map(([time, v]) => ({
      place, time, temp: Number(v.TMP), sky: SKY[v.SKY] ?? v.SKY,
      rain: PTY[v.PTY] ?? v.PTY, pop: Number(v.POP), // pop = 강수확률(%)
      wind: Number(v.WSD), windDir: Number(v.VEC), // 풍속(m/s) · 풍향(도, 불어 오는 방향)
    }))
}

// 모든 지역의 "지금" 예보 한 줄씩 (10분간 서버 메모리에 보관 → 호출 한도 절약)
let cache = { at: 0, data: null }
export async function getWeatherAll() {
  if (cache.data && Date.now() - cache.at < 10 * 60e3) return cache.data
  const byGrid = new Map() // 같은 격자(5km 칸)는 한 번만 호출해서 호출 수를 아낌
  const forecast = (g) => byGrid.get(g.join()) ?? byGrid.set(g.join(), getWeather({ place: DEFS.find((d) => d.g === g).place, slots: 1 })).get(g.join())
  const rows = await Promise.all(DEFS.map(async (d, i) => {
    const w = (await forecast(d.g))[0]
    if (!w) return null
    const rank = DEFS.slice(0, i + 1).filter((x) => x.city === d.city).length
    return { ...w, place: d.place, city: d.city, rank, people: d.people } // pop 은 강수확률, people 은 인구
  }))
  cache = { at: Date.now(), data: rows.filter(Boolean) }
  return cache.data
}
