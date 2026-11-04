import { ApiError, Loading } from '../Status'
import { useAsync } from '../../hooks/useAsync'

// 눈·결빙 도로: 한라산 산간도로 대표 지점의 지금 기온·강수와 앞으로 6시간 예보로 "눈이 오는지, 얼 수 있는지"를 알려 줘요.
// 오픈메테오 예보 모델(키 없이 사용)에 지점 높이를 넣어 산 위 기온을 맞춰요. 도로 위 실제 얼음 상태를 잰 값이 아니라 추정이에요.
const ROADS = [
  { name: '1100도로', note: '1100고지 휴게소 부근', lat: 33.357, lng: 126.462, elev: 1100 },
  { name: '5.16도로', note: '성판악 부근', lat: 33.385, lng: 126.612, elev: 750 },
  { name: '산록도로', note: '한라산 서북쪽 중산간', lat: 33.39, lng: 126.46, elev: 600 },
  { name: '평화로', note: '제주시↔서귀포 서쪽 중산간', lat: 33.37, lng: 126.33, elev: 270 },
  { name: '제주시내', note: '해안 낮은 지대', lat: 33.5, lng: 126.53, elev: 20 },
  { name: '서귀포시내', note: '해안 낮은 지대', lat: 33.253, lng: 126.56, elev: 20 },
]
const SNOW_CODES = [71, 73, 75, 77, 85, 86]
const LEVELS = [
  { tone: 'good', emoji: '😊', text: '걱정 없어요', tip: '지금은 눈·결빙 위험이 보이지 않아요' },
  { tone: 'ok', emoji: '⚠️', text: '결빙 주의', tip: '그늘진 곳·다리 위는 얼 수 있어요. 천천히 운전하세요' },
  { tone: 'worse', emoji: '🚫', text: '눈·결빙 위험', tip: '체인·스노타이어를 챙기고, 출발 전 통제 여부를 꼭 확인하세요' },
]
const WEATHER = (c) => (c === 0 ? '맑음' : c <= 3 ? '구름' : c <= 48 ? '안개' : c <= 67 ? '비' : c <= 77 ? '눈' : c <= 82 ? '소나기' : c <= 86 ? '눈 소나기' : '뇌우')
const sum = (a) => a.reduce((n, v) => n + (v ?? 0), 0)

function judge(r) {
  const temps = [r.now.temperature_2m, ...r.hourly.temperature_2m]
  const minT = Math.min(...temps)
  const snowNow = r.now.snowfall > 0 || SNOW_CODES.includes(r.now.weather_code)
  const snowSoon = sum(r.hourly.snowfall)
  const wetSoon = r.now.precipitation > 0 || sum(r.hourly.precipitation) > 0
  let level = 0
  if (snowNow || (minT <= 0 && wetSoon)) level = 2
  else if (minT <= 1 || snowSoon > 0) level = 1
  return { level, minT, snowNow, snowSoon }
}

async function load() {
  const q = new URLSearchParams({
    latitude: ROADS.map((r) => r.lat).join(','), longitude: ROADS.map((r) => r.lng).join(','), elevation: ROADS.map((r) => r.elev).join(','),
    current: 'temperature_2m,precipitation,snowfall,weather_code', hourly: 'temperature_2m,snowfall,precipitation', forecast_hours: '6', timezone: 'Asia/Seoul',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`)
  if (!res.ok) throw new Error('도로 날씨를 불러오지 못했어요')
  const j = await res.json()
  return (Array.isArray(j) ? j : [j]).map((d, i) => ({ ...ROADS[i], now: d.current, hourly: d.hourly })).map((r) => ({ ...r, ...judge(r) }))
}

export default function IceRoads() {
  const st = useAsync(load, [])
  if (st.loading) return <Loading />
  if (st.error) return <ApiError error={st.error} onRetry={st.reload} />
  const danger = st.data.filter((r) => r.level === 2)
  const warn = st.data.filter((r) => r.level === 1)
  return (
    <>
      <p className={`notice${danger.length ? '' : ' calm'}`} style={{ display: 'block' }}>
        {danger.length
          ? <>🚫 지금 <b>{danger.map((r) => r.name).join(', ')}</b>에 눈이 오거나 얼 위험이 있어요. 출발 전에 통제 여부를 확인하세요.</>
          : warn.length
            ? <>⚠️ 눈 걱정은 없지만 <b>{warn.map((r) => r.name).join(', ')}</b>은 기온이 낮아 얼 수 있어요. 천천히 운전하세요.</>
            : <>✅ 지금은 제주 어디에서도 눈·결빙 위험이 보이지 않아요.</>}
      </p>
      <div className="air-grid">
        {st.data.map((r) => {
          const lv = LEVELS[r.level]
          return (
            <article key={r.name} className={`air-card tone-${lv.tone}`}>
              <h3>{r.name} <span aria-hidden="true">{lv.emoji}</span></h3>
              <p className="muted small">{r.note} · 높이 약 {r.elev}m</p>
              <p className="air-main">{lv.text}</p>
              <p className="muted small">{lv.tip}</p>
              <dl>
                <div><dt>지금</dt><dd>{r.now.temperature_2m.toFixed(0)}<small>℃</small> {WEATHER(r.now.weather_code)}</dd></div>
                <div><dt>6시간 안 최저</dt><dd>{r.minT.toFixed(0)}<small>℃</small></dd></div>
                <div><dt>눈 예상</dt><dd>{r.snowNow || r.snowSoon > 0 ? <>{(r.now.snowfall + r.snowSoon).toFixed(1)}<small>cm</small></> : '없음'}</dd></div>
              </dl>
            </article>
          )
        })}
      </div>
      <p className="muted small">예보 모델로 계산한 추정이에요. 도로 위 얼음이나 실제 통제를 잰 값이 아니라서, 출발 전에는 아래 공식 사이트와 CCTV로 꼭 확인하세요.</p>
    </>
  )
}
