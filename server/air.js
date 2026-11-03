// 한국환경공단 에어코리아 (공공데이터포털, 같은 인증키 DATA_GO_KR_KEY)
//  · 대기오염통계 현황 > 시도별 측정정보(getCtprvnMesureSidoLIst): 제주시·서귀포시의 가장 최근 시간 측정값
//  · 미세먼지 경보 발령 현황(getUlfptcaAlarmInfo): 제주권역 주의보·경보 발령/해제 기록
import { dataKey, fetchJson, KeyError } from './http.js'

const BASE = 'https://apis.data.go.kr/B552584'
let cache = null // 10분 보관

const num = (v) => { const n = Number(v); return Number.isFinite(n) && v !== '-' && v !== '' && v != null ? n : null }

export async function getAir() {
  if (cache && Date.now() - cache.at < 10 * 60e3) return cache.data
  const key = encodeURIComponent(dataKey())
  const year = new Date().getFullYear()
  const [now, alarm] = await Promise.all([
    fetchJson(`${BASE}/ArpltnStatsSvc/getCtprvnMesureSidoLIst?serviceKey=${key}&returnType=json&numOfRows=20&pageNo=1&sidoName=${encodeURIComponent('제주')}&searchCondition=HOUR`, '대기오염통계'),
    fetchJson(`${BASE}/UlfptcaAlarmInqireSvc/getUlfptcaAlarmInfo?serviceKey=${key}&returnType=json&numOfRows=1000&pageNo=1&year=${year}`, '미세먼지 경보').catch(() => null),
  ])
  const head = now?.response?.header
  if (head && head.resultCode && head.resultCode !== '00') throw new KeyError(`에어코리아: ${head.resultMsg ?? head.resultCode}`)
  const latest = new Map() // 도시별 가장 최근 한 건
  for (const r of now?.response?.body?.items ?? []) {
    if (!latest.has(r.cityName) || r.dataTime > latest.get(r.cityName).dataTime) latest.set(r.cityName, r)
  }
  const cities = ['제주시', '서귀포시'].filter((c) => latest.has(c)).map((c) => {
    const r = latest.get(c)
    return { name: c, time: r.dataTime, pm10: num(r.pm10Value), pm25: num(r.pm25Value), o3: num(r.o3Value), no2: num(r.no2Value), co: num(r.coValue), so2: num(r.so2Value), khai: num(r.khaiValue) }
  })
  // 제주권역 경보: 가장 최근 기록과 지금 발령 중인지
  const rows = (alarm?.response?.body?.items ?? []).filter((x) => /제주/.test(x.districtName ?? '')).sort((a, b) => Number(b.sn) - Number(a.sn))
  const last = rows[0] ?? null
  const active = !!last && !last.clearTime && !last.clearDate
  const data = {
    cities,
    alarm: last ? { active, kind: last.issueGbn, item: last.itemCode === 'PM25' ? '초미세먼지' : '미세먼지', issued: `${last.issueDate} ${last.issueTime}`, cleared: last.clearDate ? `${last.clearDate} ${last.clearTime}` : null } : null,
    alarmCountYear: rows.length,
  }
  cache = { at: Date.now(), data }
  return data
}
