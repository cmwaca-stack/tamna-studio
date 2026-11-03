// 장소 이름으로 한국어 위키백과의 대표 사진 주소를 찾아요. 없으면 null (카드는 기본 그림으로 보여요).
const cache = new Map()

async function summaryImage(title) {
  const res = await fetch(`https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
  if (!res.ok) return null
  const j = await res.json()
  return j.thumbnail?.source ?? null
}

export function wikiImage(name) {
  if (!cache.has(name)) {
    const p = (async () => {
      try {
        return (await summaryImage(name)) ?? (name.includes(' ') ? await summaryImage(name.replace(/ /g, '')) : null)
      } catch {
        return null
      }
    })()
    cache.set(name, p)
  }
  return cache.get(name)
}
