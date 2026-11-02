import { getYouthPolicy } from '../server/youth.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.status(200).json(await getYouthPolicy({ query: req.query.q || '제주', page: Number(req.query.page) || 1 }))
  } catch (e) {
    res.status(500).json({ error: e.message, keyProblem: !!e.keyProblem })
  }
}
