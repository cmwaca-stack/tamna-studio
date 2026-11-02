import { useWeather } from '../hooks/useWeather'
import { weatherIcon } from '../lib/weather'

export default function WeatherChip({ place = '제주시' }) {
  const { slots, loading, error } = useWeather(place)
  if (loading) return <span className="pill"><span className="spinner" />날씨 확인 중</span>
  if (error) return <span className="pill bad" title={error}><i className="bi bi-exclamation-triangle" />날씨 오류</span>
  const w = slots[0]
  if (!w) return <span className="pill">예보 없음</span>
  return (
    <span className="pill">
      <i className={`bi bi-${weatherIcon(w)}`} />{place} {w.temp}℃ · {w.sky} · 강수 {w.pop}%
    </span>
  )
}
