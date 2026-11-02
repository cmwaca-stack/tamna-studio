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

async function searchOne({ keyword = '', contentTypeId = '12', rows = 12 } = {}) {
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

// 검색어를 "횟집|물회|전복" 처럼 | 로 이으면 각각 찾아서 중복 없이 합쳐 줍니다 (가게 이름에 한 단어만 들어가도 놓치지 않도록)
export async function searchTour({ keyword = '', contentTypeId = '12', rows = 12 } = {}) {
  const words = String(keyword).split('|').map((w) => w.trim()).filter(Boolean)
  if (words.length <= 1) return searchOne({ keyword: words[0] ?? '', contentTypeId, rows })
  const per = Math.min(rows, 30)
  const lists = await Promise.all(words.map((w) => searchOne({ keyword: w, contentTypeId, rows: per }).catch((e) => { if (e.keyProblem) throw e; return [] })))
  const seen = new Set()
  const merged = []
  // 검색어별로 번갈아 담아서 한 종류만 위쪽을 차지하지 않게 함
  for (let k = 0; merged.length < rows; k++) {
    let any = false
    for (const l of lists) {
      if (k < l.length) {
        any = true
        if (!seen.has(l[k].id)) { seen.add(l[k].id); merged.push(l[k]) }
      }
    }
    if (!any) break
  }
  return merged.slice(0, rows)
}
