import { Link } from 'react-router-dom'
import { THEMES } from '../data/themes'

// 소재 테마 선택 줄 (store 의 themeKey 와 함께 씁니다). href 가 있는 테마(제주어)는 해당 화면으로 이동합니다.
export default function Chips({ value, onChange, children }) {
  return (
    <div className="chips" role="tablist" aria-label="소재 테마">
      {THEMES.filter((t) => !t.hidden).map((t) => {
        const body = <><i className={`bi bi-${t.icon}`} />{t.label}</>
        if (t.href) return <Link key={t.key} to={t.href} className="chip on-hover" style={{ '--c': t.color }}>{body}</Link>
        return (
          <button
            key={t.key} type="button" role="tab" aria-selected={value === t.key}
            className={`chip${value === t.key ? ' on' : ''}`} style={{ '--c': t.color }}
            onClick={() => onChange(t.key)}
          >
            {body}
          </button>
        )
      })}
      {children}
    </div>
  )
}
