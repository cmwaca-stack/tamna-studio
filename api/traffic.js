import { trafficCctv } from '../server/traffic.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    res.status(200).json(await trafficCctv({ road: req.query.road === 'ex' ? 'ex' : 'its', debug: req.query.debug === '1' }))
  } catch (e) {
    res.status(500).json({ error: e.message, keyProblem: !!e.keyProblem })
  }
}
