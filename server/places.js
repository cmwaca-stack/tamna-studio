// 생활정보 지도: 카카오 로컬 API(키워드 장소 검색)로 지도 범위 안의 장소를 찾아요. 키: KAKAO_REST_KEY (서버 비밀 값)
import { KeyError } from './http.js'

const ALLOWED = new Set(['재활용도움센터', '클린하우스', '주유소', '전기차충전소', 'LPG충전소']) // 아무 검색어나 대신 찾아 주지 않도록
const JEJU = { x1: 126.1, y1: 33.1, x2: 127.0, y2: 33.6 }

export async function searchPlaces({ q, rect }) {
  const key = process.env.KAKAO_REST_KEY?.trim()
  if (!key) throw new KeyError('KAKAO_REST_KEY 가 없어요 (카카오 개발자 사이트의 REST API 키를 서버 환경변수에 넣으세요)')
  if (!ALLOWED.has(q)) throw new Error('지원하지 않는 검색어예요')
  const [x1, y1, x2, y2] = String(rect ?? '').split(',').map(Number)
  const box = [x1, y1, x2, y2].every(Number.isFinite)
    ? [Math.max(JEJU.x1, x1), Math.max(JEJU.y1, y1), Math.min(JEJU.x2, x2), Math.min(JEJU.y2, y2)] // 제주 밖은 잘라요
    : [JEJU.x1, JEJU.y1, JEJU.x2, JEJU.y2]
  const out = []
  for (let page = 1; page <= 3; page += 1) {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&rect=${box.join(',')}&page=${page}&size=15`
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } })
    const json = await res.json().catch(() => null)
    if (!res.ok) throw new Error(`카카오 장소 검색 오류 (${res.status}) ${json?.message ?? ''}`.trim())
    out.push(...(json.documents ?? []).map((d) => ({ id: d.id, name: d.place_name, addr: d.road_address_name || d.address_name, phone: d.phone, url: d.place_url, lat: Number(d.y), lng: Number(d.x) })))
    if (json.meta?.is_end) break
  }
  return out
}
