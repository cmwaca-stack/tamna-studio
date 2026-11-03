// 장소 이름으로 한국어 위키백과의 대표 사진을 찾아요. 결과는 { src, exact } 또는 null 이에요.
//  - exact: true  → 위키백과 문서 제목이 장소 이름과 사실상 같아서 "그 장소의 사진"이라고 볼 수 있어요.
//  - exact: false → 같은 종류의 대표 사진(예: 방사탑, 환해장성)이라 화면에 "참고 이미지"로 표시해요.
//  - null         → 맞는 사진이 없어요 (카드는 기본 그림). 엉뚱한 사진을 붙이는 것보다 비워 두는 게 낫습니다.
// 이름이 맞는지(제목 일치) 확인하지 않은 검색 결과는 쓰지 않아요. 요청은 동시에 4개까지만 보내요.
import { fetchPlaces } from '../api/client'

const cache = new Map()
const BASE = 'https://ko.wikipedia.org'
const MAX_PARALLEL = 4
let running = 0
const waiting = []

function limited(task) {
  return new Promise((resolve) => {
    const run = async () => {
      running++
      try { resolve(await task()) } finally {
        running--
        waiting.shift()?.()
      }
    }
    running < MAX_PARALLEL ? run() : waiting.push(run)
  })
}

// 429(요청 과다)면 undefined 를 돌려줘서 "없음"으로 굳어지지 않게 해요.
async function getJson(url, retry = true) {
  const res = await fetch(url)
  if (res.status === 429) {
    if (!retry) return undefined
    await new Promise((r) => setTimeout(r, 1500)) // 잠깐 쉬었다가 한 번만 다시 시도
    return getJson(url, false)
  }
  if (!res.ok) return null
  return res.json()
}

// 위키백과의 "사진을 올려 주세요" 자리표시 그림과 도식(svg)은 사진이 아니라서 없는 것으로 봐요
const PLACEHOLDER = /Replace_this_image|No[_-]?image|Image_placeholder|\.svg(\.png)?(\?|$)/i
const real = (src) => (src && !PLACEHOLDER.test(src) ? src : null)

// 비교용으로 이름을 다듬어요: 괄호·공백·구두점 제거
const norm = (s = '') => s.replace(/\([^)]*\)/g, '').replace(/[\s·.,\-–—_]/g, '').replace(/제주(특별자치도)?/g, '').toLowerCase()

// 두 이름의 "가장 긴 공통 글자 조각" 길이
function commonLen(a, b) {
  let best = 0
  const dp = Array(b.length + 1).fill(0)
  for (let i = 1; i <= a.length; i++) {
    for (let j = b.length; j >= 1; j--) {
      dp[j] = a[i - 1] === b[j - 1] ? dp[j - 1] + 1 : 0
      if (dp[j] > best) best = dp[j]
    }
  }
  return best
}

// "같은 대상"이라고 인정하는 기준: 다듬은 이름이 같거나, 한쪽이 다른 쪽에 1글자(예: '지')만 더 붙은 경우.
// (제주향교 ↔ 향교, 별도환해장성 ↔ 환해장성 처럼 더 일반적인 문서는 같은 대상이 아니라서 제외)
function sameThing(query, title) {
  const q = norm(query)
  const t = norm(title)
  if (!q || !t || Math.min(q.length, t.length) < 3) return false
  if (q === t) return true
  const [short, long] = q.length <= t.length ? [q, t] : [t, q]
  return long.includes(short) && long.length - short.length <= 1
}

// 검수에서 "문서는 맞지만 위키백과의 대표 사진이 그 장소를 보여주지 않는" 것으로 확인된 이름 → 사진을 붙이지 않아요
const BLOCKED = ['송악산', '이중섭거리', '제주4·3평화공원']

// 같은 대상은 아니어도 이름이 충분히 겹치는지(참고용 판단) — 공통 조각이 3글자 이상이고 짧은 쪽의 60% 이상
function related(query, title) {
  const q = norm(query)
  const t = norm(title)
  const c = commonLen(q, t)
  return c >= 3 && c >= Math.min(q.length, t.length) * 0.6
}

// 후보 이름 여러 개를 한 번의 요청으로 조회해요 (요청 수를 줄여 위키백과의 제한에 걸리지 않게). 이름 순서대로 우선해요.
async function lookup(titles, name, own = []) {
  const q = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', titles: titles.join('|'), redirects: '1',
    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '500',
  })
  const j = await getJson(`${BASE}/w/api.php?${q}`)
  if (j === undefined) return undefined
  const pages = Object.values(j?.query?.pages ?? {})
  // 위키백과가 이 이름(own)을 다른 공식 제목으로 연결해 둔 경우(만장굴 → 제주 김녕굴과 만장굴)는 같은 대상으로 봐요.
  // 단, 더 일반적인 문서(별도환해장성 → 환해장성)로 넘어가는 건 같은 대상이 아니라서 제외해요.
  const nameKey = norm(name)
  const viaRedirect = new Set((j?.query?.redirects ?? [])
    .filter((r) => own.includes(r.from) && !(nameKey.includes(norm(r.to)) && norm(r.to) !== nameKey))
    .map((r) => r.to))
  const order = (p) => { const i = titles.findIndex((t) => norm(t) === norm(p.title)); return i < 0 ? 99 : i }
  const ok = (p) => sameThing(name, p.title) || viaRedirect.has(p.title)
  const hits = pages.filter((p) => real(p.thumbnail?.source) && ok(p)).sort((a, b) => order(a) - order(b))
  return hits[0] ? { src: real(hits[0].thumbnail.source), title: hits[0].title } : null
}

async function summary(title) {
  const j = await getJson(`${BASE}/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
  if (j === undefined) return undefined
  const src = real(j?.thumbnail?.source)
  return src ? { src, title: j.title } : null
}

async function search(query) {
  const q = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: query, gsrlimit: '3',
    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '500',
  })
  const j = await getJson(`${BASE}/w/api.php?${q}`)
  if (j === undefined) return undefined
  const pages = Object.values(j?.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  const hit = pages.find((p) => real(p.thumbnail?.source))
  return hit ? { src: real(hit.thumbnail.source), title: hit.title } : null
}

// 위키미디어 커먼즈(사진 보관소)에서 사진 파일만 검색해요
async function commonsPhoto(query) {
  const q = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', generator: 'search', gsrnamespace: '6',
    gsrsearch: `${query} filetype:bitmap`, gsrlimit: '1', prop: 'imageinfo', iiprop: 'url', iiurlwidth: '500',
  })
  const j = await getJson(`https://commons.wikimedia.org/w/api.php?${q}`)
  if (j === undefined) return undefined
  const page = Object.values(j?.query?.pages ?? {})[0]
  return real(page?.imageinfo?.[0]?.thumburl)
}

// 이름 변형: 괄호를 뺀 이름과 괄호 안 이름(예: 단산(바구니오름) → 단산, 바구니오름)
function variants(name) {
  const inner = (name.match(/\(([^)]+)\)/) ?? [])[1]
  const clean = name.replace(/\([^)]*\)/g, '').trim()
  return [...new Set([clean, inner].filter((v) => v && norm(v).length >= 3))]
}

// ① 한국관광공사 목록: 공식 관광 사진이라 가장 믿을 만해요. 목록은 한 번만 받아 둬요.
let tourList = null
function tourPlaces() {
  tourList ??= Promise.all(['12', '14', '28', '39'].map((t) => fetchPlaces('', t, 500).catch(() => []))).then((l) => l.flat().filter((p) => p.image))
  return tourList
}
async function tourImage(name) {
  const list = await tourPlaces()
  const hit = variants(name).map((v) => list.find((p) => sameThing(v, p.title))).find(Boolean)
  return hit ? { src: hit.image, exact: true } : null
}

// ② 위키데이터: 이름이 같은 항목의 대표 사진(P18). 항목 이름이 같을 때만 써요.
async function wikidataImage(name) {
  for (const v of variants(name)) {
    const q = new URLSearchParams({ action: 'wbsearchentities', search: v, language: 'ko', uselang: 'ko', format: 'json', origin: '*', limit: '5', type: 'item' })
    const j = await getJson('https://www.wikidata.org/w/api.php?' + q)
    if (j === undefined) return undefined
    const item = (j?.search ?? []).find((e) => sameThing(v, e.label ?? ''))
    if (!item) continue
    const c = await getJson('https://www.wikidata.org/w/api.php?' + new URLSearchParams({ action: 'wbgetclaims', entity: item.id, property: 'P18', format: 'json', origin: '*' }))
    if (c === undefined) return undefined
    const file = c?.claims?.P18?.[0]?.mainsnak?.datavalue?.value
    const src = file ? real('https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=500') : null
    if (src && !/\.svg/i.test(file)) return { src, exact: true }
  }
  return null
}

// ②-2 위키백과 문서 본문 사진: 대표 사진은 없어도 그 장소 문서에 실린 사진이면 그 장소 사진이에요.
// 아이콘·로고·지도·위치도 같은 파일은 빼요.
const NOT_PHOTO = /\.(svg|gif|webm|ogv|pdf|tif)$|flag|logo|icon|symbol|ambox|commons-|edit-|question|locator|location|map|지도|위치|표지|stub|red_pog|wikisource|wikiquote|disambig|crystal|oojs|padlock|increase|decrease|steady|nuvola/i
async function articleImage(titles, name) {
  const q = new URLSearchParams({ action: 'query', format: 'json', origin: '*', titles: titles.join('|'), redirects: '1', prop: 'images', imlimit: '30' })
  const j = await getJson(BASE + '/w/api.php?' + q)
  if (j === undefined) return undefined
  const page = Object.values(j?.query?.pages ?? {}).find((p) => p.images && sameThing(name, p.title))
  const files = (page?.images ?? []).map((i) => i.title).filter((t) => !NOT_PHOTO.test(t)).slice(0, 6)
  if (!files.length) return null
  const info = await getJson(BASE + '/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', origin: '*', titles: files.join('|'), prop: 'imageinfo', iiprop: 'url|size', iiurlwidth: '500',
  }))
  if (info === undefined) return undefined
  const best = Object.values(info?.query?.pages ?? {})
    .filter((p) => real(p.imageinfo?.[0]?.thumburl) && (p.imageinfo[0].width ?? 0) >= 400 && (p.imageinfo[0].height ?? 0) >= 250)
    .sort((a, b) => files.indexOf(a.title) - files.indexOf(b.title))[0]
  return best ? { src: real(best.imageinfo[0].thumburl), exact: true } : null
}

// ③ 위키미디어 커먼즈: 사진 파일 이름에 장소 이름이 그대로 들어 있을 때만 (예: "제주도 아부오름1.jpg")
async function commonsByTitle(name) {
  for (const v of variants(name)) {
    const q = new URLSearchParams({
      action: 'query', format: 'json', origin: '*', generator: 'search', gsrnamespace: '6', gsrsearch: v + ' filetype:bitmap',
      gsrlimit: '8', prop: 'imageinfo', iiprop: 'url', iiurlwidth: '500',
    })
    const j = await getJson('https://commons.wikimedia.org/w/api.php?' + q)
    if (j === undefined) return undefined
    const pages = Object.values(j?.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    const hit = pages.find((p) => norm(p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '')).includes(norm(v)) && real(p.imageinfo?.[0]?.thumburl))
    if (hit) return { src: real(hit.imageinfo[0].thumburl), exact: true }
  }
  return null
}

// 이름으로 못 찾을 때 대신 보여 줄 같은 종류의 대표 사진 (예: 몰래물마을방사탑1호 → 방사탑)
const KINDS = ['방사탑', '환해장성'] // 향교·읍성처럼 다른 지역 사진이 나올 수 있는 종류는 쓰지 않아요

async function find(name) {
  if (BLOCKED.includes(name)) return null
  const tour = await tourImage(name)
  if (tour) return tour
  // "A - B" 처럼 부제가 붙은 이름은 앞부분(A)도 같이 찾아봐요
  const main = name.split(/\s[-–]\s/)[0]
  const clean = main.replace(/\([^)]*\)/g, '').trim()
  const base = clean.replace(/\d+호$/, '').replace(/^제주\s*/, '').replace(/지$/, '')
  const titles = [...new Set([name, main, clean, clean.replace(/ /g, ''), base, base.replace(/ /g, '')])].filter((t) => t && t !== '연대')
  const direct = await lookup(titles, name, [name, main, clean, clean.replace(/ /g, '')])
  if (direct === undefined) return undefined
  if (direct) return { src: direct.src, exact: true }
  const wd = await wikidataImage(name)
  if (wd === undefined) return undefined
  if (wd) return wd
  const art = await articleImage(titles, name)
  if (art === undefined) return undefined
  if (art) return art
  if (base !== '연대') {
    const r = await search(`${base} 제주`)
    if (r === undefined) return undefined
    if (r && sameThing(name, r.title)) return { src: r.src, exact: true }
  }
  const cm = await commonsByTitle(name)
  if (cm === undefined) return undefined
  if (cm) return cm
  const kind = KINDS.find((k) => clean.includes(k))
  if (!kind) return null
  const k = await summary(kind)
  if (k === undefined) return undefined
  if (k) return { src: k.src, exact: false }
  const photo = await commonsPhoto(`${kind} 제주`) // 문서 대표 사진이 도식이면 위키미디어 커먼즈의 실제 사진을 참고용으로
  if (photo === undefined) return undefined
  return photo ? { src: photo, exact: false } : null
}

export function wikiImage(name) {
  if (!cache.has(name)) {
    cache.set(name, limited(async () => {
      try {
        const r = await find(name)
        if (r === undefined) cache.delete(name)
        return r ?? null
      } catch {
        cache.delete(name)
        return null
      }
    }))
  }
  return cache.get(name)
}

// 검수·테스트용: 이름이 얼마나 닮았는지 판정 함수도 내보내요
export const _match = { sameThing, related }
