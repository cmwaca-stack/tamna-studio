// 직접 확인한 카카오 장소(place.map.kakao.com/번호)로 가게 위치·사진을 고정하고, 빼기로 한 가게는 숨겨요.
// build-food-extra.cjs 로 만든 public/food-extra.json 위에 덮어써요. 실행: node scripts/food-overrides.cjs
const fs = require('fs')
const path = require('path')
const { verifiedPhoto } = require('./verified-photo.cjs')
const root = path.join(__dirname, '..')
const K = fs.readFileSync(path.join(root, '.env.local'), 'utf8').match(/^KAKAO_REST_KEY=(.*)$/m)[1].trim()
const H = { Authorization: `KakaoAK ${K}` }
const OUT = path.join(root, 'public', 'food-extra.json')
const nameKey = (n) => n.replace(/\(.*?\)|\s+/g, '')

// [사이트 목록의 가게 이름, 카카오 장소 번호, 검색에 쓸 이름]
const FIX = [
  ['고서방 짬뽕', '1528548685', '고서방짬뽕'],
  ['제주돗', '287748982', '제주돗'],
  ['어장군', '11262884', '어장군'],
  ['순이네해장국', '11131970', '순이네해장국'],
  ['우진해장국', '11547525', '우진해장국'],
  ['내고향해장국', '26419688', '내고향해장국 외도점'],
  ['서귀포해장국의전설', '1282004723', '서귀포해장국의전설'],
  ['제주미향해장국', '20688497', '제주미향해장국전문점 모슬포본점'],
  ['비자림꿩 메밀국수', '9065944', '비자림꿩메밀손칼국수'],
  ['노형늘봄', '8067674', '노형늘봄'],
  ['돈사돈2호점', '291271136', '돈사돈 2호점'],
  ['모슬포고등어', '934589960', '모슬포고등어'],
]
const HIDE = ['국수냐 국밥이냐', '다올터해장국', '진부령 황태해장국', '일품양평해장국교래점', '세부마을', '물항식당세부마을', '물항식당']

;(async () => {
  const db = JSON.parse(fs.readFileSync(OUT, 'utf8'))
  for (const [title, id, q] of FIX) {
    let place = null
    for (const query of [`제주 ${q}`, q, `제주 ${title}`]) {
      const r = await (await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?size=15&query=${encodeURIComponent(query)}`, { headers: H })).json()
      place = (r.documents ?? []).find((d) => d.id === id)
      if (place) break
    }
    if (!place) { console.log('장소를 못 찾음', title, id); continue }
    const addr = place.road_address_name || place.address_name
    const pic = await verifiedPhoto({ headers: H, name: place.place_name, addr, loose: true })
    db[nameKey(title)] = { fixed: true, addr, lat: place.y, lng: place.x, tel: place.phone, place: place.place_url, ...(pic ? { img: pic.img, thumb: pic.thumb, doc: pic.doc, post: pic.post } : {}) }
    console.log(title, '→', place.place_name, '|', addr, '|', pic ? pic.post : '사진 없음')
  }
  for (const t of HIDE) db[nameKey(t)] = { hide: true }
  fs.writeFileSync(OUT, JSON.stringify(db))
})()
