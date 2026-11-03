import { nearTour, searchTour } from '../server/tour.js'

export default async function handler(req, res) {
  try {
    const { keyword = '', type = '12', rows = '12', lat, lng, radius, arrange = '' } = req.query
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    // ?lat=&lng= 가 있으면 그 좌표 주변(가까운 순)을 찾아요
    if (lat && lng) {
      res.status(200).json(await nearTour({ lat: Number(lat), lng: Number(lng), radius: Math.min(Number(radius) || 5000, 20000), contentTypeId: type, rows: Math.min(Number(rows) || 8, 30) }))
      return
    }
    res.status(200).json(await searchTour({ keyword, contentTypeId: type, rows: Math.min(Number(rows) || 12, 500), arrange: /^[ACDOQR]$/.test(arrange) ? arrange : '' }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
