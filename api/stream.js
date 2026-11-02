// CCTV 영상(HLS) 중계: 영상 서버가 브라우저 직접 접근(CORS·http)을 막아도 볼 수 있게 우리 서버를 거칩니다.
// 허용한 영상 서버 주소만 중계합니다(아무 주소나 열어 주는 프록시가 되지 않도록).
const ALLOWED = 'http://211.114.96.121:1935/'

export default async function handler(req, res) {
  try {
    const p = String(req.query.p ?? '')
    if (!p || p.includes('..') || p.startsWith('/') || p.includes('://')) return res.status(400).json({ error: '잘못된 주소' })
    const target = ALLOWED + p
    const up = await fetch(target, { signal: AbortSignal.timeout(8000) })
    if (!up.ok) return res.status(up.status).json({ error: `영상 서버 응답 ${up.status}` })
    const type = up.headers.get('content-type') || ''
    const isList = /mpegurl/i.test(type) || /\.m3u8(\?|$)/.test(p)
    res.setHeader('Cache-Control', 'no-store')
    if (isList) {
      const dir = p.slice(0, p.lastIndexOf('/') + 1)
      const text = (await up.text()).split('\n').map((line) => {
        const t = line.trim()
        if (!t || t.startsWith('#')) return line
        return `/api/stream?p=${encodeURIComponent(t.startsWith('http') ? t.replace(ALLOWED, '') : dir + t)}`
      }).join('\n')
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      return res.status(200).send(text)
    }
    res.setHeader('Content-Type', type || 'video/mp2t')
    res.status(200).send(Buffer.from(await up.arrayBuffer()))
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
