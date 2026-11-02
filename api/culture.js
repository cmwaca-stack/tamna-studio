import { getCulture } from '../server/culture.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.status(200).json(await getCulture())
  } catch (e) {
    res.status(500).json({ error: e.message, keyProblem: !!e.keyProblem })
  }
}
