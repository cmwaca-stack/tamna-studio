import { searchHeritage } from '../server/heritage.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
    res.status(200).json(await searchHeritage({ keyword: req.query.keyword }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
