// 온통청년 청년정책 (youthcenter.go.kr 신규 오픈API, JSON) — 키는 YOUTH_API_KEY (data.go.kr 키와 다릅니다)
import { KeyError, toList } from './http.js'

const URL_BASE = 'https://www.youthcenter.go.kr/go/ythip/getPlcy'
const cache = new Map() // 30분 보관
const s = (v) => (v == null ? '' : String(v).replace(/\r/g, '').trim())

// 지자체(광역·기초) 이름으로 시작하면 "그 지역 정책", 아니면 중앙부처·전국 기관 정책입니다.
// (전남광주통합특별시처럼 새 이름이 생겨도 잡히도록 시·도 이름 뒤에 무엇이 붙어도 허용)
const REGION = /^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충청|충북|충남|전라|전북|전남|경상|경북|경남|제주|서귀포)/
const JEJU_ORG = /^(제주|서귀포)/
const JEJU_ZIP = /^50\d{3}$/ // 제주 시군구 코드는 50 으로 시작 (제주시 50110, 서귀포시 50130)

// 정책을 올린 기관 이름: 주관기관 → 등록기관 → 등록 상위기관 순으로 확인
const orgOf = (p) => s(p.sprvsnInstCdNm) || s(p.rgtrInstCdNm) || s(p.rgtrHghrkInstCdNm) || s(p.operInstCdNm)

// 'jeju'(제주 지역 정책) | 'all'(전국 공통: 중앙부처·전국 기관 정책)
// 이 API 는 지역코드(zipCd) 칸에 "전국 코드 전체"를 적어 둔 타 지역 정책도 섞어 주기 때문에,
// 지역코드가 아니라 정책을 올린 기관 이름으로 제주/타지역/전국을 나눕니다.
export function classify(p) {
  const org = orgOf(p)
  const zips = s(p.zipCd).split(',').map((z) => z.trim()).filter(Boolean)
  if (JEJU_ORG.test(org) || (zips.length > 0 && zips.every((z) => JEJU_ZIP.test(z)))) return 'jeju'
  if (REGION.test(org)) return 'other' // 다른 지역 정책 → 어느 탭에도 보여주지 않음
  return 'all'
}

async function page(key, n) {
  // zipCd 로 "제주 청년이 받을 수 있는 정책"만 요청 (제주 + 전국 코드를 적은 정책이 함께 옵니다)
  const qs = new URLSearchParams({ apiKeyNm: key, pageNum: String(n), pageSize: '100', rtnType: 'json', zipCd: '50110,50130' })
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
  return { list: toList(j.result?.youthPolicyList), total: Number(j.result?.pagging?.totCount) || 0 }
}

async function fetchAll(key) {
  const hit = cache.get('all-pages')
  if (hit && Date.now() - hit.at < 30 * 60e3) return hit.list
  const first = await page(key, 1)
  const pages = Math.min(Math.ceil(first.total / 100) || 1, 15)
  const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => page(key, i + 2)))
  const list = [first, ...rest].flatMap((r) => r.list)
  cache.set('all-pages', { at: Date.now(), list })
  return list
}

export async function getYouthPolicy({ scope = 'jeju', debug = false } = {}) {
  const key = process.env.YOUTH_API_KEY?.trim()
  if (!key) throw new KeyError('YOUTH_API_KEY 가 없어요 (.env.local 또는 Vercel 환경변수 확인)')
  const all = await fetchAll(key)
  const items = all.filter((p) => classify(p) === scope)

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
    org: orgOf(p),
    url: s(p.aplyUrlAddr) || s(p.refUrlAddr1) || '',
  })).filter((p) => p.title)
  if (debug) {
    const counts = { jeju: 0, all: 0, other: 0 }
    all.forEach((p) => { counts[classify(p)]++ })
    return { fetched: all.length, counts, first: data[0] ?? null }
  }
  return data
}
