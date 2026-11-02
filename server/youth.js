// 온통청년 청년정책 (youthcenter.go.kr 신규 오픈API, JSON) — 키는 YOUTH_API_KEY (data.go.kr 키와 다릅니다)
import { KeyError, toList } from './http.js'

const URL_BASE = 'https://www.youthcenter.go.kr/go/ythip/getPlcy'
const cache = new Map() // 범위별 30분 보관
const s = (v) => (v == null ? '' : String(v).replace(/\r/g, '').trim())
const JEJU = /(^|,)\s*50\d{3}/ // 제주 시군구 코드는 50 으로 시작 (제주시 50110, 서귀포시 50130)

async function page(key, n, zip) {
  const qs = new URLSearchParams({ apiKeyNm: key, pageNum: String(n), pageSize: '100', rtnType: 'json' })
  if (zip) qs.set('zipCd', zip)
  const res = await fetch(`${URL_BASE}?${qs}`)
  const text = await res.text()
  let j
  try { j = JSON.parse(text) } catch { throw new Error(`온통청년 응답이 JSON이 아님: ${text.slice(0, 120)}`) }
  const code = Number(j.resultCode ?? j.status ?? 200)
  if (code !== 200) {
    const msg = s(j.resultMessage ?? j.message ?? j.error ?? text.slice(0, 100))
    if (/key|인증|권한|승인|등록/i.test(msg) || code === 401 || code === 403) throw new KeyError(`온통청년 키 문제: ${msg}`)
    throw new Error(`온통청년 오류(${code}): ${msg}`)
  }
  return { list: toList(j.result?.youthPolicyList), raw: j }
}

// scope: 'jeju' (제주 지역 정책) | 'all' (전국 대상 — 제주 청년도 신청 가능)
export async function getYouthPolicy({ scope = 'jeju', debug = false } = {}) {
  const key = process.env.YOUTH_API_KEY?.trim()
  if (!key) throw new KeyError('YOUTH_API_KEY 가 없어요 (.env.local 또는 Vercel 환경변수 확인)')
  const ck = scope
  const hit = cache.get(ck)
  if (hit && !debug && Date.now() - hit.at < 30 * 60e3) return hit.data

  let items = []
  let sample = null
  if (scope === 'jeju') {
    // 지역 코드로 직접 요청 → 안 먹히면 앞쪽 몇 쪽을 받아 제주 코드만 걸러냄
    const r = await page(key, 1, '50110,50130')
    sample = r.list[0]
    items = r.list
    if (!items.some((p) => JEJU.test(s(p.zipCd)))) {
      items = []
      for (let n = 1; n <= 8; n++) {
        const q = await page(key, n)
        items.push(...q.list)
        if (q.list.length < 100) break
      }
    }
    items = items.filter((p) => JEJU.test(s(p.zipCd)))
  } else {
    const r = await page(key, 1)
    sample = r.list[0]
    items = r.list.filter((p) => !s(p.zipCd))
  }

  const data = items.map((p) => ({
    id: s(p.plcyNo ?? p.plcyNm),
    title: s(p.plcyNm),
    kind: s(p.lclsfNm),
    kind2: s(p.mclsfNm),
    keywords: s(p.plcyKywdNm),
    desc: s(p.plcyExplnCn),
    support: s(p.plcySprtCn),
    period: s(p.aplyYmd),
    how: s(p.plcyAplyMthdCn),
    ageMin: Number(p.sprtTrgtMinAge) || 0,
    ageMax: Number(p.sprtTrgtMaxAge) || 0,
    org: s(p.sprvsnInstCdNm ?? p.rgtrInstCdNm ?? p.operInstCdNm),
    url: s(p.aplyUrlAddr) || s(p.refUrlAddr1) || '',
  })).filter((p) => p.title)
  if (debug) return { count: data.length, fields: sample ? Object.keys(sample) : [], first: data[0] ?? null }
  cache.set(ck, { at: Date.now(), data })
  return data
}
