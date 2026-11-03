// 사진·주소가 없는 음식점을 카카오 검색 API로 한 번만 찾아서 public/food-extra.json 에 저장해요.
// 사이트가 열릴 때마다 호출하지 않으니 키가 노출되지 않고 하루 호출 한도도 쓰지 않아요.
// 실행: node scripts/build-food-extra.cjs [해장국|향토|관광공사|모범]  (개발 서버가 5173 에서 켜져 있어야 해요)
const fs = require('fs')
const path = require('path')
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

async function findOne({ title, addr }) {
  const area = (addr ?? '').split(' ').slice(1, 3).join(' ') // 예: 제주시 애월읍
  const pl = await (await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?size=5&query=${encodeURIComponent(`제주 ${title.replace(/\(.*?\)/g, '')} ${area}`.trim())}`, { headers: H })).json()
  const key = nameKey(title)
  const hit = (pl.documents ?? []).find((d) => d.category_group_code === 'FD6' || d.category_group_code === 'CE7') && (pl.documents ?? []).find((d) => {
    const n = nameKey(d.place_name)
    return (n.includes(key) || key.includes(n)) && /제주|서귀포/.test(d.address_name)
  })
  const place = hit ?? null
  const q = place ? `${place.place_name} ${place.road_address_name || place.address_name}` : `제주 ${title} ${area}`
  const im = await (await fetch(`https://dapi.kakao.com/v2/search/image?size=5&sort=accuracy&query=${encodeURIComponent(q)}`, { headers: H })).json()
  // 스티커·이모티콘·로고·광고성 이미지는 빼고, 블로그·카페 사진을 먼저 골라요
  const bad = /sticker|emoticon|emoji|line.me|storep|logo|banner|icon|clipart/i
  const ok = (im.documents ?? []).filter((d) => d.width >= 300 && d.height >= 200 && /^https:/.test(d.image_url) && !bad.test(d.image_url + d.doc_url))
  const pic = ok.find((d) => d.collection === 'blog' || d.collection === 'cafe') ?? ok[0]
  return {
    ...(place ? { addr: place.road_address_name || place.address_name, lat: place.y, lng: place.x, tel: place.phone, place: place.place_url } : {}),
    ...(pic ? { img: pic.image_url, thumb: pic.thumbnail_url, doc: pic.doc_url } : {}),
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
      if (db[k]) continue
      try { db[k] = await findOne(s) } catch (e) { console.log('실패', s.title, e.message); continue }
      n += 1
      if (n % 20 === 0) { fs.writeFileSync(OUT, JSON.stringify(db)); console.log(' ', n) }
      await sleep(150)
    }
    fs.writeFileSync(OUT, JSON.stringify(db))
  }
  const v = Object.values(db)
  console.log('총', v.length, '곳 / 사진', v.filter((x) => x.img).length, '/ 주소', v.filter((x) => x.addr).length)
})()
