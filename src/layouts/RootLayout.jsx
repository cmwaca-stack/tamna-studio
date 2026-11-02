import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../nav'
import { useAppStore } from '../store/useAppStore'

const TOAST_ICON = { ok: 'check-circle-fill', warn: 'exclamation-circle-fill', error: 'x-octagon-fill' }

export default function RootLayout() {
  const toasts = useAppStore((s) => s.toasts)
  const nickname = useAppStore((s) => s.nickname)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand"><i className="bi bi-moisture" />제주의 모든것</NavLink>
        <button type="button" className="burger" aria-label="메뉴" aria-expanded={open} onClick={() => setOpen(!open)}>
          <i className={`bi bi-${open ? 'x-lg' : 'list'}`} />
        </button>
        <nav className={`navlinks${open ? ' open' : ''}`}>
          {NAV_ITEMS.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `navlink${isActive || n.also?.includes(pathname) ? ' on' : ''}`}>
              <i className={`bi bi-${n.icon}`} />{n.label}
            </NavLink>
          ))}
          {nickname && <span className="who"><i className="bi bi-person-circle" />{nickname}</span>}
        </nav>
      </header>

      <main className="main"><Outlet /></main>

      <footer className="footer">
        제주대 청년도약 부트캠프 1기 · 데이터 출처 한국관광공사 · 기상청 · 국가유산청 (공공데이터포털)
      </footer>

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.variant}`}><i className={`bi bi-${TOAST_ICON[t.variant]}`} />{t.message}</div>
        ))}
      </div>
    </div>
  )
}
