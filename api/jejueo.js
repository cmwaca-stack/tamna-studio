import { jejueo } from '../server/jejueo.js'

export default async function handler(req, res) {
  try {
    const { kind = 'dialect', page = '1', q = '', type = '' } = req.query
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
    res.status(200).json(await jejueo({ kind, page: Math.max(1, Number(page) || 1), pageSize: 20, q, type }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
