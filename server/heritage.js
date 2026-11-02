// 공공 API ③ 국가유산청 국가유산 검색 (키 불필요, XML 응답)
import { XMLParser } from 'fast-xml-parser'
import { toList } from './http.js'

const parser = new XMLParser()

export async function searchHeritage({ keyword = '', rows = 12 } = {}) {
  const params = new URLSearchParams({ ccbaCtcd: '50', pageUnit: String(rows), pageIndex: '1' }) // 50 = 제주
  if (keyword) params.set('ccbaMnm1', keyword)
  const res = await fetch(`https://www.khs.go.kr/cha/SearchKindOpenapiList.do?${params}`)
  const data = parser.parse(await res.text())
  return toList(data?.result?.item).map((h) => ({
    id: String(h.ccbaCpno ?? h.ccbaMnm1), name: h.ccbaMnm1, kind: h.ccmaName, city: h.ccsiName,
    lat: h.latitude, lng: h.longitude,
  }))
}
