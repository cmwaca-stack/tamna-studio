import { getYouthPolicy } from '../server/youth.js'

// ?scope=jeju|all  (&debug=1 : 응답 필드 이름만 확인)
export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.status(200).json(await getYouthPolicy({ scope: req.query.scope === 'all' ? 'all' : 'jeju', debug: !!req.query.debug }))
  } catch (e) {
    res.status(500).json({ error: e.message, keyProblem: !!e.keyProblem })
  }
}
