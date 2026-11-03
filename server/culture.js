// 한국문화정보원 한눈에보는문화정보 조회서비스: 제주 전시·공연·축제 (기간별 조회, XML)
import { XMLParser } from 'fast-xml-parser'
import { enrichCultureEvents } from './events.js'
import { getNoldaEvents } from './nolda.js'
import { dataKey, KeyError, toList } from './http.js'

const BASE = 'https://apis.data.go.kr/B553457/cultureinfo/period2'
const parser = new XMLParser({ parseTagValue: false })
const ymd = (d) => d.toISOString().slice(0, 10).replaceAll('-', '')
let cache = null // 30분 보관

// 제목에 &amp;lt; 처럼 두 번 감싸인 글자가 있어서 더 이상 바뀌지 않을 때까지 풀어요
const unesc = (t = '') => {
  let v = String(t)
  for (let i = 0; i < 3; i++) {
    const n = v.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&middot;', '·').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&amp;', '&')
    if (n === v) break
    v = n
  }
  return v
}
const say = (text) => {
  if (/SERVICE_KEY_IS_NOT_REGISTERED|SERVICE KEY IS NOT REGISTERED/i.test(text)) return '키가 아직 등록되지 않았어요 — 활용신청 승인 후 잠시 뒤 다시 시도하세요'
  if (/SERVICE ACCESS DENIED|ACCESS_DENIED/i.test(text)) return '한눈에보는문화정보 활용신청이 안 되어 있어요'
  return null
}

// 이 서비스는 sido(시도) 조건을 무시하고 전국 자료를 돌려줘요. 그래서 앞 100건만 보면 제주 것이 4개뿐이에요 →
// 1년치 전국 자료를 모두 받아(약 1000건) 제주 것만 골라요.
export async function getCulture({ days = 365, rows = 1000 } = {}) {
  if (cache && Date.now() - cache.at < 30 * 60e3) return cache.data
  // 1순위: 제주특별자치도 전시문화행사정보(제주in놀다) — 제주 자료만 100건 이상. 안 되면 아래 전국 자료에서 제주만 골라요.
  try {
    const nolda = await getNoldaEvents()
    if (nolda.length) { cache = { at: Date.now(), data: nolda }; return nolda }
  } catch { /* 아래로 */ }
  const from = new Date()
  const to = new Date(Date.now() + days * 86400e3)
  let items = []
  for (let page = 1; page <= 4; page += 1) {
    const qs = new URLSearchParams({ from: ymd(from), to: ymd(to), PageNo: String(page), numOfrows: String(rows) })
    const res = await fetch(`${BASE}?${qs}&serviceKey=${encodeURIComponent(dataKey())}`)
    const text = await res.text()
    const why = say(text)
    if (why) throw new KeyError(`한눈에보는문화정보: ${why}`)
    const xml = parser.parse(text)
    const body = xml?.response?.body ?? xml?.response?.msgBody ?? xml?.response
    if (!body) throw new Error(`한눈에보는문화정보 응답 이상: ${text.slice(0, 160)}`)
    const got = toList(body.items?.item ?? body.perforList ?? body.item)
    items = items.concat(got)
    if (got.length < rows || items.length >= Number(body.totalCount ?? 0)) break
  }
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
  const jeju = await enrichCultureEvents(data.filter(inJeju)) // 행사 안내 주소·요금·전화 붙이기
  cache = { at: Date.now(), data: jeju }
  return jeju
}
