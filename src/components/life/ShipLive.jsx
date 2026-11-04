import { useState } from 'react'
import { fetchShips } from '../../api/client'
import { useAsync } from '../../hooks/useAsync'
import { ApiError, Empty, Loading } from '../Status'
import CompanyMark from './CompanyMark'

// 제주항 여객선 오늘 운항표 (한국해운조합 제주여객터미널). 항공편 화면과 같은 모양이에요.
export default function ShipLive() {
  const [dir, setDir] = useState('out')
  const [only, setOnly] = useState(false)
  const st = useAsync(fetchShips, [])
  const all = st.data?.items ?? []
  const list = all.filter((x) => x.dir === dir)
  const rows = list.filter((x) => !only || !x.ok || x.delay)
  const stopped = list.filter((x) => !x.ok).length
  const delayed = list.filter((x) => x.delay).length
  return (
    <>
      <div className="tabs">
        <button type="button" className={dir === 'out' ? 'on' : ''} onClick={() => setDir('out')}><i className="bi bi-box-arrow-right" /> 출항 <small>제주에서 떠나요</small></button>
        <button type="button" className={dir === 'in' ? 'on' : ''} onClick={() => setDir('in')}><i className="bi bi-box-arrow-in-left" /> 입항 <small>제주로 들어와요</small></button>
      </div>
      {st.loading && <Loading />}
      {st.error && <ApiError error={st.error} onRetry={st.reload} />}
      {st.data && (
        <>
          <div className="block-head">
            <h3 className="sub-title">오늘 {dir === 'out' ? '출항' : '입항'} {list.length}편 <small className="muted">결항·휴항 {stopped} · 지연 {delayed}</small></h3>
            <label className="small"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> 지연·결항만</label>
          </div>
          {rows.length === 0 ? <Empty text={only ? '지연·결항된 배가 없어요.' : '오늘 운항표가 없어요.'} /> : (
            <div className="flights">
              {rows.map((x) => (
                <div key={`${x.time}-${x.vessel}-${x.from}-${x.to}`} className={`flight${!x.ok ? ' cancel' : x.delay ? ' late' : ''}`}>
                  <strong className="ft">{x.time}</strong>
                  <div className="fm">
                    <b>{x.from} → {x.to}</b>
                    <span className="fa"><CompanyMark name={x.company} />{x.company}</span>
                    <span className="fno">{x.vessel}</span>
                    {x.terminal && <span className="fg">{x.terminal}</span>}
                  </div>
                  <span className="fs">{x.ok ? '정상운항' : x.status || '결항'}{x.delay ? ` (+${x.delay})` : ''}{x.reason ? <small className="muted"> {x.reason}</small> : null}</span>
                </div>
              ))}
            </div>
          )}
          <p className="muted small">
            제주항(제주여객터미널)에서 떠나고 닿는 배예요 (완도·목포·삼천포·녹동·진도·추자도 등). 우도·가파도·마라도 배는 이 목록에 없어요.
            {st.data.at && ` 자료 기준 ${st.data.at.slice(0, 16)}.`} 바다 날씨에 따라 바뀔 수 있으니 타기 전에 해당 선사에 꼭 확인하세요.
          </p>
        </>
      )}
    </>
  )
}
