// 전시·공연·축제 카드를 누르면 "그 행사를 알려 주는 사이트"로 가도록, 행사마다 안내 주소를 찾아 붙여요.
//  1순위: 자료에 들어 있는 공식 홈페이지 · 2순위: 그 행사를 검색한 결과 페이지(네이버)
import { XMLParser } from 'fast-xml-parser'
import { dataKey, fetchJson } from './http.js'

const SNS = /instagram|facebook|youtube|youtu\.be|twitter|x\.com|blog\.naver|band\.us/i
const searchLink = (title) => `https://search.naver.com/search.naver?query=${encodeURIComponent(`제주 ${String(title).replace(/[<>《》「」『』〈〉]/g, ' ').replace(/\s+/g, ' ').trim()}`)}`
const unesc = (t = '') => {
  let v = String(t)
  for (let i = 0; i < 3; i++) { const n = v.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&'); if (n === v) break; v = n }
  return v
}
// 글 속의 주소들 중 공식 홈페이지를 먼저 고르고, SNS 는 맨 뒤로
const pickUrl = (text) => {
  const urls = [...unesc(text).matchAll(/https?:\/\/[^\s"'<>)]+/g)].map((m) => m[0].replace(/[.,;]+$/, ''))
  return urls.find((u) => !SNS.test(u)) ?? urls[0] ?? ''
}
export const pickEventUrl = pickUrl
export const makeEventLink = (url, title) => make(url, title)
const make = (url, title) => (url ? { link: url, linkKind: 'official' } : { link: searchLink(title), linkKind: 'search' })

async function pool(items, n, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k) } }))
  return out
}

// ── 한국관광공사(TourAPI) 전시·문화시설·축제: detailCommon2 의 홈페이지·전화 ──
const tourCache = new Map() // 하루
export async function enrichTourEvents(list) {
  return pool(list, 6, async (p) => {
    const hit = tourCache.get(p.id)
    if (hit && Date.now() - hit.at < 24 * 3600e3) return { ...p, ...hit.info }
    let info = make('', p.title)
    try {
      const q = new URLSearchParams({ serviceKey: dataKey(), MobileOS: 'ETC', MobileApp: 'TamnaStudio', _type: 'json', contentId: String(p.id) })
      const j = await fetchJson(`https://apis.data.go.kr/B551011/KorService2/detailCommon2?${q}`, 'TourAPI 상세')
      const it = [].concat(j?.response?.body?.items?.item ?? [])[0]
      if (it) info = { ...make(pickUrl(it.homepage), p.title), tel: String(it.tel ?? '').trim() }
      tourCache.set(p.id, { at: Date.now(), info })
    } catch { /* 한도 등은 검색 링크로 대신해요 */ }
    return { ...p, ...info }
  })
}

// ── 한눈에보는문화정보(전시·공연): detail2 의 안내 주소·요금·전화 ──
const parser = new XMLParser({ parseTagValue: false })
const cultCache = new Map()
export async function enrichCultureEvents(list) {
  return pool(list, 6, async (p) => {
    const hit = cultCache.get(p.id)
    if (hit && Date.now() - hit.at < 24 * 3600e3) return { ...p, ...hit.info }
    let info = make('', p.title)
    try {
      const r = await fetch(`https://apis.data.go.kr/B553457/cultureinfo/detail2?serviceKey=${encodeURIComponent(dataKey())}&seq=${encodeURIComponent(p.id)}`)
      const x = parser.parse(await r.text())
      const it = [].concat(x?.response?.body?.items?.item ?? [])[0]
      if (it) {
        const url = pickUrl(it.url) || pickUrl(it.placeUrl)
        info = { ...make(url, p.title), price: unesc(it.price ?? '').trim(), tel: unesc(it.phone ?? '').trim(), placeAddr: unesc(it.placeAddr ?? '').trim() }
      }
      cultCache.set(p.id, { at: Date.now(), info })
    } catch { /* 검색 링크로 대신해요 */ }
    return { ...p, ...info }
  })
}
