// 한국문화정보원 한눈에보는문화정보 조회서비스: 제주 전시·공연·축제 (기간별 조회, XML)
import { XMLParser } from 'fast-xml-parser'
import { dataKey, KeyError, toList } from './http.js'

const BASE = 'https://apis.data.go.kr/B553457/cultureinfo/period2'
const parser = new XMLParser({ parseTagValue: false })
const ymd = (d) => d.toISOString().slice(0, 10).replaceAll('-', '')
let cache = null // 30분 보관

const unesc = (t = '') => String(t).replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&').replaceAll('&quot;', '"')
const say = (text) => {
  if (/SERVICE_KEY_IS_NOT_REGISTERED|SERVICE KEY IS NOT REGISTERED/i.test(text)) return '키가 아직 등록되지 않았어요 — 활용신청 승인 후 잠시 뒤 다시 시도하세요'
  if (/SERVICE ACCESS DENIED|ACCESS_DENIED/i.test(text)) return '한눈에보는문화정보 활용신청이 안 되어 있어요'
  return null
}

export async function getCulture({ days = 90, rows = 100 } = {}) {
  if (cache && Date.now() - cache.at < 30 * 60e3) return cache.data
  const from = new Date()
  const to = new Date(Date.now() + days * 86400e3)
  const qs = new URLSearchParams({ from: ymd(from), to: ymd(to), PageNo: '1', numOfrows: String(rows), sido: '제주' })
  const res = await fetch(`${BASE}?${qs}&serviceKey=${encodeURIComponent(dataKey())}`)
  const text = await res.text()
  const why = say(text)
  if (why) throw new KeyError(`한눈에보는문화정보: ${why}`)
  const xml = parser.parse(text)
  const body = xml?.response?.body ?? xml?.response?.msgBody ?? xml?.response
  if (!body) throw new Error(`한눈에보는문화정보 응답 이상: ${text.slice(0, 160)}`)
  const items = toList(body.items?.item ?? body.perforList ?? body.item)
  const data = items.map((x) => ({
    id: String(x.seq ?? x.title),
    title: unesc(x.title),
    kind: x.realmName ?? x.serviceName ?? '',
    place: unesc(x.place),
    area: [x.area, x.sigungu].filter(Boolean).join(' '),
    start: x.startDate ?? '',
    end: x.endDate ?? '',
    image: x.thumbnail ?? '',
    lat: x.gpsY, lng: x.gpsX,
  })).filter((x) => x.title)
  // sido 필터가 완벽하지 않아 제주 밖 것이 섞일 수 있어, 지역 글자 또는 제주 좌표 안의 것만 남깁니다
  const inJeju = (x) => /제주|서귀포/.test(`${x.area} ${x.place}`) || (x.lat >= 33.1 && x.lat <= 33.6 && x.lng >= 126.1 && x.lng <= 127.0)
  const jeju = data.filter(inJeju)
  cache = { at: Date.now(), data: jeju }
  return jeju
}
