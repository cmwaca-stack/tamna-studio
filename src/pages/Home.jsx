import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LazyScene from '../components/LazyScene'
import RegionWeather from '../components/RegionWeather'
import WeatherChip from '../components/WeatherChip'
import { ping } from '../api/client'
import { THEMES, spotSetsOf, themeOf } from '../data/themes'
import { YOUTH } from '../data/youth'
import { useThemePins } from '../hooks/useThemePins'
import { useWeather } from '../hooks/useWeather'
import { sceneWeather } from '../lib/sceneWeather'
import { checkSupabase, diagnoseSupabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

// 메뉴 순서를 여기서 정해요. 3D 지도 위에 핀을 보여 주는 것은 theme, 다른 화면으로 가는 것은 to
const T = (key) => THEMES.find((t) => t.key === key)
const Y = (slug) => YOUTH.find((c) => c.slug === slug)
const MENU = [
  ...['oreum', 'myth', 'jeju43', 'history'].map((k) => ({ id: k, theme: k, label: T(k).label, icon: T(k).icon, color: T(k).color, on: true })),
  { id: 'olle', theme: 'olle', label: Y('olle').title, icon: Y('olle').icon, color: Y('olle').color },
  { id: 'weekend', to: '/discover/weekend', label: Y('weekend').title, icon: Y('weekend').icon, color: Y('weekend').color },
  { id: 'food', to: '/discover/food', label: Y('food').title, icon: Y('food').icon, color: Y('food').color },
  { id: 'flight', to: '/discover/flight', label: Y('flight').title, icon: Y('flight').icon, color: Y('flight').color },
  { id: 'traffic', to: '/discover/traffic', label: Y('traffic').title, icon: Y('traffic').icon, color: Y('traffic').color },
  { id: 'jejueo', to: '/jejueo', label: T('jejueo').label, icon: T('jejueo').icon, color: T('jejueo').color },
  { id: 'policy', to: '/discover/policy', label: Y('policy').title, icon: Y('policy').icon, color: Y('policy').color },
]

function Check({ title, state, msg, children }) {
  const icon = { ok: 'check-circle-fill', fail: 'x-circle-fill', wait: 'hourglass-split' }[state]
  return (
    <div className={`check ${state}`}>
      <div className="check-title"><i className={`bi bi-${icon}`} />{title}</div>
      <div className="muted">{msg}</div>
      {children}
    </div>
  )
}

export default function Home() {
  const { themeKey, setThemeKey, nickname, setNickname } = useAppStore()
  const theme = themeOf(themeKey)
  const navigate = useNavigate()
  // 핀을 누르면 그 장소의 소개 화면으로 이동 (고정 핀은 id 로, 공공 API 핀은 pin 정보를 같이 넘김)
  const openPin = (p) => navigate(`/place/${p.id}`, { state: { pin: p } })
  const { pins, routes, loading } = useThemePins(theme)
  // 실시간 예보(제주시)로 3D 날씨를 정함. 주소 끝에 ?w=rain|snow|sleet|shower|wind|cloudy|clear 를 붙이면 효과를 미리 볼 수 있어요
  const wx = sceneWeather(useWeather('제주시').slots[0], new URLSearchParams(window.location.search).get('w'))

  const [db, setDb] = useState({ state: 'wait', msg: '확인 중…' })
  const [diag, setDiag] = useState(null) // null = 아직 안 돌림, [] = 진단 중
  async function runDiagnosis() {
    setDiag([])
    const steps = await diagnoseSupabase()
    setDiag(steps)
    setDb(steps.every((x) => x.ok)
      ? { state: 'ok', msg: '연결 OK · 읽기·쓰기·삭제 모두 통과' }
      : { state: 'fail', msg: steps.find((x) => !x.ok).msg })
  }
  const [api, setApi] = useState({ state: 'wait', msg: '확인 중…' })
  useEffect(() => {
    checkSupabase().then((r) => setDb({ state: r.ok ? 'ok' : 'fail', msg: r.msg }))
    ping()
      .then((d) => setApi({ state: 'ok', msg: `OK · 공공데이터 키 ${d.hasDataKey ? '있음' : '없음'} · Claude 키 ${d.hasClaudeKey ? '있음' : '없음'}` }))
      .catch(() => setApi({ state: 'fail', msg: 'npm run dev 로 실행했는지, 서버를 껐다 켰는지 확인하세요' }))
  }, [])

  return (
    <>
      <section className="stage">
        <div className="stage-canvas"><LazyScene items={pins} routes={routes} weather={wx} autoRotate onPick={openPin} /><div className="jeju-hand" aria-hidden="true">JEJU ISLAND</div></div>
        <RegionWeather />

        <div className="stage-panel glass">
          <span className="eyebrow">제주 IP × 공공데이터 × AI 에이전트</span>
          <h1>알뜰정보 제주살이</h1>
          <p className="lead">제주살이를 꿈꾸거나 지금 제주에 살고 있다면, 장소·날씨·생활 정보와 AI 가이드로 알뜰하게 도와드려요.</p>
          {/* 메뉴 줄: 오름·신화·4·3·제주역사·올레길·전시축제행사·교통정보·제주어·청년정책 (한 줄로 이어서) */}
          <div className="chips" role="tablist" aria-label="메뉴">
            {MENU.map((m) => {
              const body = <><i className={`bi bi-${m.icon}`} />{m.label}</>
              const style = { '--c': m.color }
              if (m.to) return <Link key={m.id} to={m.to} className="chip on-hover" style={style}>{body}</Link>
              return (
                <button key={m.id} type="button" role="tab" aria-selected={themeKey === m.theme} className={`chip${themeKey === m.theme ? ' on' : m.on ? '' : ' on-hover'}`} style={style} onClick={() => setThemeKey(m.theme)}>
                  {body}
                </button>
              )
            })}
          </div>
          <p className="muted">{theme.blurb}</p>
          {theme.spotNote && <p className="spot-note"><i className="bi bi-geo-alt-fill" style={{ color: spotSetsOf(theme)[0]?.color }} />{theme.spotNote}{!theme.routes && !theme.cctv && <small> (대략적 위치)</small>}</p>}
          {theme.sensitive && (
            <p className="notice"><i className="bi bi-heart-pulse" />희생과 아픔이 담긴 역사예요. 흥미 위주로 소비하지 않고, 기록과 추모의 시선으로 다뤄 주세요.</p>
          )}
          <div className="actions">
            <Link to="/kit" className="btn btn-primary"><i className="bi bi-box2-heart" />주제별 정보 보기</Link>
            <Link to="/guide" className="btn btn-ghost"><i className="bi bi-stars" />AI 가이드에게 묻기</Link>
          </div>
        </div>

        <div className="stage-hud">
          <WeatherChip place="제주시" />
          <span className="pill">{loading ? <><span className="spinner" />핀 꽂는 중</> : <><i className="bi bi-geo-alt-fill" />핀 {pins.length}개</>}</span>
          <span className="pill legend">{spotSetsOf(theme).map((s) => <span key={s.key}><i className="dot" style={{ background: s.color }} />{s.label} </span>)}{!theme.spotsOnly && <><i className="dot tour" />장소 {!theme.noHeritage && <><i className="dot heritage" />유산</>}</>}</span>
          <span className="pill"><i className="bi bi-wind" />제주 하늘 · {wx.label}</span>
        </div>
      </section>

      <section className="page">
        <div className="two-col">
          <div>
            <h2 className="section-title">작업실 이름표</h2>
            <p className="muted">닉네임을 정하면 내 소재 노트가 이 이름으로 Supabase 에 저장돼요.</p>
            <input className="input" placeholder="닉네임" maxLength={20} value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div>
            <h2 className="section-title">동작 체크</h2>
            <div className="checks">
              <Check title="React · 라우터" state="ok" msg="이 화면이 보이면 OK" />
              <Check title="Supabase" {...db}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={runDiagnosis} disabled={diag?.length === 0}>
                  <i className="bi bi-activity" />{diag?.length === 0 ? '진단 중…' : '연결 진단'}
                </button>
                {diag?.length > 0 && (
                  <ul className="diag">
                    {diag.map((x) => (
                      <li key={x.name} className={x.ok ? 'ok' : 'fail'}>
                        <i className={`bi bi-${x.ok ? 'check-circle-fill' : 'x-circle-fill'}`} /><strong>{x.name}</strong> {x.msg}
                      </li>
                    ))}
                  </ul>
                )}
              </Check>
              <Check title="서버 함수 /api" {...api} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
