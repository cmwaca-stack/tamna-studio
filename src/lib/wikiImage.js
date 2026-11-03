// 장소 이름으로 한국어 위키백과의 대표 사진 주소를 찾아요. 못 찾으면 null (카드는 기본 그림으로 보여요).
// 1) 이름 그대로 문서 찾기 → 2) 괄호·띄어쓰기 정리 → 3) 위키백과 검색 순서로 시도하고, 요청은 동시에 4개까지만 보내요.
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
async function getJson(url) {
  const res = await fetch(url)
  if (res.status === 429) return undefined
  if (!res.ok) return null
  return res.json()
}

async function summaryImage(title) {
  const j = await getJson(`${BASE}/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
  if (j === undefined) return undefined
  return j?.thumbnail?.source ?? null
}

async function searchImage(query) {
  const q = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: query, gsrlimit: '1',
    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '500',
  })
  const j = await getJson(`${BASE}/w/api.php?${q}`)
  if (j === undefined) return undefined
  const page = Object.values(j?.query?.pages ?? {})[0]
  return page?.thumbnail?.source ?? null
}

// 이름으로 못 찾을 때 대신 보여 줄 대표 종류 사진 (예: 몰래물마을방사탑1호 → 방사탑)
const KINDS = ['방사탑', '환해장성', '향교', '읍성', '봉수', '연대', '유적']

async function find(name) {
  const clean = name.replace(/\([^)]*\)/g, '').trim()
  const base = clean.replace(/\d+호$/, '').replace(/^제주\s*/, '').replace(/지$/, '')
  const titles = [...new Set([name, name.replace(/ /g, ''), clean, clean.replace(/ /g, ''), base, base.replace(/ /g, '')])].filter(Boolean)
  for (const t of titles) {
    const src = await summaryImage(t)
    if (src === undefined) return undefined
    if (src) return src
  }
  const found = await searchImage(`${base} 제주`)
  if (found !== null) return found
  const kind = KINDS.find((k) => clean.includes(k))
  return kind ? summaryImage(kind) : null
}

export function wikiImage(name) {
  if (!cache.has(name)) {
    cache.set(name, limited(async () => {
      try {
        const src = await find(name)
        if (src === undefined) cache.delete(name)
        return src ?? null
      } catch {
        cache.delete(name)
        return null
      }
    }))
  }
  return cache.get(name)
}
