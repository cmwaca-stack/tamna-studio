import { useState } from 'react'
import { fetchKomsa } from '../../api/client'
import { useAsync } from '../../hooks/useAsync'
import { ApiError, Empty, Loading } from '../Status'
import CompanyMark from './CompanyMark'
import LinkCards from './LinkCards'
import ShipLive from './ShipLive'

// 가파도·마라도 운항표 (한국해양교통안전공단). 상태: 정상 / 비운(운항하지 않음, 사유 표시) · 출항 완료 / 출항 전
function Islands() {
  const [which, setWhich] = useState('가파도')
  const [only, setOnly] = useState(false)
  const st = useAsync(fetchKomsa, [])
  const all = (st.data?.items ?? []).filter((x) => /가파|마라|모슬포|산이수동/.test(x.route))
  const list = all.filter((x) => (which === '가파도' ? /가파/.test(x.route) : /마라/.test(x.route)))
  const rows = list.filter((x) => !only || !x.ok)
  const stopped = list.filter((x) => !x.ok).length
  const bluelay = (x) => x.vessel.startsWith('블루레이') // 운진항 선사(원더풀아이스) 배
  return (
    <>
      <div className="tabs">
        {['가파도', '마라도'].map((k) => <button key={k} type="button" className={which === k ? 'on' : ''} onClick={() => setWhich(k)}><i className="bi bi-tsunami" /> {k}</button>)}
      </div>
      {st.loading && <Loading />}
      {st.error && <ApiError error={st.error} onRetry={st.reload} />}
      {st.data && (
        <>
          <div className="block-head">
            <h3 className="sub-title">오늘 {which} 배 {list.length}편 <small className="muted">운항 안 함 {stopped}</small></h3>
            <label className="small"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> 운항 안 하는 배만</label>
          </div>
          {rows.length === 0 ? <Empty text={only ? '운항하지 않는 배가 없어요.' : '오늘 운항표가 없어요.'} /> : (
            <div className="flights">
              {rows.map((x) => (
                <div key={`${x.time}-${x.vessel}-${x.route}-${x.dir}`} className={`flight${!x.ok ? ' cancel' : ''}`}>
                  <strong className="ft">{x.time}</strong>
                  <div className="fm">
                    <b>{x.from} 출발</b>
                    <span className="fa"><CompanyMark name={bluelay(x) ? '원더풀아이스' : x.vessel} />{x.vessel}</span>
                    <span className="fno">{x.route}</span>
                  </div>
                  <span className="fs">{x.ok ? '정상' : `운항 안 함${x.reason ? ` (${x.reason})` : ''}`}<small className="muted"> {x.state}</small></span>
                </div>
              ))}
            </div>
          )}
          <p className="muted small">한국해양교통안전공단 여객선 운항정보예요.{st.data.at && ` 기준 ${st.data.at}.`} 바다 날씨에 따라 갑자기 바뀔 수 있으니 타기 전에 선사에 꼭 확인하세요. 운진항 문의 064-794-5490.</p>
          <LinkCards items={[{ emoji: '🌾', name: '운진항 실시간 운항정보 (가파도·마라도)', url: 'https://www.wonderfulis.co.kr/boarding_guide/real_time_infomation/', note: '가파도·마라도 정기여객선(블루레이) 실시간 운항·예매 (선사 공식)' }]} />
        </>
      )}
    </>
  )
}

// 우도: 운항 현황을 공개 자료로 가져올 수 없어서 선사 연락처와 공식 안내로 연결해요
function Udo() {
  return (
    <>
      <p className="notice" style={{ display: 'block' }}>🏝️ <b>우도 배는 실시간 운항표를 가져올 수 있는 공개 자료가 없어요.</b> 성산포항 종합여객터미널에서 우도 선사에 전화로 확인하거나 아래 공식 안내를 보세요.</p>
      <div className="links">
        <a href="tel:0647825671" className="link-card"><strong><span className="emo" aria-hidden="true">📞</span>우도해운<i className="bi bi-telephone" /></strong><span className="muted">064-782-5671</span></a>
        <a href="tel:0647842335" className="link-card"><strong><span className="emo" aria-hidden="true">📞</span>우림해운<i className="bi bi-telephone" /></strong><span className="muted">064-784-2335</span></a>
        <a href="tel:0647821989" className="link-card"><strong><span className="emo" aria-hidden="true">📞</span>우도랜드<i className="bi bi-telephone" /></strong><span className="muted">064-782-1989</span></a>
      </div>
      <LinkCards items={[
        { emoji: '⚓', name: '성산포항종합여객터미널 (비짓제주)', url: 'https://visitjeju.net/kr/detail/view?contentsid=CNTS_000000000022377', note: '우도도항선 대합실·선사 안내 (제주관광공사)' },
        { emoji: '🗺️', name: '성산포항종합여객터미널 (네이버 지도)', url: 'https://m.place.naver.com/place/13542618/home', note: '위치·주차장·연락처' },
      ]} />
      <p className="muted small">승선권과 해양도립공원료를 함께 내요. 제주도민은 공원 입장료가 무료이니 신분증을 챙기세요. (비짓제주 안내)</p>
    </>
  )
}

export default function ShipTabs() {
  const [tab, setTab] = useState('jeju')
  return (
    <>
      <div className="seg" role="tablist" aria-label="배편 종류">
        {[['jeju', '🚢 제주항 (육지·추자)'], ['islands', '🌾 가파도·마라도'], ['udo', '🏝️ 우도']].map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === 'jeju' && <ShipLive />}
      {tab === 'islands' && <Islands />}
      {tab === 'udo' && <Udo />}
    </>
  )
}
