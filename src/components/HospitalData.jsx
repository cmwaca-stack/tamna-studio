import { useState } from 'react'
import { ApiError, Empty, Loading } from './Status'
import { fetchHospitalData } from '../api/client'
import { useAsync } from '../hooks/useAsync'

const mapUrl = (name) => `https://map.kakao.com/?q=${encodeURIComponent(`제주 ${name}`)}`
const telHref = (tel) => `tel:${tel.replace(/[^0-9+]/g, '')}`
const fmt = (n) => n.toLocaleString('ko-KR')
const KIND_ICON = { 권역응급의료센터: '🚑', 지역응급의료센터: '🏥', 지역응급의료기관: '🏥', 달빛어린이병원: '🌙' }
const STAT_ICON = { 종합병원: '🏥', 병원: '🏨', 요양병원: '🛏️', 정신병원: '🧠', 한방병원: '🌿', 치과병원: '🦷', 의원: '🩺', 치과의원: '🦷', 한의원: '🌿', 조산원: '👶' }

function Dated({ date }) {
  return date ? <small className="muted"> · {date} 기준</small> : null
}

// ① 응급실이 있는 병원 (응급의료기관 현황)
function Emergency() {
  const list = useAsync(() => fetchHospitalData('emergency'), [])
  const [kind, setKind] = useState('전체')
  const all = list.data ?? []
  const kinds = ['전체', ...new Set(all.map((h) => h.kind).filter(Boolean))]
  const rows = all.filter((h) => kind === '전체' || h.kind === kind)
  return (
    <section className="kit-block emergency">
      <h2>🚑 응급실이 있는 병원 <Dated date={all[0]?.date} /></h2>
      <p className="notice"><i className="bi bi-exclamation-triangle" />생명이 위급하면 병원을 고르지 말고 <b>119</b>에 바로 전화하세요. 가기 전에 전화로 진료 가능한지 확인하면 더 안전해요.</p>
      {list.loading ? <Loading /> : list.error ? <ApiError error={list.error} onRetry={list.reload} /> : !all.length ? <Empty text="응급의료기관 정보를 찾지 못했어요." /> : (
        <>
          <div className="chips">
            {kinds.map((k) => <button key={k} type="button" className={`chip${kind === k ? ' on' : ''}`} onClick={() => setKind(k)}>{k}</button>)}
          </div>
          <div className="hosp-grid">
            {rows.map((h) => (
              <article key={h.name} className="hosp-card">
                <span className="hosp-icon" aria-hidden="true">{KIND_ICON[h.kind] ?? '🏥'}</span>
                <div className="hosp-body">
                  <span className="tag">{h.kind}</span>
                  <h3>{h.name}</h3>
                  <p className="muted">{h.addr}</p>
                  <div className="hosp-actions">
                    {h.tel && <a className="btn btn-primary btn-sm" href={telHref(h.tel)}><i className="bi bi-telephone-fill" />{h.tel}</a>}
                    <a className="btn btn-ghost btn-sm" href={mapUrl(h.name)} target="_blank" rel="noreferrer">📍 다음지도</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

// ② 공공의료기관 (제주의료원·서귀포의료원)
function PublicHospitals() {
  const list = useAsync(() => fetchHospitalData('public'), [])
  const all = list.data ?? []
  return (
    <section className="kit-block emergency">
      <h2>🏛️ 공공의료기관 <Dated date={all[0]?.date} /></h2>
      {list.loading ? <Loading /> : list.error ? <ApiError error={list.error} onRetry={list.reload} /> : !all.length ? <Empty text="공공의료기관 정보를 찾지 못했어요." /> : (
        <div className="hosp-grid">
          {all.map((h) => (
            <article key={h.name} className="hosp-card wide">
              <span className="hosp-icon" aria-hidden="true">🏛️</span>
              <div className="hosp-body">
                <h3>{h.name}</h3>
                <p className="muted">{h.addr}</p>
                <p className="hosp-stats">
                  {h.beds > 0 && <span>🛏️ 병상 {fmt(h.beds)}개</span>}
                  {h.doctors > 0 && <span>👩‍⚕️ 의사 {fmt(h.doctors)}명</span>}
                  {h.nurses > 0 && <span>💉 간호 {fmt(h.nurses)}명</span>}
                </p>
                {h.depts && <p><b>진료과</b> {h.depts}</p>}
                {h.detail && (
                  <details>
                    <summary>진료과 자세히 보기</summary>
                    <p className="muted">{h.detail.replace(/\+/g, ' · ')}</p>
                  </details>
                )}
                <div className="hosp-actions">
                  {h.tel && <a className="btn btn-primary btn-sm" href={telHref(h.tel)}><i className="bi bi-telephone-fill" />{h.tel}</a>}
                  <a className="btn btn-ghost btn-sm" href={mapUrl(h.name)} target="_blank" rel="noreferrer">📍 다음지도</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

// ③ 제주에는 병원이 얼마나 있을까? (의료기관 개소 현황: 종류별 개소수·병상수)
function Stats() {
  const list = useAsync(() => fetchHospitalData('stats'), [])
  const all = list.data ?? []
  const total = all.reduce((n, s) => n + s.count, 0)
  const beds = all.reduce((n, s) => n + s.beds, 0)
  return (
    <section className="kit-block emergency">
      <h2>📊 제주 의료기관 한눈에 <Dated date={all[0]?.date} /></h2>
      {list.loading ? <Loading /> : list.error ? <ApiError error={list.error} onRetry={list.reload} /> : !all.length ? <Empty text="의료기관 현황을 찾지 못했어요." /> : (
        <>
          <p className="stats-total">제주에는 의료기관이 모두 <b>{fmt(total)}곳</b>, 병상은 <b>{fmt(beds)}개</b> 있어요.</p>
          <div className="stats-grid">
            {all.map((s) => (
              <div key={s.group + s.kind} className="stat">
                <span className="stat-icon" aria-hidden="true">{STAT_ICON[s.kind] ?? '🏥'}</span>
                <b>{s.kind}</b>
                <span className="stat-num">{fmt(s.count)}곳</span>
                <small className="muted">{s.beds > 0 ? `병상 ${fmt(s.beds)}개` : '병상 없음'} · {s.group}</small>
              </div>
            ))}
          </div>
          <p className="muted small">종류별 개수 통계예요. 가까운 병원은 아래 "진료과로 찾기(다음지도)"에서 찾아보세요.</p>
        </>
      )}
    </section>
  )
}

export default function HospitalData() {
  return (
    <>
      <Emergency />
      <PublicHospitals />
      <Stats />
    </>
  )
}
