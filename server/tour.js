// 공공 API ① 한국관광공사 국문 관광정보 서비스 (KorService2)
import { dataKey, fetchJson, toList } from './http.js'

const BASE = 'https://apis.data.go.kr/B551011/KorService2'

async function request(op, region, { keyword, contentTypeId, rows }) {
  const params = new URLSearchParams({
    serviceKey: dataKey(), // ★ Decoding 키
    MobileOS: 'ETC',
    MobileApp: 'TamnaStudio',
    _type: 'json',
    numOfRows: String(rows),
    pageNo: '1',
    ...region,
  })
  if (contentTypeId) params.set('contentTypeId', contentTypeId)
  if (keyword) params.set('keyword', keyword)
  const data = await fetchJson(`${BASE}/${op}?${params}`, 'TourAPI')
  const header = data?.response?.header
  if (header && header.resultCode !== '0000') throw new Error(`TourAPI ${header.resultCode}: ${header.resultMsg}`)
  return toList(data?.response?.body?.items?.item)
}

export async function searchTour({ keyword = '', contentTypeId = '12', rows = 12 } = {}) {
  const op = keyword ? 'searchKeyword2' : 'areaBasedList2'
  const opts = { keyword, contentTypeId, rows }
  // 지역 코드 체계가 바뀐 경우를 대비해, 0건이면 법정동 코드(50 = 제주)로 한 번 더 시도
  // (키 문제는 재시도해도 소용없으니 그대로 알립니다 — 0건으로 숨기지 않음)
  let list = []
  let first
  try { list = await request(op, { areaCode: '39' }, opts) }
  catch (e) { if (e.keyProblem) throw e; first = e }
  if (list.length === 0) {
    try { list = await request(op, { lDongRegnCd: '50' }, opts) }
    catch (e) { throw first ?? e }
  }
  return list.map((p) => ({
    id: p.contentid, title: p.title, addr: p.addr1, image: p.firstimage,
    lng: p.mapx, lat: p.mapy, type: p.contenttypeid,
  }))
}
