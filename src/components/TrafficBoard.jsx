import { useWeather } from '../hooks/useWeather'
import { Loading } from './Status'
import TrafficMap from './TrafficMap'

// 날씨 → 운전 주의 안내 (앞으로 6시간 예보 기준)
function driveTips(slots = []) {
  if (!slots.length) return []
  const tips = []
  const rain = slots.some((s) => s.rain === '비' || s.rain === '소나기' || s.pop >= 60)
  const snow = slots.some((s) => s.rain === '눈' || s.rain === '비/눈')
  const wind = Math.max(...slots.map((s) => s.wind ?? 0))
  const cold = Math.min(...slots.map((s) => s.temp ?? 10)) <= 2
  if (snow || (rain && cold)) tips.push({ icon: 'snow2', tone: 'bad', title: '눈·결빙 주의', text: '한라산 1100도로·5.16도로 등 산간도로는 통제되거나 체인이 필요할 수 있어요. 출발 전 통제 여부를 확인하세요.' })
  else if (rain) tips.push({ icon: 'cloud-rain', tone: 'maybe', title: '비 — 미끄럼 주의', text: '제동거리가 길어져요. 속도를 줄이고 앞차와 간격을 넉넉히 두세요. 해안도로는 파도·물웅덩이도 살펴요.' })
  if (wind >= 10) tips.push({ icon: 'wind', tone: 'bad', title: `강풍 ${Math.round(wind)}m/s`, text: '해안도로와 다리, 오름 주변에서 차가 흔들릴 수 있어요. 문을 열 때 바람에 주의하세요.' })
  else if (wind >= 7) tips.push({ icon: 'wind', tone: 'maybe', title: `바람 다소 강함 ${Math.round(wind)}m/s`, text: '해안도로 운전 시 핸들을 단단히 잡으세요.' })
  if (!tips.length) tips.push({ icon: 'check-circle', tone: 'good', title: '운전하기 무난해요', text: '지금 예보로는 큰 위험이 없어요. 그래도 출발 전 도로 소통은 공식 사이트에서 확인하세요.' })
  return tips
}

function DriveCheck() {
  const { slots, loading, error } = useWeather('제주시')
  if (loading) return <Loading />
  if (error || !slots.length) return null
  return (
    <section className="kit-block">
      <h2><i className="bi bi-car-front" style={{ color: '#7048e8' }} /> 지금 운전해도 될까요? <small className="muted">(제주시 · 앞으로 6시간)</small></h2>
      <div className="tips">
        {driveTips(slots).map((t) => (
          <div key={t.title} className={`tip ${t.tone}`}>
            <i className={`bi bi-${t.icon}`} />
            <div><strong>{t.title}</strong><p className="muted">{t.text}</p></div>
          </div>
        ))}
      </div>
    </section>
  )
}


// 실시간 교통정보 본문: 날씨 기반 운전 안내 + 막히는 곳을 보여주는 실시간 교통 지도. 교통정보 화면과 생활정보 탭이 함께 써요.
export default function TrafficBoard({ color = '#7048e8' }) {
  return (
    <>
      <DriveCheck />
      <section className="kit-block">
        <h2><i className="bi bi-map" style={{ color }} /> 실시간 교통 지도 <small className="muted">(어디가 막히는지)</small></h2>
        <TrafficMap />
      </section>
    </>
  )
}
