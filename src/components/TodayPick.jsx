import { useState } from 'react'
import { fetchCulture, fetchPlaces } from '../api/client'
import { useAsync } from '../hooks/useAsync'
import { mapLink, mapSearch } from '../lib/kakaoLink'

// 홈 "오늘 제주, 어떤가요?" 아래 추천 카드.
//  후보 세 묶음을 섞어서, "다시 뽑기"를 누를 때마다 안 본 곳부터 차례로 보여줘요 (다 보기 전에는 같은 곳이 다시 나오지 않아요).
//   ① 날씨에 맞는 곳: 비·눈·강풍이면 전시·문화시설(실내), 아니면 명소 — 한국관광공사, 사진 있는 곳 중 최근 정보가 갱신된 순 200곳
//   ② 맛집·카페 — 한국관광공사 음식점, 같은 기준 200곳
//   ③ 지금 열리고 있는 전시·공연·축제 — 제주in놀다 / 한국문화정보원 (오늘이 기간 안에 든 것만)
// 인기 순위 자료는 없어서 "인기"라고 하지 않아요.
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
  const [places, food, events] = await Promise.all([
    settle(fetchPlaces('', indoor ? '14' : '12', 200, 'Q')),
    settle(fetchPlaces('', '39', 200, 'Q')),
    settle(fetchCulture()),
  ])
  const t = today()
  const ongoing = events.filter((e) => e.start && e.end && e.start <= t && t <= e.end && e.title)
  return { places: places.filter((p) => p.title), food: food.filter((p) => p.title), events: ongoing }
}

const shuffle = (list, rand) => {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
const linkOf = (p) => (p.lat && p.lng ? mapLink(p.title, p.lat, p.lng) : mapSearch(`제주 ${p.title}`))

// 후보를 묶음별로 섞은 뒤 번갈아 끼워 넣어 한 줄 "카드 더미"를 만들어요
function buildDeck({ places, food, events }, weather, seed) {
  const rand = rng(seed)
  const placeReason = weather.windy ? '💨 바람이 센 날엔 실내가 좋아요' : weather.wet ? '☔ 날씨가 궂은 날엔 실내가 좋아요' : weather.clear ? '☀️ 날씨가 좋아요, 나들이 어때요?' : '🌤️ 가볍게 둘러보기 좋은 날이에요'
  const lanes = [
    shuffle(places, rand).slice(0, 60).map((item) => ({ item, reason: placeReason, sub: item.addr, image: item.image, link: linkOf(item) })),
    shuffle(food, rand).slice(0, 40).map((item) => ({ item, reason: '🍽️ 맛있는 한 끼 어때요?', sub: item.addr, image: item.image, link: linkOf(item) })),
    shuffle(events, rand).slice(0, 30).map((item) => ({ item, reason: '🎟️ 지금 열리고 있어요', sub: [item.place || item.area, item.start && `${dot(item.start)} ~ ${dot(item.end)}`].filter(Boolean).join(' · '), image: item.image, link: item.link || linkOf(item) })),
  ]
  const deck = []
  for (let i = 0; lanes.some((l) => i < l.length); i += 1) for (const l of lanes) if (i < l.length) deck.push(l[i])
  return deck
}

export default function TodayPick({ weather }) {
  const indoor = weather.wet || weather.windy
  const st = useAsync(() => (weather.ready ? load(indoor) : new Promise(() => {})), [weather.ready, indoor])
  const [seed, setSeed] = useState(() => Math.random())
  const [n, setN] = useState(0) // 카드 더미에서 지금 몇 번째인지
  const [imgBroken, setImgBroken] = useState(false)
  const deck = st.data ? buildDeck(st.data, weather, seed) : []
  const pick = deck.length ? deck[n % deck.length] : null
  const again = () => {
    setImgBroken(false)
    if (n + 1 >= deck.length) { setSeed(Math.random()); setN(0) } else setN(n + 1) // 더미를 다 봤으면 새로 섞어요
  }

  return (
    <div className="today-pick">
      <div className="today-head">
        <strong><span aria-hidden="true">🎲</span> 오늘의 추천</strong>
        {pick && <button type="button" className="today-again" onClick={again}>다시 뽑기</button>}
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
