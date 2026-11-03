import { Link } from 'react-router-dom'
import { THEMES } from '../data/themes'
import { YOUTH } from '../data/youth'

const Y = (slug) => YOUTH.find((c) => c.slug === slug)
// 홈 화면 메뉴와 같은 순서로, 다른 화면(맛집·항공편 등)으로 가는 칩도 함께 보여줘요
const LINKS = {
  weekend: { to: '/discover/weekend', label: Y('weekend').title, icon: Y('weekend').icon, color: Y('weekend').color },
  food: { to: '/discover/food', label: Y('food').title, icon: Y('food').icon, color: Y('food').color },
  photo: { to: '/discover/photo', label: Y('photo').title, icon: Y('photo').icon, color: Y('photo').color },
  flight: { to: '/discover/flight', label: Y('flight').title, icon: Y('flight').icon, color: Y('flight').color },
  traffic: { to: '/discover/traffic', label: Y('traffic').title, icon: Y('traffic').icon, color: Y('traffic').color },
  policy: { to: '/discover/policy', label: Y('policy').title, icon: Y('policy').icon, color: Y('policy').color },
  hospital: { to: '/links/hospital', label: '병원', icon: 'hospital', color: '#e0527e' },
  life: { to: '/discover/life', label: Y('life').title, icon: Y('life').icon, color: Y('life').color },
}
const theme = (key) => THEMES.find((t) => t.key === key)
const ORDER = ['oreum', 'myth', 'jeju43', 'history', 'olle', 'weekend', 'food', 'photo', 'flight', 'traffic', 'jejueo', 'policy', 'hospital', 'life']

// 소재 테마 선택 줄 (store 의 themeKey 와 함께 씁니다). 테마는 3D 지도 핀으로, 나머지 메뉴(맛집·항공편 등)는 해당 화면으로 이동합니다.
export default function Chips({ value, onChange, children }) {
  return (
    <div className="chips" role="tablist" aria-label="소재 테마">
      {ORDER.map((key) => {
        const t = theme(key)
        const link = LINKS[key] ?? (t?.href ? { to: t.href, label: t.label, icon: t.icon, color: t.color } : null)
        if (link) {
          return (
            <Link key={key} to={link.to} className={`chip${value === key ? ' on' : ' on-hover'}`} style={{ '--c': link.color }}>
              <i className={`bi bi-${link.icon}`} />{link.label}
            </Link>
          )
        }
        if (!t || t.hidden) return null
        return (
          <button
            key={key} type="button" role="tab" aria-selected={value === key}
            className={`chip${value === key ? ' on' : ''}`} style={{ '--c': t.color }}
            onClick={() => onChange(key)}
          >
            <i className={`bi bi-${t.icon}`} />{t.label}
          </button>
        )
      })}
      {children}
    </div>
  )
}
