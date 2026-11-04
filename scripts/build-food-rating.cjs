// "추천 맛집" 탭용: 한국관광공사 음식점(카페 제외)마다 다음지도(카카오맵) 장소를 찾아 평점·리뷰 수를 public/food-ratings.json 에 저장해요.
// 다음지도 평점은 공식 API 로 공개되지 않아서, 다음지도 누리집이 쓰는 검색·장소 주소를 한 번씩만 불러요(사이트가 열릴 때마다 부르지 않아요).
// 실행: node scripts/build-food-rating.cjs   (주소를 바꾸려면 TOUR_URL=... 환경변수)
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const OUT = path.join(root, 'public', 'food-ratings.json')
const TOUR_URL = process.env.TOUR_URL || 'https://tamna-studio-wtoi.vercel.app/api/tour?type=39&rows=500&arrange=Q'
const CAFE = 'A05020900'
const nameKey = (n) => String(n).replace(/\(.*?\)|\s+/g, '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const UA = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://map.kakao.com/' }

async function find(title, addr) {
  const area = (addr ?? '').split(' ').slice(1, 3).join(' ')
  const q = encodeURIComponent(`제주 ${String(title).replace(/\(.*?\)/g, '')} ${area}`.trim())
  const res = await fetch(`https://search.map.kakao.com/mapsearch/map.daum?q=${q}&msFlag=A&sort=0&page=1`, { headers: UA })
  const j = await res.json()
  const key = nameKey(title)
  const road = (addr ?? '').replace(/\(.*?\)/g, '').match(/[가-힣0-9]+(로|길)\s?\d+(-\d+)?\s*$/)
  return (j.place ?? []).find((p) => {
    if (p.cate_name_depth1 !== '음식점' || !/제주|서귀포/.test(`${p.address} ${p.new_address}`) || /주차장/.test(p.name)) return false
    const n = nameKey(p.name)
    if (n.includes(key) || key.includes(n)) return true
    return road && String(p.new_address ?? '').replace(/\s/g, '').endsWith(road[0].replace(/\s/g, '')) // 이름이 달라도 같은 도로명 주소면 같은 가게
  })
}

async function rating(id) {
  const res = await fetch(`https://place-api.map.kakao.com/places/panel3/${id}`, { headers: { ...UA, pf: 'PC' } })
  const j = await res.json()
  const s = j.kakaomap_review?.score_set
  return { name: j.summary?.name, s: s?.average_score ?? null, n: s?.review_count ?? 0 }
}

;(async () => {
  const tour = await (await fetch(TOUR_URL)).json()
  const list = tour.filter((p) => p.cat3 !== CAFE)
  console.log('음식점', list.length, '곳')
  const db = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}
  let found = 0
  let rated = 0
  for (const p of list) {
    const k = nameKey(p.title)
    if (db[k]?.id) { found += 1; continue }
    try {
      const hit = await find(p.title, p.addr)
      await sleep(250)
      if (!hit) { db[k] = { id: null }; continue }
      const r = await rating(hit.confirmid)
      await sleep(250)
      db[k] = { id: hit.confirmid, name: r.name ?? hit.name, s: r.s, n: r.n }
      found += 1
      if (r.s != null) rated += 1
    } catch (e) { console.log('실패', p.title, e.message) }
  }
  fs.writeFileSync(OUT, JSON.stringify(db))
  const all = Object.values(db)
  console.log('장소 찾음', all.filter((x) => x.id).length, '/ 평점 있음', all.filter((x) => x.s != null).length, '/ 4.0 이상', all.filter((x) => x.s >= 4).length)
})()
