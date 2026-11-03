import { Link } from 'react-router-dom'
import ItemCard from './ItemCard'
import { Empty, Loading } from './Status'
import { fetchPlaces } from '../api/client'
import { OLLE_ORDER } from '../data/olleCourses'
import { useAsync } from '../hooks/useAsync'
import { useWeather } from '../hooks/useWeather'
import { fieldVerdict } from '../lib/weather'
import { useStamps } from '../lib/stamps'

const today = new Date()
const DAY = Math.floor(today.getTime() / 864e5) // 날마다 다른 추천이 나오도록 돌려요

// 비·강풍이면 실내(문화시설), 아니면 야외 관광지. 사진 있는 곳 중 오늘 날짜로 3곳을 골라요.
function useTodayPicks(indoor) {
  return useAsync(async () => {
    const list = await fetchPlaces('', indoor ? '14' : '12', 60, 'Q')
    const withImg = list.filter((p) => p.image)
    const start = withImg.length ? (DAY * 3) % withImg.length : 0
    return [...withImg.slice(start), ...withImg.slice(0, start)].slice(0, 3)
  }, [indoor])
}

export default function HomeMore() {
  const weather = useWeather('제주시')
  const verdict = fieldVerdict(weather.slots)
  const indoor = verdict?.tone === 'rain' || /바람/.test(verdict?.text ?? '')
  const picks = useTodayPicks(indoor)
  const { stamps } = useStamps()
  const total = OLLE_ORDER.length
  const done = stamps.filter((n) => OLLE_ORDER.includes(n)).length
  const pct = Math.round((done / total) * 100)

  return (
    <div className="home-more">
      <section className="more-block">
        <div className="more-head">
          <h2>🌈 오늘 이거 어때요?</h2>
          <p className="muted">{weather.loading ? '날씨 보는 중…' : indoor ? `${verdict?.text.split(' — ')[0]} 그래서 실내 나들이를 골라 봤어요` : '날씨가 좋아서 바깥 구경 장소를 골라 봤어요'} · 매일 바뀌어요</p>
        </div>
        {picks.loading ? <Loading /> : !picks.data?.length ? <Empty text="오늘의 추천을 불러오지 못했어요." /> : (
          <div className="cards">
            {picks.data.map((p) => (
              <ItemCard key={p.id} lat={p.lat} lng={p.lng} title={p.title} subtitle={p.addr} image={p.image} badge={indoor ? '🏛️ 실내 나들이' : '🌿 오늘의 장소'} />
            ))}
          </div>
        )}
      </section>

      <section className="more-block stamp-box">
        <div className="more-head">
          <h2>🐾 올레길 스탬프 모으기</h2>
          <p className="muted">코스 설명 페이지에서 "도장 찍기"를 누르면 모여요. 이 브라우저에 저장돼요.</p>
        </div>
        <div className="stamp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="stamp-count"><b>{done}</b> / {total}개 {done === 0 ? '— 첫 도장을 찍어 볼까요?' : done === total ? '— 올레길 완주! 🎉' : '— 잘하고 있어요!'}</p>
        <div className="actions">
          <Link to="/olle/1" className="btn btn-primary">🥾 1코스부터 시작</Link>
          <Link to="/kit" className="btn btn-ghost">전체 코스 보기</Link>
        </div>
      </section>

      <section className="more-block">
        <div className="more-head"><h2>💛 바로 가 보기</h2></div>
        <div className="shortcuts">
          <Link to="/discover/photo" className="shortcut"><span>📸</span><b>인생샷 장소</b><small>해변·오름·꽃밭·감성 카페</small></Link>
          <Link to="/discover/food" className="shortcut"><span>🍜</span><b>맛집·카페</b><small>흑돼지부터 디저트까지</small></Link>
          <Link to="/guide" className="shortcut"><span>🔎</span><b>AI 검색</b><small>궁금한 건 뭐든 물어봐요</small></Link>
          <Link to="/discover/weekend" className="shortcut"><span>🎟️</span><b>전시·축제·행사</b><small>이번 주 뭐 하지?</small></Link>
        </div>
      </section>
    </div>
  )
}
