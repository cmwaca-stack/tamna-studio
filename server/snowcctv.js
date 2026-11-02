// 제주시 적설 감시 CCTV (data.go.kr, JSON) — 지점명·CCTV 주소·위경도
import { dataKey, KeyError } from './http.js'

const BASE = 'https://apis.data.go.kr/6510000/snowfallCctvService/getSnowfallCctvList'
let cache = null
const VIDEO_HOST = 'http://211.114.96.121:1935/'
const viaProxy = (u) => (u.startsWith(VIDEO_HOST) ? `/api/stream?p=${encodeURIComponent(u.slice(VIDEO_HOST.length))}` : u)

export async function getSnowCctv({ debug = false } = {}) {
  if (!debug && cache && Date.now() - cache.at < 30 * 60e3) return cache.data
  const key = encodeURIComponent(dataKey())
  const res = await fetch(`${BASE}?serviceKey=${key}&pageNo=1&numOfRows=100&type=json`)
  const text = await res.text()
  if (/SERVICE_KEY_IS_NOT_REGISTERED/.test(text)) throw new KeyError('적설 CCTV: 키가 아직 등록 전이에요 (승인 직후라면 잠시 뒤 다시)')
  if (debug) return { head: text.slice(0, 700) }
  let json
  try { json = JSON.parse(text) } catch { throw new Error(`적설 CCTV 응답이 JSON이 아님: ${text.slice(0, 140)}`) }
  const items = json?.response?.body?.items?.item ?? []
  const rows = Array.isArray(items) ? items : [items]
  const data = rows.map((r, i) => ({
    id: String(r.dataCd ?? i),
    name: String(r.spotNm ?? 'CCTV'),
    kind: String(r.spotSe ?? ''),
    url: viaProxy(String(r.cctvUrl ?? '')), // 브라우저가 바로 못 여는 영상 주소를 우리 서버(/api/stream) 경유로 바꿈
    raw: String(r.cctvUrl ?? ''),
    lat: Number(r.laCrdnt),
    lng: Number(r.loCrdnt),
    use: String(r.useYn ?? ''),
  })).filter((c) => c.url && c.use !== 'N' && Number.isFinite(c.lat) && Number.isFinite(c.lng))
  cache = { at: Date.now(), data }
  return data
}
