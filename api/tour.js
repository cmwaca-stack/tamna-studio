import { searchTour } from '../server/tour.js'

export default async function handler(req, res) {
  try {
    const { keyword = '', type = '12', rows = '12' } = req.query
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json(await searchTour({ keyword, contentTypeId: type, rows: Math.min(Number(rows) || 12, 100) }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
