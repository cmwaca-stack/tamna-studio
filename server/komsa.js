// 제주 섬 여객선(가파도·마라도·추자도 등) 운항 현황 — 한국해양교통안전공단(KOMSA) "여객선 운항정보 > 운항정보 조회" 표를 가져와요.
// (https://www.komsa.or.kr/prog/pssgCurState/kor/sub03_0202/list.do) 전국 표 중 제주와 관련된 항로만 골라요.
// 우도 도항선은 이 표에 없어서(제주 지사 자료에도 없음) 따로 안내해요.
const URL = 'https://www.komsa.or.kr/prog/pssgCurState/kor/sub03_0202/list.do'
const JEJU_ROUTE = /제주|가파|마라|추자|모슬포|산이수동/
let cache = null // 3분 보관

const text = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()

export async function getKomsa() {
  if (cache && Date.now() - cache.at < 3 * 60e3) return cache.data
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (TamnaStudio)' },
    body: new URLSearchParams({ pageUnit: '1000', pageIndex: '1', pageSize: '10', jbcd: '' }),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`해양교통안전공단 응답 오류 (${res.status})`)
  const html = await res.text()
  const rows = []
  for (const tr of html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? []) {
    const cells = (tr.match(/<td[^>]*>[\s\S]*?<\/td>/g) ?? []).map(text)
    if (cells.length !== 10 || !/^\d{4}$/.test(cells[0])) continue
    const [time, vessel, route, dir, from, , kind, reason, done, license] = cells
    if (!JEJU_ROUTE.test(route)) continue
    rows.push({ time: `${time.slice(0, 2)}:${time.slice(2)}`, vessel, route, dir, from, kind, reason, done: done === '완료', state: done, license, ok: kind !== '비운' })
  }
  if (!rows.length) throw new Error('해양교통안전공단 운항표에서 제주 항로를 찾지 못했어요 (표 모양이 바뀌었을 수 있어요)')
  const at = html.match(/기준시간<\/b>\s*<span>([^<]+)<\/span>/)?.[1]?.trim() ?? ''
  rows.sort((a, b) => a.time.localeCompare(b.time))
  const data = { at, items: rows }
  cache = { at: Date.now(), data }
  return data
}
