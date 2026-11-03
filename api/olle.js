import { getHospitalData, HOSPITAL_KINDS } from '../server/hospital.js'
import { getOlle } from '../server/olle.js'
import { searchPlaces } from '../server/places.js'
import { getVjFood } from '../server/vjfood.js'

// /api/olle            → 제주올레 코스 현황
// /api/olle?kind=food&keyword=해장국 → 비짓제주 음식점 목록 (이름·영업시간)
// /api/olle?kind=places&q=주유소&rect=x1,y1,x2,y2 → 생활정보 지도: 카카오 장소 검색 (지도 범위 안)
// /api/olle?kind=emergency|stats|public → 제주 의료기관 공개 자료 3종 (Vercel 무료 플랜의 서버 함수 12개 제한 때문에 한 파일에 합쳤어요)
export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800')
    if (req.query.kind === 'places') {
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200')
      res.status(200).json(await searchPlaces({ q: String(req.query.q ?? ''), rect: req.query.rect }))
      return
    }
    if (req.query.kind === 'food') {
      res.status(200).json(await getVjFood(String(req.query.keyword ?? ''), ['local', 'model'].includes(req.query.src) ? req.query.src : 'vj'))
      return
    }
    res.status(200).json(HOSPITAL_KINDS.includes(req.query.kind) ? await getHospitalData(req.query.kind) : await getOlle())
  } catch (e) {
    res.status(500).json({ error: e.message, keyProblem: !!e.keyProblem })
  }
}
