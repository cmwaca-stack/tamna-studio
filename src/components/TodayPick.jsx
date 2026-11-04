import { useState } from 'react'
import { fetchCulture, fetchPlaces } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { mapLink, mapSearch } from '../lib/kakaoLink'

// 홈 "오늘 제주, 어떤가요?" 아래 추천 카드.
//  · 날씨가 나쁘면(비·눈·강풍) 전시·문화시설 같은 실내를, 괜찮으면 명소를 골라요 (한국관광공사)
//  · 지금 열리고 있는 전시·공연·축제도 후보에 넣어요 (제주in놀다 / 한국문화정보원)
//  · "다시 뽑기"는 이미 불러온 후보에서 다시 고르니 서버를 또 부르지 않아요
// 인기 순위 자료는 없어서 "인기"라고 하지 않고, 최근 정보가 갱신된 사진 있는 곳 중에서 무작위로 골라요.
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10).replaceAll('-', '')
const dot = (d) => (d && d.length === 8 ? `${d.slice(4, 6)}.${d.slice(6)}` : d)

// 같은 숫자로는 같은 결과가 나오는 난수 (화면을 그릴 때마다 결과가 바뀌지 않게)
function rng(seed) {
  let a = Math.floor(seed * 2 ** 32) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function load(indoor) {
  const settle = (p) => p.then((value) => value, () => [])
  const [places, events] = await Promise.all([
    settle(fetchPlaces('', indoor ? '14' : '12', 200, 'Q')),
    settle(fetchCulture()),
  ])
  const t = today()
  const ongoing = events.filter((e) => e.start && e.end && e.start <= t && t <= e.end && e.title)
  return { places: places.filter((p) => p.title), events: ongoing }
}

function choose({ places, events }, weather, seed) {
  const rand = rng(seed)
  const pools = []
  if (places.length) pools.push({ weight: 2, kind: 'place', items: places })
  if (events.length) pools.push({ weight: 1, kind: 'event', items: events })
  if (!pools.length) return null
  let r = rand() * pools.reduce((n, p) => n + p.weight, 0)
  const pool = pools.find((p) => (r -= p.weight) < 0) ?? pools[0]
  const item = pool.items[Math.floor(rand() * pool.items.length)]
  if (pool.kind === 'event') return { item, kind: 'event', reason: '🎟️ 지금 열리고 있어요', sub: [item.place || item.area, item.start && `${dot(item.start)} ~ ${dot(item.end)}`].filter(Boolean).join(' · '), image: item.image, link: item.link || (item.lat && item.lng ? mapLink(item.title, item.lat, item.lng) : mapSearch(`제주 ${item.title}`)) }
  const reason = weather.windy ? '💨 바람이 센 날엔 실내가 좋아요' : weather.wet ? '☔ 날씨가 궂은 날엔 실내가 좋아요' : weather.clear ? '☀️ 날씨가 좋아요, 나들이 어때요?' : '🌤️ 가볍게 둘러보기 좋은 날이에요'
  return { item, kind: 'place', reason, sub: item.addr, image: item.image, link: item.lat && item.lng ? mapLink(item.title, item.lat, item.lng) : mapSearch(`제주 ${item.title}`) }
}

export default function TodayPick({ weather }) {
  const indoor = weather.wet || weather.windy
  const st = useAsync(() => (weather.ready ? load(indoor) : new Promise(() => {})), [weather.ready, indoor])
  const [seed, setSeed] = useState(() => Math.random())
  const [imgBroken, setImgBroken] = useState(false)
  const pick = st.data ? choose(st.data, weather, seed) : null

  return (
    <div className="today-pick">
      <div className="today-head">
        <strong><span aria-hidden="true">🎲</span> 오늘의 추천</strong>
        {pick && <button type="button" className="today-again" onClick={() => { setImgBroken(false); setSeed(Math.random()) }}>다시 뽑기</button>}
      </div>
      {!pick
        ? <p className="muted small">{st.error || (st.data && !pick) ? '추천할 곳을 찾지 못했어요.' : '가볼 만한 곳을 고르는 중…'}</p>
        : (
          <a className="today-body" href={pick.link} target="_blank" rel="noreferrer">
            {pick.image && !imgBroken && <img src={pick.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setImgBroken(true)} />}
            <span className="today-text">
              <span className="today-reason">{pick.reason}</span>
              <b>{pick.item.title}</b>
              {pick.sub && <small className="muted">{pick.sub}</small>}
            </span>
          </a>
        )}
    </div>
  )
}
