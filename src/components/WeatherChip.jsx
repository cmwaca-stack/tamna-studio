import { useWeather } from '../hooks/useWeather'
import { weatherIcon } from '../lib/weather'

// wind: 바람 문구(예: 북동풍 3.2m/s)를 넘기면 같은 칩 안에 이어서 보여줘요
export default function WeatherChip({ place = '제주시', wind }) {
  const { slots, loading, error } = useWeather(place)
  if (loading) return <span className="pill"><span className="spinner" />날씨 확인 중</span>
  if (error) return <span className="pill bad" title={error}><i className="bi bi-exclamation-triangle" />날씨 오류</span>
  const w = slots[0]
  if (!w) return <span className="pill">예보 없음</span>
  return (
    <span className="pill">
      <i className={`bi bi-${weatherIcon(w)}`} />{place} {w.temp}℃ · {w.sky} · 강수 {w.pop}%{wind && ` · ${wind}`}
    </span>
  )
}
