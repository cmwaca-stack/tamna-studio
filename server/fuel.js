// 제주 기름값 — 한국석유공사 오피넷(opinet.co.kr)의 "주유소 평균판매가격"(지역별 일간)과 "자동차충전소 평균판매가격"(LPG, 전국) 표를 가져와요.
// 오피넷은 하루 한 번(전날 기준) 평균가를 올려요. 제주 추자도·우도는 표본에 포함되지 않아요.
const BASE = 'https://www.opinet.co.kr'
let cache = null // 30분 보관

const text = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, { headers: { 'User-Agent': 'Mozilla/5.0 (TamnaStudio)' }, signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`오피넷 응답 오류 (${res.status})`)
  return res.text()
}

export async function getFuel() {
  if (cache && Date.now() - cache.at < 30 * 60e3) return cache.data
  const [areaHtml, lpgHtml] = await Promise.all([get('/user/dopospdrg/dopOsPdrgAreaView.do'), get('/user/dopvsavsel/dopVsAvselSelect.do').catch(() => '')])
  const out = { date: '', jeju: null, lpg: null }

  // 지역별 표: 구분 | 고급휘발유 | 보통휘발유 | 자동차용경유 | 실내등유
  for (const tr of areaHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? []) {
    const cells = (tr.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/g) ?? []).map(text)
    if (cells[0] === '제주' && cells.length >= 4) {
      const n = (v) => Number(String(v).replace(/,/g, ''))
      out.jeju = { premium: n(cells[1]), gasoline: n(cells[2]), diesel: n(cells[3]), kerosene: cells[4] ? n(cells[4]) : null }
      break
    }
  }
  const areaText = text(areaHtml)
  const d = areaText.match(/조회\s+(\d{4})년 (\d{1,2})월 (\d{1,2})일/)
  out.date = d ? `${d[1]}-${d[2].padStart(2, '0')}-${d[3].padStart(2, '0')}` : '' // 오피넷이 보여 주는 기준일

  // LPG(자동차부탄): 전국 평균 한 줄 + 전일대비
  const lpgText = text(lpgHtml)
  const lpg = lpgText.match(/자동차부탄 \(원\/ℓ\)\s+\S+\s+([\d.]+)\s+\S+\s+([\d.]+)\s+전일대비\s+(-?[\d.]+)/)
  if (lpg) out.lpg = { price: Number(lpg[2]), change: Number(lpg[3]) }

  if (!out.jeju && !out.lpg) throw new Error('오피넷에서 기름값을 읽지 못했어요 (표 모양이 바뀌었을 수 있어요)')
  cache = { at: Date.now(), data: out }
  return out
}
