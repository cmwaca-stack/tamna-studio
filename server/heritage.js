// 공공 API ③ 국가유산청 국가유산 검색 (키 불필요, XML 응답)
// keyword 에 '|' 로 여러 검색어를 주면 각각 조회해서 합칩니다 (중복 제거)
import { XMLParser } from 'fast-xml-parser'
import { toList } from './http.js'

const parser = new XMLParser()

async function one(keyword, rows) {
  const params = new URLSearchParams({ ccbaCtcd: '50', pageUnit: String(rows), pageIndex: '1' }) // 50 = 제주
  if (keyword) params.set('ccbaMnm1', keyword)
  const res = await fetch(`https://www.khs.go.kr/cha/SearchKindOpenapiList.do?${params}`)
  const data = parser.parse(await res.text())
  return toList(data?.result?.item).map((h) => ({
    id: String(h.ccbaCpno ?? h.ccbaMnm1), name: h.ccbaMnm1, kind: h.ccmaName, city: h.ccsiName,
    lat: h.latitude, lng: h.longitude,
  }))
}

export async function searchHeritage({ keyword = '', rows = 12 } = {}) {
  const words = String(keyword).split('|').map((w) => w.trim()).filter(Boolean)
  if (words.length <= 1) return one(words[0] ?? '', rows)
  const lists = (await Promise.allSettled(words.map((w) => one(w, Math.max(4, Math.ceil(rows / 2)))))).map((r) => (r.status === 'fulfilled' ? r.value : []))
  const seen = new Set()
  return lists.flat().filter((h) => !seen.has(h.id) && seen.add(h.id)).slice(0, rows * 2)
}
