// 지금 제주에 기상특보·재난문자가 있는지: 기상청 기상특보 조회서비스 + 행정안전부 재난문자 (둘 다 data.go.kr, 같은 키)
// 두 서비스는 각각 활용신청이 필요해서, 하나가 안 되어도 다른 하나는 보여 주도록 따로 결과를 돌려줘요.
import { dataKey, fetchJson, toList } from './http.js'

const kst = (d) => new Date(d.getTime() + 9 * 3600e3)
const ymd = (d) => kst(d).toISOString().slice(0, 10).replaceAll('-', '')
const WARN_URL = 'https://apis.data.go.kr/1360000/WthrWrnInfoService/getWthrWrnList'
const MSG_URLS = [ // 최신 버전부터, 안 되면 이전 버전
  'https://apis.data.go.kr/1741000/DisasterMsg4/getDisasterMsg1List',
  'https://apis.data.go.kr/1741000/DisasterMsg3/getDisasterMsg1List',
]

// 응답 모양이 서비스마다 조금 달라서, 안쪽의 "객체 배열"을 찾아 줘요
function findRows(node, test) {
  if (Array.isArray(node)) {
    if (node.length && node.every((x) => x && typeof x === 'object') && node.some(test)) return node.filter(test)
    for (const x of node) { const r = findRows(x, test); if (r) return r }
  } else if (node && typeof node === 'object') {
    for (const v of Object.values(node)) { const r = findRows(v, test); if (r) return r }
  }
  return null
}
const fmtTmFc = (v) => { const s = String(v); return s.length >= 12 ? `${s.slice(4, 6)}월 ${s.slice(6, 8)}일 ${s.slice(8, 10)}:${s.slice(10, 12)}` : s }
const wrap = async (fn) => { try { return { ok: true, items: await fn() } } catch (e) { return { ok: false, error: e.message, keyProblem: !!e.keyProblem } } }

async function warnings() {
  const now = new Date()
  const url = `${WARN_URL}?serviceKey=${encodeURIComponent(dataKey())}&pageNo=1&numOfRows=30&dataType=JSON&stnId=184&fromTmFc=${ymd(new Date(now.getTime() - 24 * 3600e3))}&toTmFc=${ymd(now)}`
  const json = await fetchJson(url, '기상특보')
  const code = json?.response?.header?.resultCode
  if (code === '03') return [] // NO_DATA: 해당 기간 특보 없음
  if (code && code !== '00') throw new Error(`기상특보: ${json.response.header.resultMsg ?? code}`)
  return toList(json?.response?.body?.items?.item).map((r) => ({ title: String(r.title ?? '').trim(), time: fmtTmFc(r.tmFc), at: String(r.tmFc ?? '') })).filter((r) => r.title)
}

async function messages() {
  let lastError
  for (const base of MSG_URLS) {
    try {
      const url = `${base}?serviceKey=${encodeURIComponent(dataKey())}&pageNo=1&numOfRows=100&type=json&returnType=json`
      const json = await fetchJson(url, '재난문자')
      const rows = findRows(json, (x) => x && typeof x === 'object' && 'msg' in x) ?? []
      const since = ymd(new Date(Date.now() - 48 * 3600e3))
      return rows
        .filter((r) => String(r.location_name ?? r.region_name ?? '').includes('제주'))
        .map((r) => ({ time: String(r.create_date ?? ''), where: String(r.location_name ?? r.region_name ?? ''), msg: String(r.msg ?? '').trim() }))
        .filter((r) => r.msg && r.time.replace(/\D/g, '').slice(0, 8) >= since)
        .slice(0, 10)
    } catch (e) { lastError = e }
  }
  throw lastError
}

export async function getAlerts() {
  const [w, m] = await Promise.all([wrap(warnings), wrap(messages)])
  return { warnings: w, messages: m }
}
