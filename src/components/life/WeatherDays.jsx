import { useState } from 'react'
import { ApiError, Loading } from '../Status'
import { useAsync } from '../../hooks/useAsync'

// 오늘·내일·이번 주(7일) 날씨. 오픈메테오 예보 모델(키 없이 사용)이라 기상청 발표와 조금 다를 수 있어요.
const CITIES = [
  { name: '제주시', lat: 33.5, lng: 126.53 },
  { name: '서귀포', lat: 33.253, lng: 126.56 },
  { name: '성산', lat: 33.46, lng: 126.93 },
  { name: '한림', lat: 33.41, lng: 126.26 },
]
const DOW = ['일', '월', '화', '수', '목', '금', '토']

// WMO 날씨 코드 → 이모지·글자
function sky(c) {
  if (c === 0) return ['☀️', '맑음']
  if (c <= 2) return ['🌤️', '구름 조금']
  if (c === 3) return ['☁️', '흐림']
  if (c <= 48) return ['🌫️', '안개']
  if (c <= 57) return ['🌦️', '이슬비']
  if (c <= 67) return ['🌧️', '비']
  if (c <= 77) return ['❄️', '눈']
  if (c <= 82) return ['🌦️', '소나기']
  if (c <= 86) return ['🌨️', '눈 소나기']
  return ['⛈️', '천둥번개']
}

async function load(city) {
  const c = CITIES.find((x) => x.name === city)
  const q = new URLSearchParams({
    latitude: c.lat, longitude: c.lng, timezone: 'Asia/Seoul', forecast_days: '7', wind_speed_unit: 'ms',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`)
  if (!res.ok) throw new Error('날씨를 불러오지 못했어요')
  return res.json()
}

const dayLabel = (iso, i) => (i === 0 ? '오늘' : i === 1 ? '내일' : `${DOW[new Date(`${iso}T00:00:00+09:00`).getDay()]}요일`)
const md = (iso) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`

// 하루 요약 숫자 → 한 줄 안내
function tips(d, i) {
  const out = []
  const pop = d.precipitation_probability_max[i]
  if (pop >= 60) out.push('☔ 비 올 확률이 높아요. 우산을 챙기세요')
  else if (pop >= 30) out.push('🌂 비가 올 수도 있어요. 접이식 우산을 챙기면 좋아요')
  if (d.wind_speed_10m_max[i] >= 10) out.push('💨 바람이 강해요. 해안도로와 배편을 확인하세요')
  if (d.temperature_2m_min[i] <= 3) out.push('🧥 아침저녁으로 추워요. 따뜻하게 입으세요')
  else if (d.temperature_2m_max[i] >= 30) out.push('🥵 더워요. 물을 자주 마시세요')
  if (d.uv_index_max[i] >= 6) out.push('🧴 자외선이 강해요. 선크림을 바르세요')
  return out.length ? out : ['😊 큰 불편 없이 지내기 좋은 날씨예요']
}

function Summary({ d, i, now }) {
  const [emoji, text] = sky(d.weather_code[i])
  return (
    <article className="wx-big">
      <div className="wx-main">
        <span className="wx-emoji" aria-hidden="true">{emoji}</span>
        <div>
          {now && <p className="wx-temp">{Math.round(now.temperature_2m)}<small>℃</small></p>}
          <p className="wx-text">{dayLabel(d.time[i], i)} {text}</p>
        </div>
      </div>
      <dl className="wx-facts">
        <div><dt>최고 / 최저</dt><dd>{Math.round(d.temperature_2m_max[i])}° / {Math.round(d.temperature_2m_min[i])}°</dd></div>
        <div><dt>비 올 확률</dt><dd>{d.precipitation_probability_max[i]}%</dd></div>
        <div><dt>최대 바람</dt><dd>{d.wind_speed_10m_max[i].toFixed(0)}m/s</dd></div>
        {now && <div><dt>체감 · 습도</dt><dd>{Math.round(now.apparent_temperature)}° · {now.relative_humidity_2m}%</dd></div>}
      </dl>
      <ul className="wx-tips">{tips(d, i).map((t) => <li key={t}>{t}</li>)}</ul>
    </article>
  )
}

// 시간별 예보(3시간 간격). 오늘은 지금부터 24시간, 내일은 그날 하루
function Hours({ data, dateIso, nowTime }) {
  const h = data.hourly
  let ks
  if (nowTime) {
    const start = Math.max(0, h.time.findIndex((t) => t.startsWith(nowTime.slice(0, 13))))
    ks = Array.from({ length: 8 }, (_, n) => start + n * 3).filter((k) => k < h.time.length)
  } else {
    ks = h.time.map((t, k) => k).filter((k) => h.time[k].startsWith(dateIso) && Number(h.time[k].slice(11, 13)) % 3 === 0)
  }
  return (
    <div className="wx-hours" role="list">
      {ks.map((k) => {
        const t = h.time[k]
        const nextDay = nowTime && !t.startsWith(nowTime.slice(0, 10))
        return (
          <div key={t} className="wx-hour" role="listitem">
            <b>{nextDay ? '내일 ' : ''}{t.slice(11, 13)}시</b>
            <span aria-hidden="true">{sky(h.weather_code[k])[0]}</span>
            <span>{Math.round(h.temperature_2m[k])}°</span>
            <small className="muted">☔ {h.precipitation_probability[k] ?? 0}%</small>
          </div>
        )
      })}
    </div>
  )
}

export default function WeatherDays() {
  const [city, setCity] = useState('제주시')
  const [view, setView] = useState('today')
  const st = useAsync(() => load(city), [city])
  const d = st.data?.daily
  return (
    <>
      <div className="chips" role="tablist" aria-label="지역">
        {CITIES.map((c) => <button key={c.name} type="button" role="tab" aria-selected={city === c.name} className={`chip${city === c.name ? ' on' : ''}`} style={{ '--c': '#1c7ed6' }} onClick={() => setCity(c.name)}>{c.name}</button>)}
      </div>
      <div className="seg" role="tablist" aria-label="기간">
        {[['today', '오늘'], ['tomorrow', '내일'], ['week', '이번 주']].map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={view === k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{label}</button>
        ))}
      </div>
      {st.loading ? <Loading /> : st.error ? <ApiError error={st.error} onRetry={st.reload} /> : (
        <>
          {view === 'today' && <><Summary d={d} i={0} now={st.data.current} /><Hours data={st.data} dateIso={d.time[0]} nowTime={st.data.current.time} /></>}
          {view === 'tomorrow' && <><Summary d={d} i={1} /><Hours data={st.data} dateIso={d.time[1]} /></>}
          {view === 'week' && (
            <div className="wx-week">
              {d.time.map((iso, i) => {
                const [emoji, text] = sky(d.weather_code[i])
                return (
                  <div key={iso} className="wx-day">
                    <b>{dayLabel(iso, i)} <small className="muted">{md(iso)}</small></b>
                    <span><span aria-hidden="true">{emoji}</span> {text}</span>
                    <span className="muted">☔ {d.precipitation_probability_max[i]}%</span>
                    <span><b>{Math.round(d.temperature_2m_max[i])}°</b> / {Math.round(d.temperature_2m_min[i])}°</span>
                  </div>
                )
              })}
            </div>
          )}
          <p className="muted small">예보 모델(Open-Meteo)로 계산한 값이라 기상청 발표와 조금 다를 수 있어요. 공식 예보는 기상청에서 확인하세요.</p>
        </>
      )}
    </>
  )
}
