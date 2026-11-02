import { getOlle } from '../server/olle.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800')
    res.status(200).json(await getOlle())
  } catch (e) {
    res.status(500).json({ error: e.message, keyProblem: !!e.keyProblem })
  }
}
