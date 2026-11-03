// 오름·신화·4·3·올레길·제주역사·국가유산 카드의 사진을 카카오 이미지 검색으로 한 번만 찾아 public/spot-extra.json 에 저장해요.
// 실행: node scripts/build-spot-extra.mjs  (개발 서버가 5173 에서 켜져 있어야 해요)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const K = fs.readFileSync(path.join(root, '.env.local'), 'utf8').match(/^KAKAO_REST_KEY=(.*)$/m)[1].trim()
const H = { Authorization: `KakaoAK ${K}` }
const OUT = path.join(root, 'public', 'spot-extra.json')
const nameKey = (n) => n.replace(/\(.*?\)|\s+/g, '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const load = (f) => import(pathToFileURL(path.join(root, 'src', 'data', f)).href)

const { SPOTS } = await load('spots.js')
const { THEMES } = await load('themes.js')

// 1) 테마별 대표 장소  2) 테마별 국가유산 (화면과 같은 검색어로 불러와요)
const targets = []
for (const [theme, list] of Object.entries(SPOTS)) for (const s of list) targets.push({ title: s.title, q: `제주 ${s.title}`, theme })
const words = new Set([''])
for (const t of THEMES) {
  const w = t.kitHeritage === undefined ? t.heritageKeyword : t.kitHeritage
  if (w !== false && !t.noHeritage && w !== undefined) words.add(w || '')
}
for (const w of words) {
  const list = await (await fetch(`http://localhost:5173/api/heritage?keyword=${encodeURIComponent(w)}`)).json().catch(() => [])
  for (const h of Array.isArray(list) ? list : []) targets.push({ title: h.name, q: `제주 ${h.name.split(/\s-\s| 일괄/)[0]}`, theme: 'heritage' })
}

const bad = /sticker|emoticon|emoji|line.me|storep|logo|banner|icon|clipart/i
const db = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}
let n = 0
for (const t of targets) {
  const k = nameKey(t.title)
  if (db[k]) continue
  try {
    const im = await (await fetch(`https://dapi.kakao.com/v2/search/image?size=8&sort=accuracy&query=${encodeURIComponent(t.q)}`, { headers: H })).json()
    const ok = (im.documents ?? []).filter((d) => d.width >= 300 && d.height >= 200 && /^https:/.test(d.image_url) && !bad.test(d.image_url + d.doc_url))
    const pic = ok.find((d) => d.collection === 'blog' || d.collection === 'cafe') ?? ok[0]
    db[k] = pic ? { img: pic.image_url, thumb: pic.thumbnail_url, doc: pic.doc_url } : {}
  } catch (e) { console.log('실패', t.title, e.message); continue }
  n += 1
  if (n % 25 === 0) { fs.writeFileSync(OUT, JSON.stringify(db)); console.log(' ', n, '/', targets.length) }
  await sleep(150)
}
fs.writeFileSync(OUT, JSON.stringify(db))
const v = Object.values(db)
console.log('총', v.length, '곳 / 사진', v.filter((x) => x.img).length)
