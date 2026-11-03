import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LazyScene from '../components/LazyScene'
import Chips from '../components/Chips'
import PinDetail from '../components/PinDetail'
import { ErrorBox, Loading } from '../components/Status'
import { themeOf } from '../data/themes'
import { useThemePins } from '../hooks/useThemePins'
import { useWeather } from '../hooks/useWeather'
import { sceneWeather } from '../lib/sceneWeather'
import { useAppStore } from '../store/useAppStore'

const FILTERS = [['all', '전체'], ['spot', '테마 핀'], ['tour', '장소·전시'], ['heritage', '국가유산']]

export default function Explore() {
  const { themeKey, setThemeKey } = useAppStore()
  const [params] = useSearchParams()
  const initial = params.get('q') ?? '' // 청년 탐색에서 넘어올 때 검색어를 이어받음
  const [custom, setCustom] = useState(initial) // 직접 검색어 (비우면 테마 키워드)
  const [query, setQuery] = useState(initial)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const theme = themeOf(themeKey)
  const active = custom ? { keyword: custom, heritageKeyword: custom } : theme
  const { pins, routes, loading, error } = useThemePins(active)
  const wx = sceneWeather(useWeather('제주시').slots[0])
  const shown = pins.filter((p) => filter === 'all' || p.source === filter)

  function pickTheme(key) { setThemeKey(key); setCustom(''); setQuery(''); setSelected(null) }
  function search(e) { e.preventDefault(); setCustom(query.trim()); setSelected(null) }

  return (
    <div className="explore">
      <aside className="explore-side">
        <h1 className="side-title"><i className="bi bi-badge-3d" />3D 탐색</h1>
        <p className="muted">핀을 누르거나 목록에서 골라 보세요. 비 예보가 있으면 3D 제주에 비가 내려요.</p>
        <form onSubmit={search} className="search">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="직접 검색 (예: 설문대, 불턱)" />
          <button type="submit" className="btn btn-primary" aria-label="검색"><i className="bi bi-search" /></button>
        </form>
        <Chips value={custom ? '' : theme.key} onChange={pickTheme} />
        <div className="seg">
          {FILTERS.map(([k, label]) => (
            <button key={k} type="button" className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{label}</button>
          ))}
        </div>
        <ErrorBox error={error} />
        {loading ? <Loading text="공공 API 에서 불러오는 중…" /> : (
          <ul className="pinlist">
            {shown.length === 0 && <li className="muted pad">좌표가 있는 결과가 없어요. 다른 테마를 눌러 보세요.</li>}
            {shown.map((p) => (
              <li key={p.key}>
                <button type="button" className={selected?.key === p.key ? 'on' : ''} onClick={() => setSelected(p)}>
                  <i className={`dot ${p.source}`} />
                  <span><strong>{p.title}</strong><small>{p.sub}</small></span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <div className="explore-stage">
        <LazyScene items={shown} routes={routes} weather={wx} selectedKey={selected?.key} onPick={setSelected} />
        <PinDetail pin={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  )
}
