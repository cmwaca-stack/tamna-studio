import { ApiError, Empty, Loading } from './Status'
import { fetchAir } from '../api/client'
import { useAsync } from '../hooks/useAsync'

const SPOTS = [
  { name: '제주시', lat: 33.5, lng: 126.53 },
  { name: '서귀포시', lat: 33.253, lng: 126.56 },
]
// 환경부 대기환경 기준 등급 (미세먼지 ㎍/㎥, 오존 ppm, 통합지수)
const grade = (v, cuts) => { if (v == null) return null; const i = cuts.findIndex((c) => v <= c); return i < 0 ? 3 : i }
const PM25 = [15, 35, 75]
const PM10 = [30, 80, 150]
const O3 = [0.03, 0.09, 0.15]
const KHAI = [50, 100, 250]
const LV = [
  { text: '좋음', tone: 'good', emoji: '😊', tip: '환기하고 바깥 활동하기 좋아요' },
  { text: '보통', tone: 'ok', emoji: '🙂', tip: '민감한 분은 오래 야외 활동은 줄여요' },
  { text: '나쁨', tone: 'bad', emoji: '😷', tip: '마스크를 쓰고, 환기는 짧게 해요' },
  { text: '매우나쁨', tone: 'worse', emoji: '🚫', tip: '야외 활동은 피하고 창문을 닫아요' },
]
const uvText = (u) => (u < 3 ? '낮음' : u < 6 ? '보통' : u < 8 ? '높음' : u < 11 ? '매우 높음' : '위험')
const hhmm = (t) => (t ? `${t.slice(5, 7)}월 ${t.slice(8, 10)}일 ${t.slice(11, 16)}` : '')

// 자외선만 오픈메테오(키 없이 되는 예측 모델)에서 가져와요
async function uvOf() {
  try {
    const q = new URLSearchParams({ latitude: SPOTS.map((s) => s.lat).join(','), longitude: SPOTS.map((s) => s.lng).join(','), current: 'uv_index', timezone: 'Asia/Seoul' })
    const j = await (await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}`)).json()
    return Object.fromEntries((Array.isArray(j) ? j : [j]).map((d, i) => [SPOTS[i].name, d.current?.uv_index]))
  } catch { return {} }
}

async function load() {
  const [air, uv] = await Promise.all([fetchAir(), uvOf()])
  return { ...air, uv }
}

const Row = ({ label, children }) => <div><dt>{label}</dt><dd>{children}</dd></div>
const Lv = ({ g }) => (g == null ? null : <em className={`lv ${LV[g].tone}`}>{LV[g].text}</em>)

export default function AirQuality() {
  const st = useAsync(load, [])
  const d = st.data
  return (
    <section className="kit-block">
      {st.loading ? <Loading /> : st.error ? <ApiError error={st.error} onRetry={st.reload} /> : !d?.cities?.length ? <Empty text="대기질 정보를 찾지 못했어요." /> : (
        <>
          {d.alarm && (
            <p className={`notice${d.alarm.active ? '' : ' calm'}`} style={{ display: 'block' }}>
              {d.alarm.active
                ? <>⚠️ 지금 제주권역에 <b>{d.alarm.item} {d.alarm.kind}</b>가 발령 중이에요 ({d.alarm.issued} 발령). 외출을 줄이고 마스크를 쓰세요.</>
                : <>✅ 지금 제주권역에 발령 중인 미세먼지 주의보·경보는 없어요. <span className="muted">(올해 {d.alarmCountYear}건 발령, 가장 최근: {d.alarm.item} {d.alarm.kind} {d.alarm.issued})</span></>}
            </p>
          )}
          <div className="air-grid">
            {d.cities.map((r) => {
              const g25 = grade(r.pm25, PM25), g10 = grade(r.pm10, PM10), gO3 = grade(r.o3, O3), gK = grade(r.khai, KHAI)
              const worst = Math.max(g25 ?? 0, g10 ?? 0)
              const uv = d.uv?.[r.name]
              return (
                <article key={r.name} className={`air-card tone-${LV[worst].tone}`}>
                  <h3>{r.name} <span aria-hidden="true">{LV[worst].emoji}</span> <small className="muted">{hhmm(r.time)} 측정</small></h3>
                  <p className="air-main">{LV[worst].text}</p>
                  <p className="muted small">{LV[worst].tip}</p>
                  <dl>
                    <Row label="초미세먼지">{r.pm25 ?? '-'}<small>㎍/㎥</small> <Lv g={g25} /></Row>
                    <Row label="미세먼지">{r.pm10 ?? '-'}<small>㎍/㎥</small> <Lv g={g10} /></Row>
                    <Row label="오존">{r.o3 ?? '-'}<small>ppm</small> <Lv g={gO3} /></Row>
                    <Row label="통합대기지수">{r.khai ?? '-'} <Lv g={gK} /></Row>
                    {uv != null && <Row label="자외선(예측)">{uv.toFixed(1)} <em className="lv ok">{uvText(uv)}</em></Row>}
                  </dl>
                </article>
              )
            })}
          </div>
          <p className="muted small">한국환경공단 에어코리아가 측정한 값이에요. 시(제주시·서귀포시) 단위 평균이라 동네에 따라 조금 다를 수 있어요. 자외선은 예측 모델(Open-Meteo) 값이에요.</p>
        </>
      )}
      <div className="links" style={{ marginTop: '.8rem' }}>
        <a href="https://www.airkorea.or.kr" target="_blank" rel="noreferrer" className="link-card"><strong>에어코리아<i className="bi bi-box-arrow-up-right" /></strong><span className="muted">측정소별 실시간 미세먼지·오존 (공식)</span></a>
      </div>
    </section>
  )
}
