// 다음지도(카카오맵) 평점: scripts/build-food-rating.cjs 가 미리 모아 둔 public/food-ratings.json 을 읽어요.
import { foodKey } from './foodExtra'

let loading = null
export function loadFoodRatings() {
  loading ??= fetch('/food-ratings.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
  return loading
}

// 평점이 min 이상인 곳만 남기고 평점 높은 순(같으면 리뷰 많은 순)으로 정렬해요
export async function withFoodRating(list, min) {
  const db = await loadFoodRatings()
  return list
    .map((p) => ({ ...p, rating: db[foodKey(p.title)] }))
    .filter((p) => p.rating?.s != null && p.rating.s >= min)
    .sort((a, b) => b.rating.s - a.rating.s || b.rating.n - a.rating.n)
}
