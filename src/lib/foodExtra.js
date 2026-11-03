// 사진·주소가 없는 음식점을 카카오 검색으로 미리 찾아 둔 자료 (scripts/build-food-extra.cjs 가 만든 public/food-extra.json)
let loading = null
export const foodKey = (n) => n.replace(/\(.*?\)|\s+/g, '')

export function loadFoodExtra() {
  loading ??= fetch('/food-extra.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
  return loading
}

// 한국관광공사 목록 중 사진·좌표가 없는 곳에 찾아 둔 자료를 붙여요
export async function withFoodExtra(list) {
  const db = await loadFoodExtra()
  return list.map((p) => {
    const x = db[foodKey(p.title)]
    if (!x) return p
    // 카카오에서 확인한 식당 위치(좌표·장소 페이지)를 우선 써요 — 공공자료 좌표가 주차장 등을 가리키는 경우가 있어요
    const place = x.lat ? { lat: x.lat, lng: x.lng, addr: x.addr || p.addr, placeUrl: x.place } : {}
    return { ...p, ...place, ...(p.image ? {} : { image: x.img, searched: !!x.img, addr: p.addr || x.addr, lat: p.lat || x.lat, lng: p.lng || x.lng, ...place }) }
  })
}
