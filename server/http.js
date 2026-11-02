// 공공 API 호출 공통 도구 (화면용 /api 와 에이전트 도구가 함께 씁니다)
export const toList = (item) => (!item ? [] : Array.isArray(item) ? item : [item])

// 키 문제(없음·미승인·권한 없음)는 다른 오류와 구분해서 화면이 "설정 안내"를 보여줄 수 있게 합니다
export class KeyError extends Error {
  keyProblem = true
}

// 흔히 쓰는 다른 변수 이름도 받아 줍니다 (정확한 이름은 DATA_GO_KR_KEY)
const KEY_NAMES = ['DATA_GO_KR_KEY', 'DATA_GO_KR_SERVICE_KEY', 'DATA_GO_KR_API_KEY', 'SERVICE_KEY', 'TOUR_API_KEY', 'TOURAPI_KEY', 'PUBLIC_DATA_KEY', 'DATA_KEY']

export function dataKey() {
  const name = KEY_NAMES.find((n) => process.env[n]?.trim())
  if (name) return process.env[name].trim()
  // 개발 중에만: 서버가 실제로 읽은 "KEY 이름들"(값은 아님)을 알려 줘서 이름 오타를 바로 찾게 합니다
  const seen = process.env.VERCEL ? '' : Object.keys(process.env).filter((k) => /KEY/i.test(k) && !/^(npm_|SSH|GPG|VITE_)/.test(k)).join(', ')
  throw new KeyError(`DATA_GO_KR_KEY 가 없어요 (.env.local 또는 Vercel 환경변수 확인)${seen ? ` — 서버가 읽은 키 이름: ${seen}` : ' — 읽힌 키 이름이 하나도 없어요(.env.local 위치·파일명·서버 재시작 확인)'}`)
}

// 공공데이터포털은 키 문제를 XML 로 돌려줍니다 → 원인별 메시지로 바꿔 준다
function explainXml(text) {
  if (/SERVICE_KEY_IS_NOT_REGISTERED_ERROR/.test(text))
    return '키가 등록되지 않았어요 (SERVICE_KEY_IS_NOT_REGISTERED_ERROR) — 활용신청 승인 대기(1~2시간)이거나 Encoding 키를 넣었어요. Decoding 키를 쓰세요'
  if (/SERVICE ACCESS DENIED|SERVICE_ACCESS_DENIED/.test(text))
    return '이 API 의 활용신청이 안 되어 있어요 (SERVICE ACCESS DENIED) — 포털에서 해당 API 를 활용신청하세요'
  if (/LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(text))
    return '오늘 호출 한도를 넘었어요 (LIMITED_NUMBER_OF_SERVICE_REQUESTS) — 내일 다시 시도하세요'
  if (/UNREGISTERED_IP/.test(text)) return '허용되지 않은 IP 예요 (UNREGISTERED_IP)'
  return null
}

export async function fetchJson(url, label) {
  const res = await fetch(url)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    const why = explainXml(text)
    if (why) throw new KeyError(`${label}: ${why}`)
    throw new Error(`${label} 응답이 JSON이 아님: ${text.slice(0, 140)}`)
  }
}
