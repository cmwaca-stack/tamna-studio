import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import Chips from '../components/Chips'
import { useAppStore } from '../store/useAppStore'
import HospitalData from '../components/HospitalData'
import { LINKPAGES } from '../data/links'

// 사이트의 공식 마크(파비콘). 불러오지 못하면 이름 첫 글자를 보여줘요.
function Logo({ name, url, host: hostOverride, src, skip }) {
  const [failed, setFailed] = useState(false)
  const host = hostOverride || new URL(url).hostname
  if (failed || skip) return <span className="logo logo-fallback">{name.charAt(0)}</span>
  return (
    <img className="logo" src={src || `https://www.google.com/s2/favicons?domain=${host}&sz=64`} alt=""
      onError={() => setFailed(true)} />
  )
}

// 제주언론사·제주커뮤니티·공공기관 공통 화면 (data/links.js 의 목록을 그려요)
export default function LinkPage() {
  const { kind } = useParams()
  const navigate = useNavigate()
  const setThemeKey = useAppStore((st) => st.setThemeKey)
  const page = LINKPAGES[kind]
  if (!page) return <Navigate to="/" replace />
  return (
    <div className="page">
      <header className="page-head" style={{ '--c': page.color }}>
        <Link to="/" className="back"><i className="bi bi-arrow-left" />홈</Link>
        <h1><i className={`bi bi-${page.icon}`} style={{ color: page.color }} />{page.title}</h1>
        <p className="muted">{page.desc}</p>
        {kind === 'hospital' && <Chips value="hospital" onChange={(k) => { setThemeKey(k); navigate('/kit') }} />}
      </header>
      {kind === 'hospital' && <HospitalData />}
      {page.groups.map((g) => (
        <section key={g.name} className="kit-block">
          <h2>{g.name}</h2>
          <div className="links">
            {g.items.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="link-card">
                <strong>
                  {l.emoji ? <span className="logo logo-emoji" aria-hidden="true">{l.emoji}</span> : page.logos && <Logo name={l.name} url={l.url} host={l.logoHost} src={l.logoSrc} skip={l.logo === false} />}
                  {l.name}<i className="bi bi-box-arrow-up-right" />
                </strong>
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
