import { useState } from 'react'
import { fetchFlights } from '../api/client'
import { AIRLINE_LOGO } from '../data/airlines'
import { useAsync } from '../hooks/useAsync'
import { ApiError, Empty, Loading } from './Status'

// 항공사 공식 마크 (없거나 불러오지 못하면 이름 첫 글자)
function AirlineMark({ name }) {
  const [broken, setBroken] = useState(false)
  const src = AIRLINE_LOGO[name]
  if (!src || broken) return <span className="amark amark-fallback" aria-hidden="true">{String(name ?? '?').charAt(0)}</span>
  return <img className="amark" src={src} alt="" width="20" height="20" loading="lazy" onError={() => setBroken(true)} />
}

// 제주공항 항공편 보드: 출발/도착 탭 + 가격 비교 링크 + 지연·결항 표시. 항공편 화면과 생활정보 > 항공편이 함께 써요.
export default function FlightBoard() {
  const [dir, setDir] = useState('depart')
  const [only, setOnly] = useState(false)
  const st = useAsync(() => fetchFlights(dir), [dir])
  const rows = (st.data ?? []).filter((f) => !only || f.cancel || f.delay)
  const delayed = (st.data ?? []).filter((f) => f.delay).length
  const cancelled = (st.data ?? []).filter((f) => f.cancel).length
  return (
    <>
      <div className="tabs">
        <button type="button" className={dir === 'depart' ? 'on' : ''} onClick={() => setDir('depart')}><i className="bi bi-airplane-engines" /> 출발</button>
        <button type="button" className={dir === 'arrival' ? 'on' : ''} onClick={() => setDir('arrival')}><i className="bi bi-airplane" /> 도착</button>
      </div>
      {st.loading && <Loading />}
      {st.error && <ApiError error={st.error} />}
      {st.data && (
        <section className="kit-block">
          <div className="fare-box">
            <b>✈️ 항공권 가격 비교</b>
            <span className="muted small">항공권 가격은 날짜·항공사·예매 시점마다 달라서, 아래에서 직접 비교해 보세요.</span>
            <span className="fare-links">
              <a href="https://www.skyscanner.co.kr" target="_blank" rel="noreferrer">스카이스캐너 ↗</a>
              <a href="https://air.webtour.com" target="_blank" rel="noreferrer">웹투어 ↗</a>
              <a href="https://flight.naver.com" target="_blank" rel="noreferrer">네이버 항공권 ↗</a>
            </span>
          </div>
          <div className="block-head">
            <h2>오늘 {dir === 'depart' ? '출발' : '도착'} {st.data.length}편 <small className="muted">지연 {delayed} · 결항 {cancelled}</small></h2>
            <label className="small"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> 지연·결항만</label>
          </div>
          {rows.length === 0 ? <Empty text="해당하는 항공편이 없어요." /> : (
            <div className="flights">
              {rows.map((f, i) => (
                <div key={`${f.no}-${f.plan}-${i}`} className={`flight${f.cancel ? ' cancel' : f.delay ? ' late' : ''}`}>
                  <strong className="ft">{f.plan}</strong>
                  <div className="fm"><b>{f.place}</b><span className="fa"><AirlineMark name={f.airline} />{f.airline}</span><span className="fno">{f.no}</span><span className="fg">{f.gate ? `게이트 ${f.gate}` : '게이트 미정'}</span></div>
                  <span className="fs">{f.status || '-'}{f.late >= 15 && !f.cancel ? ` (+${f.late}분)` : ''}{f.real && f.real !== f.plan && !f.cancel ? <small className="muted"> {f.real}</small> : null}</span>
                </div>
              ))}
            </div>
          )}
          <p className="notice"><i className="bi bi-info-circle" />출처: 한국공항공사 실시간 운항정보. 탑승 전에는 항공사 안내를 꼭 다시 확인하세요.</p>
        </section>
      )}
    </>
  )
}
