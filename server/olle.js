// 제주올레 코스 현황 (data.go.kr 15043496 · 최신 20260731 버전) — 거리·소요시간·시종점
import { dataKey, fetchJson, KeyError } from './http.js'

const URL_BASE = 'https://api.odcloud.kr/api/15043496/v1/uddi:5e0b77df-759d-4378-a74f-bd393051521b'
let cache = null // 코스 정보는 거의 안 바뀌므로 하루 보관

// 열 이름이 조금 달라도 찾을 수 있게 정규식으로 고릅니다
const pick = (row, re) => {
  const k = Object.keys(row).find((x) => re.test(x))
  return k == null ? '' : String(row[k] ?? '').trim()
}

export async function getOlle() {
  if (cache && Date.now() - cache.at < 24 * 3600e3) return cache.data
  const url = `${URL_BASE}?page=1&perPage=100&returnType=JSON&serviceKey=${encodeURIComponent(dataKey())}`
  const json = await fetchJson(url, '올레코스현황')
  if (json?.code && json.code < 0) throw new KeyError(`올레코스현황: ${json.msg ?? json.code}`)
  const rows = json?.data ?? []
  const data = rows.map((r) => {
    const group = pick(r, /코스별|구분/)
    const name = pick(r, /코스명/)
    const m = `${name} ${group}`.match(/(\d+(?:-\d+)?)\s*(?:코스|-?$)/) ?? `${name} ${group}`.match(/(\d+(?:-\d+)?)/)
    return {
      no: m ? m[1] : '',
      group,
      name,
      km: pick(r, /거리/),
      time: pick(r, /소요/),
      ends: pick(r, /시종점|시점|종점/),
      date: pick(r, /기준일/),
    }
  })
  cache = { at: Date.now(), data }
  return data
}
