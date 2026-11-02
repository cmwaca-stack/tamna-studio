// 제주공항(CJU) 항공편 운항 현황 — 한국공항공사 실시간 운항정보 /info (data.go.kr)
import { dataKey, KeyError } from './http.js'

const BASE = 'https://apis.data.go.kr/B551178/flight-status/info'
const cache = {}
const hhmm = (v) => { const s = String(v ?? '').replace(/\D/g, ''); return s.length >= 4 ? `${s.slice(0, 2)}:${s.slice(2, 4)}` : '' }
const mins = (t) => (t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) : 0)

export async function getFlights({ dir = 'depart', debug = false } = {}) {
  const io = dir === 'arrival' ? 'I' : 'O'
  if (!debug && cache[io] && Date.now() - cache[io].at < 5 * 60e3) return cache[io].data
  const key = dataKey()
  const page = async (n) => {
    const q = new URLSearchParams({ serviceKey: key, type: 'json', pageNo: String(n), numOfRows: '100', schAirCode: 'CJU', schIOType: io, schStTime: '0000', schEdTime: '2359' })
    const text = await (await fetch(`${BASE}?${q}`)).text()
    if (debug) return { head: text.slice(0, 900) }
    if (/SERVICE_KEY_IS_NOT_REGISTERED/.test(text)) throw new KeyError('항공편: 키가 아직 등록 전이에요 (승인 직후라면 잠시 뒤 다시)')
    if (/SERVICE ACCESS DENIED|SERVICE_ACCESS_DENIED/.test(text)) throw new KeyError('항공편: 이 API 활용신청이 안 되어 있어요')
    let json
    try { json = JSON.parse(text) } catch { throw new Error(`항공편 응답이 JSON이 아님: ${text.slice(0, 120)}`) }
    if (!json?.response?.body) throw new Error(`항공편 API 오류: ${text.replace(/\s+/g, ' ').slice(0, 160)}`)
    const items = json.response.body.items?.item ?? []
    return { rows: Array.isArray(items) ? items : [items], total: Number(json.response.body.totalCount) || 0 }
  }
  const first = await page(1)
  if (debug) return first
  let rows = first.rows
  const pages = Math.min(Math.ceil(first.total / 100), 8)
  for (let n = 2; n <= pages; n++) rows = rows.concat((await page(n)).rows)
  const data = rows.map((x) => {
    const plan = hhmm(x.std)
    const real = hhmm(x.etd)
    const status = String(x.rmkKor ?? '').trim()
    const late = plan && real ? mins(real) - mins(plan) : 0
    return {
      airline: String(x.airlineKorean ?? ''),
      no: String(x.airFln ?? ''),
      place: String(io === 'O' ? x.arrivedKor : x.boardingKor ?? ''),
      line: String(x.line ?? ''),
      plan,
      real,
      gate: String(x.gate ?? ''),
      status,
      late: late > 0 ? late : 0,
      delay: late >= 15 || /지연/.test(status),
      cancel: /결항/.test(status),
    }
  }).filter((f) => f.no).sort((a, b) => a.plan.localeCompare(b.plan))
  cache[io] = { at: Date.now(), data }
  return data
}
