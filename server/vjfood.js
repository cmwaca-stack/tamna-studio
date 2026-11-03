// 음식점 자료 3종 (모두 data.go.kr 파일데이터 → odcloud, 같은 인증키 DATA_GO_KR_KEY)
//  · vj    제주관광공사 VISIT JEJU 음식점콘텐츠 (15041984, 2884곳: 이름·영업시간·휴게·예약·대표메뉴)
//  · local 제주특별자치도 향토음식업소 지정 현황 (15110846, 51곳: 이름·주소·좌표·대표메뉴)
//  · model 제주특별자치도 모범음식점 현황 (15043694, 420곳: 구분·이름·행정시·주소)
// 제주관광공사_제주관광정보시스템(VISIT JEJU)_음식점콘텐츠 (data.go.kr 15041984, 2884곳) — odcloud API, 같은 인증키 DATA_GO_KR_KEY
// 가게 이름·영업시간·휴게시간·예약·대표메뉴만 들어 있어요 (주소·사진·좌표는 없음)
import { dataKey, fetchJson, KeyError } from './http.js'

const BASE = 'https://api.odcloud.kr/api'
const PATH = {
  vj: '/15041984/v1/uddi:27a98f4a-5fc8-4ba5-922c-9e0838ed5c98',
  local: '/15110846/v1/uddi:4a6f10f0-3251-4baf-8f5a-d44d063ed609',
  model: '/15043694/v1/uddi:33503589-c0d6-44bb-9daa-a03c3d7ce695',
}
const cache = new Map() // 하루 보관 (하루 호출 한도 절약)

async function all(src = 'vj') {
  const hit = cache.get(src)
  if (hit && Date.now() - hit.at < 24 * 3600e3) return hit.rows
  const URL_BASE = BASE + PATH[src]
  let rows = []
  for (let page = 1; page <= 4; page += 1) {
    const json = await fetchJson(`${URL_BASE}?page=${page}&perPage=1000&returnType=JSON&serviceKey=${encodeURIComponent(dataKey())}`, '음식점콘텐츠')
    if (json?.code && json.code < 0) throw new KeyError(`음식점콘텐츠: ${json.msg ?? json.code}`)
    rows = rows.concat(json?.data ?? [])
    if (rows.length >= (json?.totalCount ?? 0)) break
  }
  cache.set(src, { at: Date.now(), rows })
  return rows
}

const t = (v) => (v == null ? '' : String(v).trim())

// keyword: 'a|b|c' — 가게 이름에 하나라도 들어 있으면 보여줘요
export async function getVjFood(keyword = '', src = 'vj') {
  const words = keyword.split('|').map((w) => w.trim()).filter(Boolean)
  const seen = new Set()
  const out = []
  if (src === 'local') {
    return (await all('local')).map((r) => ({
      title: t(r.일반정보), addr: t(r['소재지 도로명주소']) || t(r['소재지 지번주소']), lat: t(r.위도), lng: t(r.경도), menu: t(r['비고 외']),
    })).filter((x) => x.title && (!words.length || words.some((w) => x.title.includes(w) || x.menu.includes(w))))
  }
  if (src === 'model') {
    return (await all('model')).map((r) => ({ title: t(r.업소명), kind: t(r.구분), city: t(r.행정시), addr: t(r['소재지(도로명)']) }))
      .filter((x) => x.title && (!words.length || words.some((w) => x.title.includes(w))))
  }
  for (const r of await all('vj')) {
    const title = t(r.콘텐츠명)
    if (!title || seen.has(title) || (words.length && !words.some((w) => title.includes(w)))) continue
    seen.add(title)
    out.push({
      title,
      open: t(r.평일오픈시간) && t(r.평일클로즈시간) ? `${t(r.평일오픈시간)} ~ ${t(r.평일클로즈시간)}` : '',
      weekend: t(r.주말오픈시간) && t(r.주말클로즈시간) ? `${t(r.주말오픈시간)} ~ ${t(r.주말클로즈시간)}` : '',
      rest: t(r.휴식시작시간) && t(r.휴식종료시간) ? `${t(r.휴식시작시간)} ~ ${t(r.휴식종료시간)}` : '',
      reserve: t(r.예약가능여부),
      menu: t(r.대표메뉴기타),
    })
  }
  return out
}
