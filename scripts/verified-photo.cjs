// 가게·장소와 사진이 맞는지 확인해서 사진을 고르는 공용 함수
// 1) 카카오 블로그 검색에서 "글 제목에 이름이 들어 있고 제주 지역이 언급된" 글만 모아요
// 2) 이미지 검색 결과 중 그 글에 실린 사진만 써요 → 이름으로 검색한 엉뚱한 사진(만화·풍경 등)이 섞이지 않아요
// 근거가 되는 글이 없으면 사진을 붙이지 않아요 (지도·그림 카드로 남아요)
const norm = (s) => String(s).replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/gi, '').replace(/[\s\-_.,·()[\]{}"'「」『』《》<>!?~:]/g, '').toLowerCase()
const coreName = (n) => norm(String(n).replace(/\(.*?\)/g, '').replace(/(본점|[가-힣0-9]+점)$/, ''))
const postKey = (u) => {
  try {
    const x = new URL(String(u).replace(/^http:/, 'https:'))
    const path = /blog\.naver\.com/.test(x.hostname) ? x.pathname.split('/').filter(Boolean).slice(0, 2).join('/') : x.pathname
    return `${x.hostname.replace(/^m\./, '')}/${path.replace(/\/$/, '')}`
  } catch { return String(u) }
}
const BAD_IMG = /sticker|emoticon|emoji|line\.me|storep|logo|banner|icon|clipart|dthumb-phinf/i

// blocked: 직접 눈으로 보고 걸러 낸 사진 주소 조각(이 글자가 들어 있으면 쓰지 않아요)
async function verifiedPhoto({ headers, name, area = '', addr = '', blocked = [] }) {
  const core = coreName(name)
  if (core.length < 2) return null
  const tokens = ['제주', '서귀포', ...String(addr).split(/\s+/).filter((t) => /[읍면동리]$/.test(t)).map(norm)].filter(Boolean)
  const q = `${name} ${area}`.trim()
  const blog = await (await fetch(`https://dapi.kakao.com/v2/search/blog?query=${encodeURIComponent(q)}&size=30&sort=accuracy`, { headers })).json()
  const posts = new Map()
  for (const d of blog.documents ?? []) {
    const text = norm(d.title + d.contents)
    if (norm(d.title).includes(core) && tokens.some((t) => text.includes(t))) posts.set(postKey(d.url), d)
  }
  if (!posts.size) return null
  const im = await (await fetch(`https://dapi.kakao.com/v2/search/image?query=${encodeURIComponent(q)}&size=30&sort=accuracy`, { headers })).json()
  const hit = (im.documents ?? []).find((d) => d.width >= 300 && d.height >= 200 && /^https:/.test(d.image_url) && !BAD_IMG.test(d.image_url + d.doc_url) && !blocked.some((b) => d.image_url.includes(b)) && posts.has(postKey(d.doc_url)))
  return hit ? { img: hit.image_url, thumb: hit.thumbnail_url, doc: hit.doc_url, post: norm(posts.get(postKey(hit.doc_url)).title).slice(0, 30) } : null
}
module.exports = { verifiedPhoto, norm }
