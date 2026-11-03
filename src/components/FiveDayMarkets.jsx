import { useEffect, useState } from 'react'

// 제주 오일장(5일장): 5일 간격으로 열려요. 장날 정보는 여러 안내 자료를 바탕으로 한 것이라 달라질 수 있어요.
const MARKETS = [
  { name: '제주민속오일시장', area: '제주시', days: [2, 7], q: '제주민속오일시장', note: '제주에서 제일 큰 오일장' },
  { name: '서귀포향토오일시장', area: '서귀포시', days: [4, 9], q: '서귀포향토오일시장', note: '1995년 문을 연 서귀포 장' },
  { name: '한림민속오일장', area: '제주시 한림읍', days: [4, 9], q: '한림민속5일시장', note: '한림매일시장은 매일 열려요' },
  { name: '고성오일장', area: '서귀포시 성산읍', days: [4, 9], q: '고성오일시장', note: '오전 8시~오후 2시쯤 열려요' },
  { name: '대정오일시장', area: '서귀포시 대정읍', days: [1, 6], q: '대정오일시장', note: '' },
  { name: '세화민속오일시장', area: '제주시 구좌읍', days: [5, 10], q: '세화민속오일시장', note: '' },
]
const WEEK = ['일', '월', '화', '수', '목', '금', '토']
// 그 달의 n일에 장이 서는지: 장날 일자에서 5일씩 (30일까지)
const opens = (d, days) => d <= 30 && days.some((b) => d >= b && (d - b) % 5 === 0)
function nextOpen(days, from) {
  for (let k = 0; k < 40; k++) {
    const t = new Date(from.getFullYear(), from.getMonth(), from.getDate() + k)
    if (opens(t.getDate(), days)) return { date: t, k }
  }
  return null
}

// 시장 사진: 카카오 이미지 검색으로 미리 찾아 둔 사진 (scripts/build-market-images.cjs 가 만든 public/market-images.json)
function MarketPhoto({ name, photo }) {
  const [broken, setBroken] = useState(false)
  if (!photo || broken) return null
  return (
    <div className="market-photo">
      <img src={photo.img} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
      <span className="img-note">검색 이미지</span>
    </div>
  )
}

export default function FiveDayMarkets() {
  const today = new Date()
  const [photos, setPhotos] = useState({})
  useEffect(() => { fetch('/market-images.json').then((r) => (r.ok ? r.json() : {})).then(setPhotos).catch(() => {}) }, [])
  const list = MARKETS.map((m) => ({ ...m, now: opens(today.getDate(), m.days), next: nextOpen(m.days, today) }))
    .sort((a, b) => (b.now - a.now) || (a.next?.k ?? 99) - (b.next?.k ?? 99))
  const nowCount = list.filter((m) => m.now).length
  return (
    <section className="kit-block">
      <p className="notice" style={{ display: 'block' }}>
        {nowCount ? <>오늘({today.getMonth() + 1}월 {today.getDate()}일)은 <b>{list.filter((m) => m.now).map((m) => m.name).join(', ')}</b>의 장날이에요 🛒</> : <>오늘({today.getMonth() + 1}월 {today.getDate()}일)은 열리는 오일장이 없어요. 아래에서 다음 장날을 확인하세요.</>}
      </p>
      <div className="market-grid">
        {list.map((m) => (
          <article key={m.name} className={`market-card${m.now ? ' now' : ''}`}>
            <MarketPhoto name={m.name} photo={photos[m.name]} />
            <div className="market-top">
              <h3>{m.name}</h3>
              {m.now && <span className="tag">오늘 장날 🛒</span>}
            </div>
            <p className="muted small">{m.area}{m.note && ` · ${m.note}`}</p>
            <p className="market-days">매달 <b>{m.days.join('·')}일</b>로 끝나는 날 (5일마다)</p>
            {m.next && <p className="market-next">{m.now ? '오늘 열려요' : `다음 장날: ${m.next.date.getMonth() + 1}월 ${m.next.date.getDate()}일(${WEEK[m.next.date.getDay()]}) · ${m.next.k}일 뒤`}</p>}
            <a className="btn btn-ghost btn-sm" href={`https://map.kakao.com/?q=${encodeURIComponent(m.q)}`} target="_blank" rel="noreferrer">📍 다음지도에서 위치 보기</a>
          </article>
        ))}
      </div>
      <p className="muted small">장날은 시장 사정으로 바뀔 수 있어요(설·추석 연휴, 31일 등). 가기 전에 비짓제주(visitjeju.net)나 시장에 확인하세요. 함덕·중문 등 다른 시장은 확인되는 대로 추가할게요.</p>
    </section>
  )
}
