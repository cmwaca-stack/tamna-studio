import { useState } from 'react'
import { ApiError, Loading } from '../Status'
import { useAsync } from '../../hooks/useAsync'

// 오늘·내일·이번 주(7일) 날씨. 오픈메테오 예보 모델(키 없이 사용)이라 기상청 발표와 조금 다를 수 있어요.
// 홈 화면 날씨 카드와 같은 20곳(제주시 10곳·서귀포시 10곳, 인구 많은 순) + 시 전체 + 삼도1동. 위치는 대략적인 동네 중심이에요.
const REGIONS = [
  { city: '제주시', name: '제주시', lat: 33.5, lng: 126.53 },
  { city: '제주시', name: '삼도1동', lat: 33.511, lng: 126.522 },
  { city: '제주시', name: '노형동', lat: 33.485, lng: 126.478 },
  { city: '제주시', name: '이도2동', lat: 33.5, lng: 126.531 },
  { city: '제주시', name: '연동', lat: 33.489, lng: 126.493 },
  { city: '제주시', name: '아라동', lat: 33.466, lng: 126.547 },
  { city: '제주시', name: '애월읍', lat: 33.464, lng: 126.331 },
  { city: '제주시', name: '일도2동', lat: 33.509, lng: 126.542 },
  { city: '제주시', name: '삼양동', lat: 33.524, lng: 126.588 },
  { city: '제주시', name: '조천읍', lat: 33.544, lng: 126.637 },
  { city: '제주시', name: '화북동', lat: 33.52, lng: 126.57 },
  { city: '제주시', name: '한림읍', lat: 33.411, lng: 126.265 },
  { city: '서귀포시', name: '서귀포시', lat: 33.253, lng: 126.56 },
  { city: '서귀포시', name: '대정읍', lat: 33.224, lng: 126.251 },
  { city: '서귀포시', name: '동홍동', lat: 33.256, lng: 126.575 },
  { city: '서귀포시', name: '남원읍', lat: 33.278, lng: 126.718 },
  { city: '서귀포시', name: '성산읍', lat: 33.458, lng: 126.93 },
  { city: '서귀포시', name: '대륜동', lat: 33.24, lng: 126.526 },
  { city: '서귀포시', name: '대천동', lat: 33.261, lng: 126.493 },
  { city: '서귀포시', name: '표선면', lat: 33.326, lng: 126.835 },
  { city: '서귀포시', name: '안덕면', lat: 33.259, lng: 126.364 },
  { city: '서귀포시', name: '중문동', lat: 33.254, lng: 126.412 },
  { city: '서귀포시', name: '서홍동', lat: 33.249, lng: 126.556 },
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
  const c = REGIONS.find((x) => x.name === city)
  const q = new URLSearchParams({
    latitude: c.lat, longitude: c.lng, timezone: 'Asia/Seoul', forecast_days: '7', wind_speed_unit: 'ms',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m',
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

// 시간대별 예보(1시간 간격). 오늘은 지금부터 24시간, 내일은 0시~23시
function Hours({ data, dateIso, nowTime }) {
  const h = data.hourly
  let ks
  if (nowTime) {
    const start = Math.max(0, h.time.findIndex((t) => t.startsWith(nowTime.slice(0, 13))))
    ks = Array.from({ length: 24 }, (_, n) => start + n).filter((k) => k < h.time.length)
  } else {
    ks = h.time.map((t, k) => k).filter((k) => h.time[k].startsWith(dateIso))
  }
  return (
    <section className="wx-hourly">
      <h3 className="sub-title">⏰ 시간대별 날씨 <small className="muted">{nowTime ? '지금부터 24시간' : '하루 동안'}</small></h3>
      <div className="wx-hours" role="list">
        {ks.map((k) => {
          const t = h.time[k]
          const nextDay = nowTime && !t.startsWith(nowTime.slice(0, 10))
          const [emoji, text] = sky(h.weather_code[k])
          return (
            <div key={t} className={`wx-hour${nextDay ? ' next' : ''}`} role="listitem">
              <b>{nextDay ? '내일 ' : ''}{t.slice(11, 13)}시</b>
              <span className="wx-h-emoji" aria-hidden="true">{emoji}</span>
              <span className="wx-h-text">{text}</span>
              <strong>{Math.round(h.temperature_2m[k])}°</strong>
              <small className="muted">☔ {h.precipitation_probability[k] ?? 0}%</small>
              <small className="muted">💨 {h.wind_speed_10m[k].toFixed(0)}m/s</small>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function WeatherDays() {
  const [city, setCity] = useState('제주시')
  const [view, setView] = useState('today')
  const [q, setQ] = useState('')
  const st = useAsync(() => load(city), [city])
  const d = st.data?.daily
  const word = q.trim()
  const hits = word ? REGIONS.filter((r) => r.name.includes(word) || `${r.city}${r.name}`.includes(word)) : []
  const pick = (name) => { setCity(name); setQ('') }
  const chips = (list) => list.map((r) => (
    <button key={r.name} type="button" role="tab" aria-selected={city === r.name} className={`chip${city === r.name ? ' on' : ''}`} style={{ '--c': '#1c7ed6' }} onClick={() => pick(r.name)}>{r.name}</button>
  ))
  return (
    <>
      {word ? (
        hits.length
          ? <div className="chips" role="tablist" aria-label="검색 결과">{chips(hits)}</div>
          : <p className="muted small">‘{word}’에 맞는 지역이 없어요. 홈 화면 날씨 카드의 20곳(동·읍·면)과 제주시·서귀포시 중에서 찾아요.</p>
      ) : (
        <>
          <p className="chip-label">제주시</p>
          <div className="chips" role="tablist" aria-label="제주시 지역">{chips(REGIONS.filter((r) => r.city === '제주시'))}</div>
          <p className="chip-label">서귀포시</p>
          <div className="chips" role="tablist" aria-label="서귀포시 지역">{chips(REGIONS.filter((r) => r.city === '서귀포시'))}</div>
        </>
      )}
      <div className="wx-title">
        <h3 className="sub-title">📍 {city}{city !== REGIONS.find((r) => r.name === city)?.city && ` (${REGIONS.find((r) => r.name === city)?.city})`} 날씨</h3>
        <form className="wx-search" role="search" onSubmit={(e) => { e.preventDefault(); if (hits[0]) pick(hits[0].name) }}>
          <i className="bi bi-search" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="지역 검색" aria-label="지역 검색 (예: 애월, 중문, 성산)" />
        </form>
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
            <section className="wx-hourly">
              <h3 className="sub-title">📅 이번 주 날씨 <small className="muted">오늘부터 7일</small></h3>
              <div className="wx-hours wx-days" role="list">
                {d.time.map((iso, i) => {
                  const [emoji, text] = sky(d.weather_code[i])
                  return (
                    <div key={iso} className={`wx-hour${i === 0 ? ' today' : ''}`} role="listitem">
                      <b>{dayLabel(iso, i)}</b>
                      <small className="muted">{md(iso)}</small>
                      <span className="wx-h-emoji" aria-hidden="true">{emoji}</span>
                      <span className="wx-h-text">{text}</span>
                      <strong>{Math.round(d.temperature_2m_max[i])}° <small className="muted">/ {Math.round(d.temperature_2m_min[i])}°</small></strong>
                      <small className="muted">☔ {d.precipitation_probability_max[i]}%</small>
                      <small className="muted">💨 {d.wind_speed_10m_max[i].toFixed(0)}m/s</small>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
          <p className="muted small">예보 모델(Open-Meteo)로 계산한 값이고 지역 위치는 대략적인 동네 중심이라, 기상청 발표와 조금 다를 수 있어요. 공식 예보는 기상청에서 확인하세요.</p>
        </>
      )}
    </>
  )
}
