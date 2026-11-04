import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LazyScene from '../components/LazyScene'
import LiveNow from '../components/LiveNow'
import RegionWeather from '../components/RegionWeather'
import { THEMES, spotSetsOf, themeOf } from '../data/themes'
import { YOUTH } from '../data/youth'
import { useThemePins } from '../hooks/useThemePins'
import WindCompass from '../components/WindCompass'
import { useWeather } from '../hooks/useWeather'
import { sceneWeather } from '../lib/sceneWeather'
import { useAppStore } from '../store/useAppStore'

// 메뉴 순서를 여기서 정해요. 3D 지도 위에 핀을 보여 주는 것은 theme, 다른 화면으로 가는 것은 to
const T = (key) => THEMES.find((t) => t.key === key)
const Y = (slug) => YOUTH.find((c) => c.slug === slug)
const toY = (slug) => ({ id: slug, to: `/discover/${slug}`, label: Y(slug).title, icon: Y(slug).icon, color: Y(slug).color })
// 생활·실시간 정보가 먼저, 이야기·답사(오름·신화·4·3·역사·올레)는 그 아래 줄
const LIFE_MENU = [
  toY('life'), toY('traffic'), toY('flight'),
  { id: 'hospital', to: '/links/hospital', label: '병원', icon: 'hospital', color: '#e0527e' },
  toY('policy'),
  { id: 'tamna', to: '/tamna', label: T('tamna').label, icon: T('tamna').icon, color: T('tamna').color },
  toY('food'), toY('weekend'), toY('photo'),
]
const STORY_MENU = [
  ...['oreum', 'myth', 'jeju43', 'history'].map((k) => ({ id: k, theme: k, label: T(k).label, icon: T(k).icon, color: T(k).color, on: true })),
  { id: 'olle', theme: 'olle', label: Y('olle').title, icon: Y('olle').icon, color: Y('olle').color },
]

// 메뉴 칩 앞에 붙는 귀여운 이모지
const EMOJI = { oreum: '⛰️', myth: '✨', jeju43: '🌸', history: '🏯', olle: '🥾', weekend: '🎟️', food: '🍜', photo: '📸', flight: '✈️', traffic: '🚦', tamna: '🪙', policy: '💰', hospital: '🏥', life: '🏡' }

const chipBody = (m) => <><span className="emo" aria-hidden="true">{EMOJI[m.id] ?? '🍊'}</span>{m.label}</>

export default function Home() {
  const { themeKey, setThemeKey } = useAppStore()
  const [open, setOpen] = useState(true) // 메뉴판 접기/펼치기
  const theme = themeOf(themeKey)
  const navigate = useNavigate()
  // 핀을 누르면 그 장소의 소개 화면으로 이동 (고정 핀은 id 로, 공공 API 핀은 pin 정보를 같이 넘김)
  const openPin = (p) => navigate(`/place/${p.id}`, { state: { pin: p } })
  const { pins, routes } = useThemePins(theme)
  // 실시간 예보(제주시)로 3D 날씨를 정함. 주소 끝에 ?w=rain|snow|sleet|shower|wind|cloudy|clear 를 붙이면 효과를 미리 볼 수 있어요
  const wx = sceneWeather(useWeather('제주시').slots[0], new URLSearchParams(window.location.search).get('w'))

  return (
    <>
      <section className="stage">
        <div className="stage-canvas"><LazyScene items={pins} routes={routes} weather={wx} autoRotate onPick={openPin} /><div className="jeju-hand" aria-hidden="true">JEJU ISLAND</div></div>
        <RegionWeather />
        <div className="stage-wind"><WindCompass dir={wx.dir} speed={wx.wind} /></div>

        <div className={`stage-panel glass${open ? '' : ' folded'}`}>
          <div className="panel-head">
            <h1>알뜰정보 제주살이</h1>
            <button type="button" className="fold-btn" aria-expanded={open} aria-label={open ? '메뉴판 접기' : '메뉴판 펼치기'} onClick={() => setOpen((v) => !v)}>
              <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} />{open ? '접기' : '펼치기'}
            </button>
          </div>
          {open && <>
          <p className="hello">오늘 제주, 어떤가요? 🌼</p>
          <p className="lead">대기질·교통·항공·병원·청년정책까지, 제주에서 사는 데 필요한 정보를 한곳에서 확인해요.</p>
          <LiveNow />
          <p className="chip-label">생활·실시간 정보</p>
          <div className="chips" role="group" aria-label="생활·실시간 정보">
            {LIFE_MENU.map((m) => <Link key={m.id} to={m.to} className="chip on-hover" style={{ '--c': m.color }}>{chipBody(m)}</Link>)}
          </div>
          <p className="chip-label">이야기·답사 (3D 지도에 핀으로 보기)</p>
          <div className="chips" role="tablist" aria-label="이야기·답사">
            {STORY_MENU.map((m) => (
              <button key={m.id} type="button" role="tab" aria-selected={themeKey === m.theme} className={`chip${themeKey === m.theme ? ' on' : m.on ? '' : ' on-hover'}`} style={{ '--c': m.color }} onClick={() => setThemeKey(m.theme)}>
                {chipBody(m)}
              </button>
            ))}
          </div>
          <p className="muted">{theme.blurb}</p>
          {theme.spotNote && <p className="spot-note"><i className="bi bi-geo-alt-fill" style={{ color: spotSetsOf(theme)[0]?.color }} />{theme.spotNote}{!theme.routes && !theme.cctv && <small> (대략적 위치)</small>}</p>}
          {theme.sensitive && (
            <p className="notice"><i className="bi bi-heart-pulse" />희생과 아픔이 담긴 역사예요. 흥미 위주로 소비하지 않고, 기록과 추모의 시선으로 다뤄 주세요.</p>
          )}
          <div className="actions">
            <Link to="/kit" className="btn btn-primary"><span aria-hidden="true">🗺️</span> 주제별 정보 보기</Link>
            <Link to="/guide" className="btn btn-ghost"><span aria-hidden="true">🔎</span> AI 검색으로 찾기</Link>
          </div>
          </>}
        </div>

        <div className="stage-hud">
          <span className="pill legend">{spotSetsOf(theme).map((s) => <span key={s.key}><i className="dot" style={{ background: s.color }} />{s.label} </span>)}{!theme.spotsOnly && <><i className="dot tour" />장소 {!theme.noHeritage && <><i className="dot heritage" />유산</>}</>}</span>
        </div>
      </section>
    </>
  )
}
