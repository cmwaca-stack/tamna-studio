// 제주특별자치도 전시문화행사정보 (data.go.kr 15082029, 제주문화예술재단 "제주in놀다" OpenAPI — 키 없음, JSON)
//  https://www.jejunolda.com/api/event/?page=1&pageSize=100  → 오늘 이후 전시·공연·행사 (분류·요금·장소·문의처·안내 주소)
import { makeEventLink, pickEventUrl } from './events.js'

const BASE = 'https://www.jejunolda.com'
const unesc = (t = '') => {
  let v = String(t)
  for (let i = 0; i < 3; i++) { const n = v.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&amp;', '&'); if (n === v) break; v = n }
  return v.trim()
}
const ymd = (ms) => (ms ? new Date(ms + 9 * 3600e3).toISOString().slice(0, 10).replaceAll('-', '') : '') // 한국 시각 기준 날짜
const https = (u) => String(u ?? '').replace(/^http:\/\//, 'https://')

let cache = null // 30분 보관
export async function getNoldaEvents() {
  if (cache && Date.now() - cache.at < 30 * 60e3) return cache.data
  const items = []
  for (let page = 1; page <= 4; page += 1) {
    const res = await fetch(`${BASE}/api/event/?page=${page}&pageSize=100`, { redirect: 'follow' })
    if (!res.ok) throw new Error(`제주in놀다 응답 오류 (${res.status})`)
    const j = await res.json()
    if (j.resultCode && j.resultCode !== '00' && !j.items) throw new Error(`제주in놀다: ${j.resultMsg ?? j.resultCode}`)
    items.push(...(j.items ?? []))
    if (items.length >= (j.query?.rows ?? 0) || !(j.items ?? []).length) break
  }
  const data = items.map((x) => {
    const title = unesc(x.name)
    const url = https(x.link) && x.link ? x.link : pickEventUrl([x.sns1, x.sns2, x.sns3, x.sns4].filter(Boolean).map((u) => (/^https?:/.test(u) ? u : `https://${u}`)).join(' '))
    const lat = Number(x.x), lng = Number(x.y) // 자료에서 x·y 가 위도·경도로 뒤바뀌어 있어요
    return {
      id: String(x.seq),
      title,
      kind: x.categoryName ?? '',
      place: [x.location, x.oversee].find((v) => v && v !== 'null') ?? '',
      area: [x.regName, x.addr1].filter(Boolean).join(' ').replace(/제주특별자치도\s*/, ''),
      start: ymd(x.start), end: ymd(x.end),
      time: x.time && x.time !== 'null' ? String(x.time).trim() : '',
      image: x.cover ? `https://jejunolda.com/files/event/${x.cover}` : https(x.poster),
      lat: lat > 33 && lat < 34 ? lat : undefined, lng: lng > 126 && lng < 127.5 ? lng : undefined,
      price: x.payName ?? '', tel: x.tel && x.tel !== 'null' ? String(x.tel).trim() : '',
      ...makeEventLink(url ? https(url) : '', title),
    }
  }).filter((e) => e.title)
  data.sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title)) // 진행 중(시작이 빠른 것) 먼저
  cache = { at: Date.now(), data }
  return data
}
