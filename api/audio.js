// 제주도청 음성 파일 중계: 브라우저가 직접 열면 막히거나(Referer·http) 재생이 안 될 수 있어 서버가 대신 받아 전달합니다.
// jeju.go.kr 주소만 허용합니다(아무 주소나 열어 주는 프록시가 되지 않게).
export default async function handler(req, res) {
  try {
    const u = new URL(String(req.query.u ?? ''))
    if (u.protocol !== 'https:' || u.hostname !== 'www.jeju.go.kr') {
      return res.status(400).json({ error: 'www.jeju.go.kr 주소만 재생할 수 있어요' })
    }
    const up = await fetch(u, { headers: { Referer: 'https://www.jeju.go.kr/', 'User-Agent': 'Mozilla/5.0 (compatible; JejuStudy/1.0)' } })
    const type = up.headers.get('content-type') ?? ''
    if (!up.ok) return res.status(502).json({ error: `원본 서버가 ${up.status} 로 응답했어요 (${u.pathname})` })
    if (!/audio|mpeg|octet-stream|mp3|wav|ogg/i.test(type) && !(req.query.kind === 'image' && /^image\//i.test(type))) {
      return res.status(502).json({ error: `음성 파일이 아니라 ${type || '알 수 없는 형식'} 이 왔어요 (${u.pathname})` })
    }
    const buf = Buffer.from(await up.arrayBuffer())
    res.setHeader('Content-Type', /octet-stream/i.test(type) ? 'audio/mpeg' : type)
    res.setHeader('Content-Length', String(buf.length))
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
    res.status(200)
    res.end(buf)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
