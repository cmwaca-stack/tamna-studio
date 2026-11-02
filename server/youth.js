// 온통청년 청년정책 (youthcenter.go.kr 오픈API, XML) — 키는 YOUTH_API_KEY (data.go.kr 키와 다릅니다)
import { XMLParser } from 'fast-xml-parser'
import { KeyError, toList } from './http.js'

const parser = new XMLParser({ parseTagValue: false })
const URL_BASE = 'https://www.youthcenter.go.kr/opi/youthPlcyList.do'
const cache = new Map() // 검색어별 30분 보관
const unesc = (t = '') => String(t).replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#xD;', ' ')

export async function getYouthPolicy({ query = '제주', page = 1, rows = 20 } = {}) {
  const key = process.env.YOUTH_API_KEY?.trim()
  if (!key) throw new KeyError('YOUTH_API_KEY 가 없어요 (온통청년 마이페이지 → OPEN API 에서 받은 키를 .env.local 에 넣으세요)')
  const ck = `${query}|${page}|${rows}`
  const hit = cache.get(ck)
  if (hit && Date.now() - hit.at < 30 * 60e3) return hit.data
  const qs = new URLSearchParams({ openApiVlak: key, pageIndex: String(page), display: String(rows), query })
  const res = await fetch(`${URL_BASE}?${qs}`)
  const text = await res.text()
  const xml = parser.parse(text)
  const root = xml?.youthPolicyList ?? xml?.result ?? xml
  const err = root?.errMsg ?? root?.message ?? xml?.error?.message
  if (!root?.youthPolicy && err) throw new KeyError(`온통청년: ${String(err).slice(0, 120)}`)
  if (!root) throw new Error(`온통청년 응답 이상: ${text.slice(0, 160)}`)
  const data = toList(root.youthPolicy).map((p) => ({
    id: String(p.bizId ?? p.polyBizSjnm),
    title: unesc(p.polyBizSjnm),
    desc: unesc(p.polyItcnCn),
    support: unesc(p.sporCn),
    age: unesc(p.ageInfo),
    period: unesc(p.rqutPrdCn),
    how: unesc(p.rqutProcCn),
    org: unesc(p.cnsgNmor),
    url: p.rqutUrla ?? p.rfcSiteUrla1 ?? '',
  })).filter((p) => p.title)
  cache.set(ck, { at: Date.now(), data })
  return data
}
