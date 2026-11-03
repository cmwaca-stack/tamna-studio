// 제주 의료기관 공개 자료 3종 (공공데이터포털 파일데이터 → odcloud API, 같은 일반 인증키 DATA_GO_KR_KEY)
//  · 제주특별자치도_응급의료기관현황   (15056000, 기준일 2025-12-31)
//  · 제주특별자치도_의료기관개소현황   (15056008, 기준일 2026-03-31)  ← 병원 목록이 아니라 종류별 개소수·병상수 통계
//  · 제주특별자치도_공공의료기관현황   (15056009, 기준일 2025-03-21)
import { dataKey, fetchJson, KeyError } from './http.js'

const BASE = 'https://api.odcloud.kr/api'
const SOURCES = {
  emergency: ['/15056000/v1/uddi:478132f2-6083-4fbe-80c3-ac4d07f2dd84', '응급의료기관현황'],
  stats: ['/15056008/v1/uddi:d26f9b21-34ba-433c-b39f-81f93cfc40d4', '의료기관개소현황'],
  public: ['/15056009/v1/uddi:d812e9df-2ad5-4b59-bb1f-9d5bfa2970d8', '공공의료기관현황'],
}
const cache = new Map() // 자주 안 바뀌는 자료라 하루 보관 (하루 호출 한도 절약)

// 열 이름이 조금 달라도 찾을 수 있게 정규식으로 고릅니다
const pick = (row, re) => {
  const k = Object.keys(row).find((x) => re.test(x))
  return k == null ? '' : String(row[k] ?? '').trim()
}
const num = (row, re) => Number(pick(row, re).replace(/,/g, '')) || 0

async function rows(kind) {
  const hit = cache.get(kind)
  if (hit && Date.now() - hit.at < 24 * 3600e3) return hit.rows
  const [path, label] = SOURCES[kind]
  const url = `${BASE}${path}?page=1&perPage=300&returnType=JSON&serviceKey=${encodeURIComponent(dataKey())}`
  const json = await fetchJson(url, label)
  if (json?.code && json.code < 0) throw new KeyError(`${label}: ${json.msg ?? json.code}`)
  const list = json?.data ?? []
  cache.set(kind, { at: Date.now(), rows: list })
  return list
}

export async function getHospitalData(kind) {
  const list = await rows(kind)
  if (kind === 'emergency') {
    return list.map((r) => ({
      kind: pick(r, /구분/).replace(/\s+/g, ''), // "권역응급 의료센터" → "권역응급의료센터"
      name: pick(r, /의료기관|기관명/),
      addr: pick(r, /소재지|주소/),
      tel: pick(r, /전화/),
      date: pick(r, /기준일/),
    })).filter((h) => h.name)
  }
  if (kind === 'stats') {
    return list.map((r) => ({
      group: pick(r, /^구분$/), kind: pick(r, /상세구분/), count: num(r, /개소/), beds: num(r, /병상/), date: pick(r, /기준일/),
    })).filter((h) => h.kind)
  }
  return list.map((r) => ({
    name: pick(r, /의료기관명|기관명/),
    addr: pick(r, /소재지|주소/),
    tel: pick(r, /연락처|전화/),
    depts: pick(r, /^진료과$/),
    detail: pick(r, /진료과\s*상세/),
    beds: num(r, /병상/),
    doctors: num(r, /의사/),
    nurses: num(r, /간호직/),
    date: pick(r, /기준일/),
  })).filter((h) => h.name)
}

export const HOSPITAL_KINDS = Object.keys(SOURCES)
