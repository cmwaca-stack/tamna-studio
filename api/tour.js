import { enrichTourEvents } from '../server/events.js'
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
    const list = await searchTour({ keyword, contentTypeId: type, rows: Math.min(Number(rows) || 12, 500), arrange: /^[ACDOQR]$/.test(arrange) ? arrange : '' })
    // ?detail=1 (전시·문화시설 14, 축제 15): 카드에서 행사 안내 사이트로 가도록 공식 홈페이지 주소를 붙여요
    res.status(200).json(req.query.detail === '1' && (type === '14' || type === '15') ? await enrichTourEvents(list) : list)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
