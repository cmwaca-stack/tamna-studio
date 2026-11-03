// 사진·주소가 없는 음식점을 카카오 검색 API로 한 번만 찾아서 public/food-extra.json 에 저장해요.
// 사이트가 열릴 때마다 호출하지 않으니 키가 노출되지 않고 하루 호출 한도도 쓰지 않아요.
// 실행: node scripts/build-food-extra.cjs [해장국|향토|관광공사|모범]  (개발 서버가 5173 에서 켜져 있어야 해요)
const fs = require('fs')
const path = require('path')
const { verifiedPhoto } = require('./verified-photo.cjs')
const root = path.join(__dirname, '..')
const K = fs.readFileSync(path.join(root, '.env.local'), 'utf8').match(/^KAKAO_REST_KEY=(.*)$/m)[1].trim()
const H = { Authorization: `KakaoAK ${K}` }
const API = 'http://localhost:5173/api'
const OUT = path.join(root, 'public', 'food-extra.json')
const nameKey = (n) => n.replace(/\(.*?\)|\s+/g, '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const get = async (u) => (await fetch(u)).json()

const GROUPS = {
  해장국: async () => {
    const q = encodeURIComponent('해장국|내장탕|순대국|국밥')
    const [vj, model] = await Promise.all([get(`${API}/olle?kind=food&src=vj&keyword=${q}`), get(`${API}/olle?kind=food&src=model&keyword=${q}`)])
    return [...vj, ...model].map((x) => ({ title: x.title, addr: x.addr }))
  },
  향토: async () => (await get(`${API}/olle?kind=food&src=local`)).map((x) => ({ title: x.title, addr: x.addr })),
  관광공사: async () => (await get(`${API}/tour?type=39&rows=500&arrange=Q`)).filter((x) => !x.image).map((x) => ({ title: x.title, addr: x.addr })),
  모범: async () => (await get(`${API}/olle?kind=food&src=model`)).map((x) => ({ title: x.title, addr: x.addr })),
}

async function findOne({ title, addr }, loose = false) {
  const area = (addr ?? '').split(' ').slice(1, 3).join(' ') // 예: 제주시 애월읍
  const pl = await (await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?size=5&query=${encodeURIComponent(`제주 ${title.replace(/\(.*?\)/g, '')} ${area}`.trim())}`, { headers: H })).json()
  const key = nameKey(title)
  // 음식점·카페만 골라요 (주차장·편의시설 등 같은 이름의 다른 장소는 제외)
  const hit = (pl.documents ?? []).find((d) => (d.category_group_code === 'FD6' || d.category_group_code === 'CE7') && !/주차장/.test(d.place_name) && /제주|서귀포/.test(d.address_name) && (() => {
    const n = nameKey(d.place_name)
    return n.includes(key) || key.includes(n)
  })())
  // 이름이 달라도 같은 도로명 주소의 음식점이면 같은 가게로 봐요
  const road = (addr ?? "").replace(/(.*?)/g, "").match(/[가-힣0-9]+(로|길)s?d+(-d+)?s*$/)
  const byAddr = !hit && road ? (pl.documents ?? []).find((d) => (d.category_group_code === "FD6" || d.category_group_code === "CE7") && !/주차장/.test(d.place_name) && (d.road_address_name ?? "").replace(/s/g, "").endsWith(road[0].replace(/s/g, ""))) : null
  const place = hit ?? byAddr ?? null
  // 그 가게를 소개하는 블로그 글에 실린 사진만 써요 (글을 못 찾으면 사진 없음)
  const pic = await verifiedPhoto({ headers: H, name: place ? place.place_name : title, area, addr: place ? (place.road_address_name || place.address_name) : addr, loose })
  return {
    ...(place ? { addr: place.road_address_name || place.address_name, lat: place.y, lng: place.x, tel: place.phone, place: place.place_url } : {}),
    ...(pic ? { img: pic.img, thumb: pic.thumb, doc: pic.doc, post: pic.post } : {}),
  }
}

;(async () => {
  const which = process.argv[2]
  const names = which ? [which] : Object.keys(GROUPS).filter((g) => g !== '모범')
  const db = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}
  for (const g of names) {
    const list = await GROUPS[g]()
    console.log(g, list.length, '곳')
    let n = 0
    for (const s of list) {
      const k = nameKey(s.title)
      if (db[k] && !(process.argv[3] === "보강" && !db[k].img)) continue
      try { db[k] = await findOne(s, process.argv[3] === "보강") } catch (e) { console.log('실패', s.title, e.message); continue }
      n += 1
      if (n % 20 === 0) { fs.writeFileSync(OUT, JSON.stringify(db)); console.log(' ', n) }
      await sleep(150)
    }
    fs.writeFileSync(OUT, JSON.stringify(db))
  }
  const v = Object.values(db)
  console.log('총', v.length, '곳 / 사진', v.filter((x) => x.img).length, '/ 주소', v.filter((x) => x.addr).length)
})()
