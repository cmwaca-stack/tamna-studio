// 공공 API ④ 국가교통정보센터(ITS) 실시간 CCTV — 제주 도로의 현재 영상 (키: its.go.kr 오픈API)
// 응답이 getType=json 이어도 XML 로 올 수 있어 둘 다 처리합니다.
import { XMLParser } from 'fast-xml-parser'
import { KeyError, toList } from './http.js'

const parser = new XMLParser()
const JEJU = { minX: 126.1, maxX: 127.0, minY: 33.1, maxY: 33.6 }

export async function trafficCctv({ road = 'its', debug = false } = {}) {
  const key = process.env.ITS_API_KEY?.trim()
  // 데모 키('test')는 제주가 아닌 수도권 영상만 줘서, 키가 없으면 안내를 보여줍니다
  if (!key) throw new KeyError('ITS_API_KEY 가 없어요 (its.go.kr 오픈API 인증키를 .env.local 에 넣으세요)')
  const params = new URLSearchParams({ apiKey: key, type: road, cctvType: '1', ...Object.fromEntries(Object.entries(JEJU).map(([k, v]) => [k, String(v)])), getType: 'json' })
  const res = await fetch(`https://openapi.its.go.kr:9443/cctvInfo?${params}`)
  const text = await res.text()
  if (res.status === 401 || /4005|인증키|apiKey/i.test(text.slice(0, 300)) && !/cctvurl/i.test(text))
    throw new KeyError('ITS_API_KEY 가 없거나 올바르지 않아요 (its.go.kr 오픈API 인증키를 .env.local 에 넣으세요)')
  let data
  try { data = JSON.parse(text) } catch { data = parser.parse(text) }
  const rows = toList(data?.response?.data ?? data?.data)
  if (debug) return { status: res.status, count: rows.length, head: text.slice(0, 300), sample: rows.slice(0, 3).map((c) => [c.cctvname, c.coordy, c.coordx]) }
  return rows
    .map((c, i) => ({
      id: String(c.cctvid ?? `${road}-${i}`), name: String(c.cctvname ?? 'CCTV'),
      url: String(c.cctvurl ?? ''), lat: Number(c.coordy), lng: Number(c.coordx),
    }))
    .filter((c) => c.url && c.lat >= JEJU.minY && c.lat <= JEJU.maxY && c.lng >= JEJU.minX && c.lng <= JEJU.maxX) // 제주 안의 CCTV 만
    .slice(0, 40)
}
