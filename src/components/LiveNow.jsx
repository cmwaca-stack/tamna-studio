import { Link } from 'react-router-dom'
import { fetchAir } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { grade, LV, PM10, PM25 } from '../lib/airLevel'

// 홈 메뉴판 맨 위 "지금 제주" 줄: 제주시·서귀포시 대기질을 실측값으로 보여 주고, 생활정보로 바로 가요.
// (날씨·바람은 화면 위쪽 카드가 이미 보여 줘요)
export default function LiveNow() {
  const st = useAsync(fetchAir, [])
  const cities = st.data?.cities ?? []
  const alarm = st.data?.alarm?.active ? st.data.alarm : null
  return (
    <div className="live-now" aria-live="polite">
      <div className="live-head">
        <strong><span className="live-dot" aria-hidden="true" />지금 제주</strong>
        <Link to="/discover/life" className="live-more">생활정보 전체 <i className="bi bi-chevron-right" /></Link>
      </div>
      {st.loading ? <p className="muted small">대기질 불러오는 중…</p> : st.error || !cities.length ? (
        <p className="muted small">대기질을 불러오지 못했어요. <button type="button" className="link-btn" onClick={st.reload}>다시 시도</button></p>
      ) : (
        <div className="live-air">
          {cities.map((r) => {
            const lv = LV[Math.max(grade(r.pm25, PM25) ?? 0, grade(r.pm10, PM10) ?? 0)]
            return <span key={r.name} className={`live-air-item tone-${lv.tone}`}>{r.name} 대기질 <b>{lv.emoji} {lv.text}</b></span>
          })}
        </div>
      )}
      {alarm && <p className="notice" style={{ display: 'block' }}>⚠️ 제주권역 {alarm.item} {alarm.kind} 발령 중이에요. 외출을 줄이고 마스크를 쓰세요.</p>}
    </div>
  )
}
