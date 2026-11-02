import { Link } from 'react-router-dom'
import { YOUTH } from '../data/youth'

// 청년 탐색 허브 — 카드를 누르면 해당 정보 화면(/discover/:slug)으로 넘어갑니다
export default function Discover() {
  return (
    <div className="page">
      <header className="page-head">
        <h1><i className="bi bi-balloon-heart" />청년 탐색</h1>
        <p className="muted">청년 창작자가 좋아할 만한 제주 정보를 주제별로 모았어요. 주제를 눌러 보세요.</p>
      </header>

      <div className="hub">
        {YOUTH.map((c) => (
          <Link key={c.slug} to={`/discover/${c.slug}`} className="hub-card" style={{ '--c': c.color }}>
            <span className="hub-icon"><i className={`bi bi-${c.icon}`} /></span>
            <h2>{c.title}</h2>
            <strong className="hub-tag">{c.tagline}</strong>
            <p className="muted">{c.desc}</p>
            <div className="hub-tabs">
              {(c.tabs ?? c.areas).map((t) => <span key={t.label}>{t.label}</span>)}
            </div>
            <span className="hub-go">둘러보기 <i className="bi bi-arrow-right" /></span>
          </Link>
        ))}
      </div>
    </div>
  )
}
