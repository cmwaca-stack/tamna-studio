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
    if (!x || p.image) return p
    return { ...p, image: x.img, searched: !!x.img, addr: p.addr || x.addr, lat: p.lat || x.lat, lng: p.lng || x.lng }
  })
}
