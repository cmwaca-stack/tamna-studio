import { getHospitalData, HOSPITAL_KINDS } from '../server/hospital.js'
import { getOlle } from '../server/olle.js'
import { getAir } from '../server/air.js'
import { getAlerts } from '../server/alerts.js'
import { getShips } from '../server/ship.js'
import { getKomsa } from '../server/komsa.js'
import { getEvStations, searchPlaces } from '../server/places.js'
import { getVjFood } from '../server/vjfood.js'

// /api/olle            → 제주올레 코스 현황
// /api/olle?kind=food&keyword=해장국 → 비짓제주 음식점 목록 (이름·영업시간)
// /api/olle?kind=air → 에어코리아 제주시·서귀포시 실측값 + 미세먼지 경보 기록
// /api/olle?kind=alerts → 제주 기상특보(기상청) + 재난문자(행정안전부)
// /api/olle?kind=ship → 제주항 여객선 운항 현황 (한국해운조합 제주여객터미널)
// /api/olle?kind=komsa → 가파도·마라도·추자도 등 제주 섬 여객선 운항 현황 (한국해양교통안전공단)
// /api/olle?kind=places&q=주유소&rect=x1,y1,x2,y2 → 생활정보 지도: 카카오 장소 검색 (지도 범위 안)
// /api/olle?kind=emergency|stats|public → 제주 의료기관 공개 자료 3종 (Vercel 무료 플랜의 서버 함수 12개 제한 때문에 한 파일에 합쳤어요)
export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800')
    if (req.query.kind === 'air') {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
      res.status(200).json(await getAir())
      return
    }
    if (req.query.kind === 'alerts') {
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
      res.status(200).json(await getAlerts())
      return
    }
    if (req.query.kind === 'komsa') {
      res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300')
      res.status(200).json(await getKomsa())
      return
    }
    if (req.query.kind === 'ship') {
      res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300')
      res.status(200).json(await getShips())
      return
    }
    if (req.query.kind === 'ev') {
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800')
      res.status(200).json(await getEvStations())
      return
    }
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
