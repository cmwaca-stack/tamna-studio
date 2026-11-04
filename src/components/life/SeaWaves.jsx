import { fetchAlerts } from '../../api/client'
import { ApiError, Loading } from '../Status'
import { useAsync } from '../../hooks/useAsync'

// 제주 바다 4방향의 지금 파도 높이 (오픈메테오 해양 예측 모델, 키 없이 사용). 해안 가까이는 값이 다를 수 있어요.
const SEAS = [
  { name: '제주 북쪽 바다', note: '제주항·함덕 쪽', lat: 33.6, lng: 126.55 },
  { name: '제주 남쪽 바다', note: '서귀포·중문 쪽', lat: 33.15, lng: 126.55 },
  { name: '제주 동쪽 바다', note: '성산·우도 쪽', lat: 33.45, lng: 127.0 },
  { name: '제주 서쪽 바다', note: '한림·협재 쪽', lat: 33.4, lng: 126.1 },
]
const LV = [
  { max: 0.5, text: '잔잔해요', tone: 'good', emoji: '😊', tip: '바다 활동하기 좋아요' },
  { max: 1.5, text: '보통이에요', tone: 'ok', emoji: '🙂', tip: '물놀이·낚시는 조심하세요' },
  { max: 2.5, text: '높아요', tone: 'bad', emoji: '🌊', tip: '방파제·갯바위 근처는 위험해요. 배편은 꼭 확인하세요' },
  { max: Infinity, text: '매우 높아요', tone: 'worse', emoji: '🚫', tip: '바닷가에 가지 마세요. 배가 안 뜰 수 있어요' },
]
const levelOf = (h) => LV.find((l) => h <= l.max)

async function load() {
  const q = new URLSearchParams({ latitude: SEAS.map((s) => s.lat).join(','), longitude: SEAS.map((s) => s.lng).join(','), current: 'wave_height,wave_period', timezone: 'Asia/Seoul' })
  const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?${q}`)
  if (!res.ok) throw new Error('바다 날씨를 불러오지 못했어요')
  const j = await res.json()
  return (Array.isArray(j) ? j : [j]).map((d, i) => ({ ...SEAS[i], h: d.current?.wave_height, p: d.current?.wave_period, t: d.current?.time }))
}

// 해상 특보: 기상청 특보 발표 목록(최근 24시간)에서 풍랑·해일·태풍 특보만 골라 보여 줘요.
const SEA_WORD = /풍랑|해일|태풍|폭풍/
// 파고로 본 추정(공식 기준: 풍랑주의보는 파고 3m 이상 예상, 풍랑경보는 5m 이상 예상 — 바람 기준도 있어요)
const estimate = (rows) => {
  const max = Math.max(...rows.map((s) => s.h ?? 0))
  if (max >= 5) return { text: `🚨 파고가 ${max.toFixed(1)}m예요. 풍랑경보 수준이에요`, bad: true }
  if (max >= 3) return { text: `⚠️ 파고가 ${max.toFixed(1)}m예요. 풍랑주의보 수준이에요`, bad: true }
  return { text: `✅ 지금 파고는 가장 높은 곳이 ${max.toFixed(1)}m로, 풍랑주의보 수준(3m)보다 낮아요`, bad: false }
}

function SeaAlerts({ rows }) {
  const st = useAsync(fetchAlerts, [])
  const est = estimate(rows)
  const w = st.data?.warnings
  const items = w?.ok ? w.items.filter((x) => SEA_WORD.test(x.title)) : []
  return (
    <div className="sea-alerts">
      <h3 className="sub-title">🚨 해상 특보 (풍랑주의보·경보)</h3>
      {st.loading ? <p className="muted small">기상청 해상 특보를 확인하는 중…</p> : !w?.ok ? (
        <p className="notice" style={{ display: 'block' }}>
          기상청 특보를 자동으로 불러오지 못했어요. 아래 공식 사이트에서 확인하세요.
          {w?.error && <small className="muted" style={{ display: 'block' }}>{w.error}</small>}
        </p>
      ) : items.length ? (
        <>
          <p className="notice" style={{ display: 'block' }}>📢 최근 24시간 동안 제주에 풍랑·해일 관련 특보가 <b>{items.length}건</b> 발표됐어요. 배편은 꼭 확인하세요.</p>
          <ul className="alert-list">{items.map((x) => <li key={x.at + x.title}><b>{x.time}</b> {x.title}</li>)}</ul>
          <p className="muted small">발표된 기록이에요. 지금도 유효한지(해제됐는지)는 기상청에서 확인하세요.</p>
        </>
      ) : <p className="notice calm" style={{ display: 'block' }}>✅ 최근 24시간 동안 제주에 발표된 풍랑·해일 특보가 없어요.</p>}
      <p className={`notice${est.bad ? '' : ' calm'}`} style={{ display: 'block' }}>{est.text}<small className="muted" style={{ display: 'block' }}>예보 모델 파고로 본 추정이에요. 공식 특보는 위 기상청 기준이에요.</small></p>
      <a className="link-card" href="https://www.weather.go.kr" target="_blank" rel="noreferrer"><strong>기상청 기상특보 · 해상예보<i className="bi bi-box-arrow-up-right" /></strong><span className="muted">바다 특보와 먼바다·앞바다 예보 (공식)</span></a>
    </div>
  )
}

export default function SeaWaves() {
  const st = useAsync(load, [])
  if (st.loading) return <Loading />
  if (st.error) return <ApiError error={st.error} onRetry={st.reload} />
  return (
    <>
      <SeaAlerts rows={st.data} />
      <h3 className="sub-title">🌊 지금 바다 파도</h3>
      <div className="air-grid">
        {st.data.map((s) => {
          if (s.h == null) return <article key={s.name} className="air-card"><h3>{s.name}</h3><p className="muted small">값이 없어요</p></article>
          const lv = levelOf(s.h)
          return (
            <article key={s.name} className={`air-card tone-${lv.tone}`}>
              <h3>{s.name} <span aria-hidden="true">{lv.emoji}</span></h3>
              <p className="muted small">{s.note}</p>
              <p className="air-main">{s.h.toFixed(1)}m <small>{lv.text}</small></p>
              <p className="muted small">{lv.tip}</p>
              <p className="muted small">파도 간격 {s.p?.toFixed(1) ?? '-'}초 · {s.t?.slice(11, 16)} 기준</p>
            </article>
          )
        })}
      </div>
      <p className="muted small">먼 바다를 계산한 예측값이에요. 항구와 해안은 값이 다를 수 있어요. 배가 뜨는지는 아래 배편 안내에서 꼭 확인하세요.</p>
    </>
  )
}
