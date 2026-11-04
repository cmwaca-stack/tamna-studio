import { fetchFuel } from '../../api/client'
import { useAsync } from '../../hooks/useAsync'
import { ApiError, Loading } from '../Status'

// 제주 기름값(원/ℓ): 휘발유·경유는 제주 평균, LPG는 제주만의 값이 없어 전국 평균이에요. 한국석유공사 오피넷이 하루 한 번(전날 기준) 올리는 평균 판매가예요.
const won = (v) => Math.round(v).toLocaleString()
const md = (iso) => (iso ? `${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일` : '')

export default function FuelPrices() {
  const st = useAsync(fetchFuel, [])
  if (st.loading) return <Loading text="기름값을 불러오는 중…" />
  if (st.error) return <ApiError error={st.error} onRetry={st.reload} />
  const { jeju, lpg, date } = st.data
  const cards = [
    jeju && { key: 'g', emoji: '⛽', name: '휘발유', note: '보통휘발유 · 제주 평균', price: jeju.gasoline },
    jeju && { key: 'd', emoji: '🛢️', name: '경유', note: '자동차용 · 제주 평균', price: jeju.diesel },
    lpg && { key: 'l', emoji: '🔥', name: 'LPG', note: '자동차부탄 · 전국 평균', price: lpg.price, change: lpg.change },
  ].filter(Boolean)
  return (
    <section className="fuel-prices">
      <div className="air-grid">
        {cards.map((c) => (
          <article key={c.key} className="air-card tone-ok">
            <h3>{c.emoji} {c.name}</h3>
            <p className="air-main">{won(c.price)}<small>원/ℓ</small></p>
            <p className="muted small">{c.note}{c.change ? ` · 전일 ${c.change > 0 ? '▲' : '▼'} ${Math.abs(c.change).toFixed(1)}원` : ''}</p>
          </article>
        ))}
      </div>
      <p className="muted small">한국석유공사 오피넷 평균 판매가예요{date ? ` (${md(date)} 기준, 하루 한 번 갱신)` : ''}. 동네·주유소마다 달라서, 가까운 곳 가격은 아래 오피넷에서 확인하세요. 제주 추자도·우도는 평균에 포함되지 않아요.</p>
    </section>
  )
}
