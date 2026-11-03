import { getHospitalData, HOSPITAL_KINDS } from '../server/hospital.js'
import { getOlle } from '../server/olle.js'

// /api/olle            → 제주올레 코스 현황
// /api/olle?kind=emergency|stats|public → 제주 의료기관 공개 자료 3종 (Vercel 무료 플랜의 서버 함수 12개 제한 때문에 한 파일에 합쳤어요)
export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800')
    res.status(200).json(HOSPITAL_KINDS.includes(req.query.kind) ? await getHospitalData(req.query.kind) : await getOlle())
  } catch (e) {
    res.status(500).json({ error: e.message, keyProblem: !!e.keyProblem })
  }
}
