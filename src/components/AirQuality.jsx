import { Empty, Loading } from './Status'
import { ApiError } from './Status'
import { useAsync } from '../hooks/useAsync'

const SPOTS = [
  { name: '제주시', lat: 33.5, lng: 126.53 },
  { name: '서귀포', lat: 33.253, lng: 126.56 },
  { name: '성산', lat: 33.46, lng: 126.93 },
  { name: '한림', lat: 33.41, lng: 126.27 },
]
// 환경부 대기환경 기준 등급 (㎍/㎥)
const grade = (v, cuts) => { const i = cuts.findIndex((c) => v <= c); return i < 0 ? 3 : i }
const PM25 = [15, 35, 75]
const PM10 = [30, 80, 150]
const LV = [
  { text: '좋음', tone: 'good', emoji: '😊', tip: '환기하고 바깥 활동하기 좋아요' },
  { text: '보통', tone: 'ok', emoji: '🙂', tip: '민감한 분은 오래 야외 활동은 줄여요' },
  { text: '나쁨', tone: 'bad', emoji: '😷', tip: '마스크를 쓰고, 환기는 짧게 해요' },
  { text: '매우나쁨', tone: 'worse', emoji: '🚫', tip: '야외 활동은 피하고 창문을 닫아요' },
]
const uvText = (u) => (u < 3 ? '낮음' : u < 6 ? '보통' : u < 8 ? '높음' : u < 11 ? '매우 높음' : '위험')

async function load() {
  const q = new URLSearchParams({
    latitude: SPOTS.map((s) => s.lat).join(','), longitude: SPOTS.map((s) => s.lng).join(','),
    current: 'pm10,pm2_5,ozone,uv_index', timezone: 'Asia/Seoul',
  })
  const r = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}`)
  if (!r.ok) throw new Error('대기질 서비스에 연결하지 못했어요')
  const j = await r.json()
  return (Array.isArray(j) ? j : [j]).map((d, i) => ({ ...SPOTS[i], ...d.current }))
}

export default function AirQuality() {
  const st = useAsync(load, [])
  const rows = st.data ?? []
  return (
    <section className="kit-block">
      {st.loading ? <Loading /> : st.error ? <ApiError error={st.error} onRetry={st.reload} /> : !rows.length ? <Empty text="대기질 정보를 찾지 못했어요." /> : (
        <>
          <div className="air-grid">
            {rows.map((r) => {
              const g25 = LV[grade(r.pm2_5, PM25)], g10 = LV[grade(r.pm10, PM10)]
              const worst = Math.max(grade(r.pm2_5, PM25), grade(r.pm10, PM10))
              return (
                <article key={r.name} className={`air-card tone-${LV[worst].tone}`}>
                  <h3>{r.name} <span aria-hidden="true">{LV[worst].emoji}</span></h3>
                  <p className="air-main">{LV[worst].text}</p>
                  <p className="muted small">{LV[worst].tip}</p>
                  <dl>
                    <div><dt>초미세먼지</dt><dd>{Math.round(r.pm2_5)}<small>㎍/㎥</small> <em className={`lv ${g25.tone}`}>{g25.text}</em></dd></div>
                    <div><dt>미세먼지</dt><dd>{Math.round(r.pm10)}<small>㎍/㎥</small> <em className={`lv ${g10.tone}`}>{g10.text}</em></dd></div>
                    <div><dt>자외선</dt><dd>{(r.uv_index ?? 0).toFixed(1)} <em className="lv ok">{uvText(r.uv_index ?? 0)}</em></dd></div>
                    <div><dt>오존</dt><dd>{Math.round(r.ozone)}<small>㎍/㎥</small></dd></div>
                  </dl>
                </article>
              )
            })}
          </div>
          <p className="muted small">지금 시각의 예측 모델(Open-Meteo, CAMS) 값이에요. 에어코리아 측정소 실측값과 다를 수 있어요. 등급은 환경부 기준이에요.</p>
        </>
      )}
      <div className="links" style={{ marginTop: '.8rem' }}>
        <a href="https://www.airkorea.or.kr" target="_blank" rel="noreferrer" className="link-card"><strong>에어코리아<i className="bi bi-box-arrow-up-right" /></strong><span className="muted">측정소별 실시간 실측 미세먼지·오존 (공식)</span></a>
      </div>
    </section>
  )
}
