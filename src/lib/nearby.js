import { fetchNear } from '../api/client'

// 거리를 사람이 읽는 글자로 (556 → 556m, 1300 → 1.3km)
export const kmText = (m) => (m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`)

// 한국관광공사 분류: 12 관광지 · 14 문화시설 · 28 레포츠 · 32 숙박 · 39 음식점
const GROUPS = [
  { kind: 'spot', types: ['12', '14'], keep: 8 },
  { kind: 'activity', types: ['28'], keep: 4 },
  { kind: 'food', types: ['39'], keep: 6 },
  { kind: 'stay', types: ['32'], keep: 4 },
]

// 좌표(들) 주변 5km, 가까운 순으로 가볼 곳·체험·맛집·숙소를 찾아 합쳐요 (한국관광공사 locationBasedList2).
// points: [[이름, 위도, 경도], ...]  → { spot, activity, food, stay }  (각 항목에 from=가까운 기준 지점, dist=미터)
// 이름 검색은 포구·마을 이름이 안 맞아 비는 일이 많아서, 좌표로 찾습니다.
export async function findNearby(points, groups = GROUPS) {
  const calls = points.flatMap(([name, lat, lng]) => groups.flatMap((g) => g.types.map((type) => [g.kind, type, name, lat, lng])))
  const results = await Promise.all(calls.map(async ([kind, type, name, lat, lng]) => {
    const list = await fetchNear(lat, lng, type, 6).catch(() => [])
    return list.map((p) => ({ ...p, kind, from: name }))
  }))
  const out = Object.fromEntries(groups.map((g) => [g.kind, []]))
  const seen = new Set()
  for (const p of results.flat().sort((a, b) => a.dist - b.dist)) {
    if (seen.has(p.id)) continue
    seen.add(p.id)
    out[p.kind].push(p)
  }
  return Object.fromEntries(groups.map((g) => [g.kind, out[g.kind].slice(0, g.keep)]))
}
