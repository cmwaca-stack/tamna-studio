// 오일장 6곳의 대표 사진을 카카오 이미지 검색으로 한 번만 찾아 public/market-images.json 에 저장해요.
// 실행: node scripts/build-market-images.cjs
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const K = fs.readFileSync(path.join(root, '.env.local'), 'utf8').match(/^KAKAO_REST_KEY=(.*)$/m)[1].trim()
const H = { Authorization: `KakaoAK ${K}` }
const MARKETS = {
  제주민속오일시장: ['제주민속오일시장 전경', '제주 민속오일시장 장터'],
  서귀포향토오일시장: ['서귀포향토오일시장 전경', '서귀포 향토오일시장 장터'],
  한림민속오일장: ['한림민속오일장 장터', '한림 오일장 전경'],
  고성오일장: ['고성오일시장 장터', '성산 고성 오일장 전경'],
  대정오일시장: ['대정오일시장 장터', '대정 오일장 전경'],
  세화민속오일시장: ['세화민속오일시장 장터', '세화 오일장 전경'],
}
const bad = /sticker|emoticon|emoji|line.me|storep|logo|banner|icon|clipart/i
;(async () => {
  const out = {}
  const used = new Set() // 같은 글의 같은 사진이 두 시장에 쓰이지 않게
  for (const [name, qs] of Object.entries(MARKETS)) {
    let pick = null
    for (const q of qs) {
      const j = await (await fetch(`https://dapi.kakao.com/v2/search/image?size=10&sort=accuracy&query=${encodeURIComponent(q)}`, { headers: H })).json()
      const ok = (j.documents ?? []).filter((d) => d.width >= 400 && d.height >= 250 && /^https:/.test(d.image_url) && !bad.test(d.image_url + d.doc_url))
      const fresh = ok.filter((d) => !used.has(d.doc_url) && !used.has(d.image_url))
      pick = fresh.find((d) => d.collection === 'blog' || d.collection === 'cafe') ?? fresh[0]
      if (pick) { used.add(pick.doc_url); used.add(pick.image_url); out[name] = { img: pick.image_url, thumb: pick.thumbnail_url, doc: pick.doc_url, q }; break }
    }
    console.log(name, pick ? pick.doc_url.slice(0, 70) : '없음')
    await new Promise((r) => setTimeout(r, 200))
  }
  fs.writeFileSync(path.join(root, 'public', 'market-images.json'), JSON.stringify(out))
  console.log('저장', Object.keys(out).length, '곳')
})()
