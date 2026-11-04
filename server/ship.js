// 제주항 여객선 운항 현황 — 한국해운조합 제주여객터미널 홈페이지(company.haewoon.co.kr)가 첫 화면의 운항표에 쓰는 데이터를 그대로 가져와요.
// (제주↔완도·목포·삼천포·녹동·진도·추자도 등. 우도·가파도·마라도 배는 다른 터미널이라 이 자료에 없어요)
const URL = 'http://company.haewoon.co.kr/CompanySite/getJSONData.aspx'
let cache = null // 3분 보관

export async function getShips() {
  if (cache && Date.now() - cache.at < 3 * 60e3) return cache.data
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (TamnaStudio)' },
    body: new URLSearchParams({ Method: 'MAINDEPARTURE', CompanyID: 'JEJU', Date: '' }),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`제주여객터미널 응답 오류 (${res.status})`)
  let json
  try { json = JSON.parse(await res.text()) } catch { throw new Error('제주여객터미널 응답이 JSON이 아니에요') }
  if (String(json.ErrCode ?? '0') !== '0') throw new Error(`제주여객터미널 오류 코드 ${json.ErrCode}`)
  const rows = Array.isArray(json.item) ? json.item : []
  const data = {
    at: rows[0]?.NOW ?? '', // 자료 기준 시각
    items: rows.map((x) => ({
      dir: x.INOUT === 'IN' ? 'in' : 'out', // in 입항(제주로 옴) · out 출항(제주에서 떠남)
      date: String(x.DATE ?? ''), time: String(x.DISPLAYTIME ?? x.TIME ?? ''),
      from: String(x.FPORT ?? ''), to: String(x.TPORT ?? ''),
      vessel: String(x.VESSEL ?? ''), company: String(x.COMPANY ?? '').replace(/\(주\)/, '').trim(), tel: String(x.TEL ?? ''),
      terminal: String(x.RealPort ?? ''),
      status: String(x.IsCancel ?? ''), ok: x.IsCancel === '정상운항', reason: String(x.CanCelReason ?? '').trim(),
      delay: x.DelayTime && x.DelayTime !== '-' ? String(x.DelayTime) : '',
    })).filter((x) => x.vessel),
  }
  data.items.sort((a, b) => a.time.localeCompare(b.time))
  cache = { at: Date.now(), data }
  return data
}
