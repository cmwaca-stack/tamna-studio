import { getFlights } from '../server/flight.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json(await getFlights({ dir: req.query.dir === 'arrival' ? 'arrival' : 'depart', debug: req.query.debug === '1' }))
  } catch (e) {
    res.status(500).json({ error: e.message, keyProblem: !!e.keyProblem })
  }
}
