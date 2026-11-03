// 오름·신화·4·3·올레길·제주역사·국가유산 카드의 사진을 카카오 검색으로 미리 찾아 둔 자료 (scripts/build-spot-extra.mjs 가 만든 public/spot-extra.json)
let loading = null
export const spotKey = (n) => n.replace(/\(.*?\)|\s+/g, '')

export function spotExtra(title) {
  loading ??= fetch('/spot-extra.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
  return loading.then((db) => db[spotKey(title)]?.img ?? null)
}
