import { Link, Navigate, useParams } from 'react-router-dom'
import { LINKPAGES } from '../data/links'

// 제주언론사·제주커뮤니티·공공기관 공통 화면 (data/links.js 의 목록을 그려요)
export default function LinkPage() {
  const { kind } = useParams()
  const page = LINKPAGES[kind]
  if (!page) return <Navigate to="/" replace />
  return (
    <div className="page">
      <header className="page-head" style={{ '--c': page.color }}>
        <Link to="/" className="back"><i className="bi bi-arrow-left" />스튜디오</Link>
        <h1><i className={`bi bi-${page.icon}`} style={{ color: page.color }} />{page.title}</h1>
        <p className="muted">{page.desc}</p>
      </header>
      {page.groups.map((g) => (
        <section key={g.name} className="kit-block">
          <h2>{g.name}</h2>
          <div className="links">
            {g.items.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="link-card">
                <strong>{l.name}<i className="bi bi-box-arrow-up-right" /></strong>
                <span className="muted">{l.note}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
      <p className="notice"><i className="bi bi-info-circle" />외부 사이트로 이동해요. 사이트 주소나 운영 방식은 바뀔 수 있어요.</p>
    </div>
  )
}
