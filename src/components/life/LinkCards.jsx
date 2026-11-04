import { Link } from 'react-router-dom'

// 바로가기 카드 목록. url 이 '/' 로 시작하면 이 사이트 안의 화면으로, 아니면 새 탭으로 열어요.
export default function LinkCards({ items }) {
  return (
    <div className="links">
      {items.map((it) => {
        const body = <><strong>{it.emoji && <span className="emo" aria-hidden="true">{it.emoji}</span>}{it.name}{!it.url.startsWith('/') && <i className="bi bi-box-arrow-up-right" />}</strong><span className="muted">{it.note}</span></>
        return it.url.startsWith('/')
          ? <Link key={it.name} to={it.url} className="link-card">{body}</Link>
          : <a key={it.name} href={it.url} target="_blank" rel="noreferrer" className="link-card">{body}</a>
      })}
    </div>
  )
}

// 한눈에 보이는 안내 한 줄 (tone: good 초록 · maybe 주황 · bad 분홍)
export function Tip({ tone = 'good', icon = 'info-circle', title, children }) {
  return <div className={`tip ${tone}`}><i className={`bi bi-${icon}`} /><div><strong>{title}</strong>{children && <p className="muted">{children}</p>}</div></div>
}
