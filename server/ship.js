// 제주항 여객선 운항 현황 — 한국해운조합 제주여객터미널 홈페이지(company.haewoon.co.kr)가 첫 화면의 운항표에 쓰는 데이터를 그대로 가져와요.
// (제주↔완도·목포·삼천포·녹동·진도·추자도 등. 우도·가파도·마라도 배는 다른 터미널이라 이 자료에 없어요)
const URL = 'http://company.haewoon.co.kr/CompanySite/getJSONData.aspx'
let cache = null // 3분 보관
const fareCache = new Map() // 항로·날짜별 운임표를 30분 보관

// 제주여객터미널 "운임안내" 조회: 항로(출발지·도착지 코드)와 날짜로 선박별 등급 운임을 줘요.
// 씨월드·한일고속처럼 이 조회에 운임이 없는 선사는 빈 결과가 오고, 화면에서 선사 누리집으로 안내해요.
async function fareRows(from, to, date) {
  const key = `${from}|${to}|${date}`
  const hit = fareCache.get(key)
  if (hit && Date.now() - hit.at < 30 * 60e3) return hit.rows
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (TamnaStudio)' },
    body: new URLSearchParams({ Method: 'DEPARTUREFAREINFO', CompanyID: 'JEJU', Date: date, FPortID: from, TPortID: to }),
    signal: AbortSignal.timeout(15000),
  })
  const json = await res.json().catch(() => ({}))
  const rows = Array.isArray(json.item) ? json.item : []
  fareCache.set(key, { at: Date.now(), rows })
  return rows
}
const won = (v) => Number(String(v ?? '').replace(/\D/g, '')) || 0

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
  // 오늘 운항하는 항로마다 운임표를 가져와 "선박|출발시각"으로 맞춰 붙여요 (대인 요금 중 가장 낮은 등급 기준)
  const pairs = [...new Map(rows.filter((x) => x.FPortID && x.TPortID).map((x) => [`${x.FPortID}|${x.TPortID}|${x.YEARDATE}`, x])).values()]
  const fareMap = new Map()
  await Promise.allSettled(pairs.map(async (x) => {
    for (const f of await fareRows(x.FPortID, x.TPortID, x.YEARDATE)) {
      const adult = won(f.G_Fare00)
      if (!adult) continue
      const k = `${f.Vessel}|${f.Departure}`
      const cur = fareMap.get(k)
      if (!cur || adult < cur.from) fareMap.set(k, { from: adult, cls: String(f.Classes ?? ''), tel: String(f.Tel ?? '') })
    }
  }))
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
      fare: fareMap.get(`${x.VESSEL}|${x.TIME}`) ?? null, // { from: 대인 최저 요금(원), cls: 등급 }
    })).filter((x) => x.vessel),
  }
  data.items.sort((a, b) => a.time.localeCompare(b.time))
  cache = { at: Date.now(), data }
  return data
}
