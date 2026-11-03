// 공공 API ① 한국관광공사 국문 관광정보 서비스 (KorService2)
import { dataKey, fetchJson, KeyError, toList } from './http.js'

const BASE = 'https://apis.data.go.kr/B551011/KorService2'

async function request(op, region, { keyword, contentTypeId, rows, arrange }) {
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
  if (arrange) params.set('arrange', arrange) // A 제목순 · C 수정일순 · D 생성일순 · O/Q/R 은 대표이미지가 있는 곳만 (각각 제목/수정일/생성일순)
  const data = await fetchJson(`${BASE}/${op}?${params}`, 'TourAPI')
  // 하루 호출 한도 초과 등은 { OpenAPI_ServiceResponse } 모양으로 와요 → 빈 결과로 오해하지 않게 오류로 던집니다
  const svc = data?.OpenAPI_ServiceResponse?.cmmMsgHeader
  if (svc) {
    const e = new KeyError(`TourAPI ${op}: ${svc.returnAuthMsg ?? svc.errMsg} (호출 한도)`)
    e.quota = /LIMITED_NUMBER/.test(svc.errMsg ?? '')
    throw e
  }
  const header = data?.response?.header
  if (header && header.resultCode !== '0000') throw new Error(`TourAPI ${header.resultCode}: ${header.resultMsg}`)
  return toList(data?.response?.body?.items?.item)
}

const listCache = new Map() // 같은 목록 요청은 30분 동안 다시 부르지 않아요 (하루 호출 한도 절약)

async function searchOne(args = {}) {
  const { keyword = '', contentTypeId = '12', rows = 12, arrange = '' } = args
  if (keyword) {
    try { return await searchOneRaw(args) } catch (e) {
      if (!e.quota) throw e
      // 키워드 검색의 하루 한도를 넘었으면, 한도에 안 걸리는 전체 목록에서 이름·주소로 직접 걸러요
      const all = await searchOne({ keyword: '', contentTypeId, rows: 500, arrange })
      return all.filter((p) => (p.title + ' ' + (p.addr ?? '')).includes(keyword)).slice(0, rows)
    }
  }
  const key = [contentTypeId, rows, arrange].join('|')
  const hit = listCache.get(key)
  if (hit && Date.now() - hit.at < 30 * 60e3) return hit.list
  const list = await searchOneRaw(args)
  listCache.set(key, { at: Date.now(), list })
  return list
}

async function searchOneRaw({ keyword = '', contentTypeId = '12', rows = 12, arrange = '' } = {}) {
  const op = keyword ? 'searchKeyword2' : 'areaBasedList2'
  const opts = { keyword, contentTypeId, rows, arrange }
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
    lng: p.mapx, lat: p.mapy, type: p.contenttypeid, cat3: p.cat3,
  }))
}

// 검색어를 "횟집|물회|전복" 처럼 | 로 이으면 각각 찾아서 중복 없이 합쳐 줍니다 (가게 이름에 한 단어만 들어가도 놓치지 않도록)
export async function searchTour({ keyword = '', contentTypeId = '12', rows = 12, arrange = '' } = {}) {
  const words = String(keyword).split('|').map((w) => w.trim()).filter(Boolean)
  if (words.length <= 1) return searchOne({ keyword: words[0] ?? '', contentTypeId, rows, arrange })
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

// 좌표 주변 검색 (한국관광공사 locationBasedList2): 가까운 순으로 돌려주고, dist(미터)를 같이 담아요
export async function nearTour({ lat, lng, radius = 5000, contentTypeId = '12', rows = 8 } = {}) {
  const params = new URLSearchParams({
    serviceKey: dataKey(), MobileOS: 'ETC', MobileApp: 'TamnaStudio', _type: 'json',
    numOfRows: String(rows), pageNo: '1', mapX: String(lng), mapY: String(lat), radius: String(radius), arrange: 'E', contentTypeId,
  })
  const data = await fetchJson(`${BASE}/locationBasedList2?${params}`, 'TourAPI')
  const header = data?.response?.header
  if (header && header.resultCode !== '0000') throw new Error(`TourAPI ${header.resultCode}: ${header.resultMsg}`)
  return toList(data?.response?.body?.items?.item).map((p) => ({
    id: p.contentid, title: p.title, addr: p.addr1, image: p.firstimage,
    lng: p.mapx, lat: p.mapy, type: p.contenttypeid, dist: Math.round(Number(p.dist) || 0),
  }))
}
