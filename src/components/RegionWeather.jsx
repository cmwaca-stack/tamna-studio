import { useEffect, useState } from 'react'
import { fetchWeatherAll } from '../api/client'

// 날씨 한 줄 → 이모티콘
export function weatherEmoji(w) {
  if (w.rain === '눈') return '🌨️'
  if (w.rain === '비/눈') return '🌨️'
  if (w.rain === '소나기') return '🌦️'
  if (w.rain === '비') return '🌧️'
  if (w.pop >= 60) return '🌧️'
  return { 맑음: '☀️', 구름많음: '⛅', 흐림: '☁️' }[w.sky] ?? '🌤️'
}
const text = (w) => (w.rain !== '없음' ? w.rain : w.sky)

// 오른쪽 위: 제주 여러 지역의 날씨를 3.5초마다 돌아가며 보여 줍니다 (눌러서 직접 고를 수도 있어요)
export default function RegionWeather() {
  const [rows, setRows] = useState([])
  const [err, setErr] = useState(false)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let alive = true
    const load = () => fetchWeatherAll().then((d) => alive && (setRows(d), setErr(false))).catch(() => alive && setErr(true))
    load()
    const t = setInterval(load, 10 * 60e3) // 10분마다 새로 가져오기
    return () => { alive = false; clearInterval(t) }
  }, [])

  useEffect(() => {
    if (paused || rows.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % rows.length), 3500)
    return () => clearInterval(t)
  }, [paused, rows.length])

  if (err && !rows.length) return null
  if (!rows.length) return <div className="region-wx glass"><span className="spinner" />지역 날씨 확인 중</div>
  const w = rows[i % rows.length]
  return (
    <div className="region-wx glass" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-live="polite">
      <div className="region-wx-main" key={w.place}>
        <span className="region-wx-emoji" aria-hidden="true">{weatherEmoji(w)}</span>
        <div>
          <strong>{w.place}</strong> <span className="muted">{w.temp}℃</span>
          {w.city && <span className="region-wx-city">{w.city} 인구 {w.rank}위</span>}
          <div className="region-wx-line">{text(w)} · 강수 {w.pop}%{w.wind != null ? ` · 바람 ${w.wind}m/s` : ''}</div>
        </div>
      </div>
      <div className="region-wx-dots" role="tablist" aria-label="지역 선택">
        {rows.map((r, k) => (
          <button key={r.place} type="button" role="tab" aria-selected={k === i} aria-label={r.place} title={`${r.city ?? ''} ${r.place} ${weatherEmoji(r)}`} className={`${k === i ? 'on' : ''}${r.city !== rows[k - 1]?.city && k > 0 ? ' gap' : ''}`} onClick={() => setI(k)} />
        ))}
      </div>
    </div>
  )
}
