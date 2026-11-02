import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import CctvPlayer from '../components/CctvPlayer'
import ItemCard from '../components/ItemCard'
import WeatherChip from '../components/WeatherChip'
import { ApiError, Empty, Loading } from '../components/Status'
import { fetchCulture, fetchFlights, fetchPlaces, fetchSnowCctv } from '../api/client'
import { TYPE_LABEL, youthOf } from '../data/youth'
import { useAsync } from '../hooks/useAsync'
import { useWeather } from '../hooks/useWeather'
import { fieldVerdict, hourLabel, weatherIcon } from '../lib/weather'
import { useAppStore } from '../store/useAppStore'

function Head({ cat }) {
  return (
    <header className="page-head" style={{ '--c': cat.color }}>
      <Link to="/discover" className="back"><i className="bi bi-arrow-left" />청년 탐색</Link>
      <h1><i className={`bi bi-${cat.icon}`} style={{ color: cat.color }} />{cat.title}</h1>
      <p className="muted">{cat.desc}</p>
    </header>
  )
}

function WeatherLine() {
  const { slots } = useWeather('제주시')
  const verdict = fieldVerdict(slots)
  return (
    <div className="weather-line">
      <WeatherChip place="제주시" />
      {verdict && <span className={`verdict ${verdict.tone}`}><i className={`bi bi-${verdict.icon}`} />{verdict.text}</span>}
    </div>
  )
}

// 전시·축제·행사 · 올레길: 탭마다 TourAPI 를 다른 조건으로 조회
function PlaceTabs({ cat }) {
  const addNote = useAppStore((s) => s.addNote)
  const [i, setI] = useState(0)
  const tab = cat.tabs[i]
  const isCulture = tab.source === 'culture'
  const places = useAsync(() => (isCulture ? fetchCulture() : fetchPlaces(tab.keyword, tab.type, tab.rows ?? 12)), [tab.keyword, tab.type, tab.rows, isCulture])
  const dot = (d) => (d && d.length === 8 ? `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}` : d)

  return (
    <div className="page">
      <Head cat={cat} />
      {cat.weather && <WeatherLine />}

      <div className="block-head">
        <div className="seg" role="tablist">
          {cat.tabs.map((t, k) => (
            <button key={t.label} type="button" role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{t.label}</button>
          ))}
        </div>
        {tab.keyword && !isCulture && (
          <Link to={`/explore?q=${encodeURIComponent(tab.keyword)}`} className="btn btn-ghost btn-sm"><i className="bi bi-badge-3d" />3D 지도에서 보기</Link>
        )}
      </div>

      <ApiError error={places.error} onRetry={places.reload} />
      {places.loading ? <Loading /> : places.error ? null : !places.data?.length ? (
        <Empty text={`‘${tab.label}’ 검색 결과가 없어요. 다른 탭을 눌러 보세요.`} />
      ) : (
        <div className="cards">
          {places.data.map((p) => (
            <ItemCard key={p.id} title={p.title} subtitle={isCulture ? [p.place || p.area, p.start && `${dot(p.start)} ~ ${dot(p.end)}`].filter(Boolean).join(' · ') : p.addr} image={p.image} badge={isCulture ? p.kind || '전시·공연' : TYPE_LABEL[p.type] ?? cat.title}
              onSave={() => addNote({ source: 'tour', id: p.id, title: p.title })} />
          ))}
        </div>
      )}
    </div>
  )
}

// 날씨 → 운전 주의 안내 (앞으로 6시간 예보 기준)
function driveTips(slots = []) {
  if (!slots.length) return []
  const tips = []
  const rain = slots.some((s) => s.rain === '비' || s.rain === '소나기' || s.pop >= 60)
  const snow = slots.some((s) => s.rain === '눈' || s.rain === '비/눈')
  const wind = Math.max(...slots.map((s) => s.wind ?? 0))
  const cold = Math.min(...slots.map((s) => s.temp ?? 10)) <= 2
  if (snow || (rain && cold)) tips.push({ icon: 'snow2', tone: 'bad', title: '눈·결빙 주의', text: '한라산 1100도로·5.16도로 등 산간도로는 통제되거나 체인이 필요할 수 있어요. 출발 전 통제 여부를 확인하세요.' })
  else if (rain) tips.push({ icon: 'cloud-rain', tone: 'maybe', title: '비 — 미끄럼 주의', text: '제동거리가 길어져요. 속도를 줄이고 앞차와 간격을 넉넉히 두세요. 해안도로는 파도·물웅덩이도 살펴요.' })
  if (wind >= 10) tips.push({ icon: 'wind', tone: 'bad', title: `강풍 ${Math.round(wind)}m/s`, text: '해안도로와 다리, 오름 주변에서 차가 흔들릴 수 있어요. 문을 열 때 바람에 주의하세요.' })
  else if (wind >= 7) tips.push({ icon: 'wind', tone: 'maybe', title: `바람 다소 강함 ${Math.round(wind)}m/s`, text: '해안도로 운전 시 핸들을 단단히 잡으세요.' })
  if (!tips.length) tips.push({ icon: 'check-circle', tone: 'good', title: '운전하기 무난해요', text: '지금 예보로는 큰 위험이 없어요. 그래도 출발 전 도로 소통은 공식 사이트에서 확인하세요.' })
  return tips
}

function DriveCheck() {
  const { slots, loading, error } = useWeather('제주시')
  if (loading) return <Loading />
  if (error || !slots.length) return null
  return (
    <section className="kit-block">
      <h2><i className="bi bi-car-front" style={{ color: '#7048e8' }} /> 지금 운전해도 될까요? <small className="muted">(제주시 · 앞으로 6시간)</small></h2>
      <div className="tips">
        {driveTips(slots).map((t) => (
          <div key={t.title} className={`tip ${t.tone}`}>
            <i className={`bi bi-${t.icon}`} />
            <div><strong>{t.title}</strong><p className="muted">{t.text}</p></div>
          </div>
        ))}
      </div>
      <div className="hours">
        {slots.map((s) => (
          <div key={s.time} className="hour">
            <span className="muted small">{hourLabel(s.time)}</span>
            <i className={`bi bi-${weatherIcon(s)}`} />
            <strong>{s.temp}℃</strong>
            <span className="muted small">강수 {s.pop}%</span>
            <span className="muted small">바람 {Math.round(s.wind ?? 0)}m/s</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// 실시간 교통정보: 날씨 기반 운전 안내 + 공식 사이트 + (제공될 때만) CCTV
function TrafficGuide({ cat }) {
  const navigate = useNavigate()
  const setThemeKey = useAppStore((st) => st.setThemeKey)
  const cams = useAsync(fetchSnowCctv, [])
  const [sel, setSel] = useState(null)
  const cur = cams.data?.find((c) => c.id === sel) ?? cams.data?.[0]
  const hasCams = !!cams.data?.length
  return (
    <div className="page">
      <Head cat={cat} />
      <WeatherLine />
      <DriveCheck />
      <section className="kit-block">
        <h2><i className="bi bi-box-arrow-up-right" style={{ color: cat.color }} /> 실시간 도로·버스 정보 (공식 사이트)</h2>
        <div className="links">
          {cat.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="link-card">
              <strong>{l.name}<i className="bi bi-box-arrow-up-right" /></strong>
              <span className="muted">{l.note}</span>
            </a>
          ))}
        </div>
      </section>
      {hasCams && (
        <section className="kit-block">
          <div className="block-head">
          <h2><i className="bi bi-camera-video" style={{ color: cat.color }} /> 제주 도로 CCTV <small className="muted">(제주시 적설 감시 · 산간도로 중심)</small></h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setThemeKey('cctv'); navigate('/') }}><i className="bi bi-badge-3d" />3D 지도에서 위치 보기</button>
          </div>
          <div className="cctv">
            <div className="cctv-main">
              {cur && <CctvPlayer key={cur.id} url={cur.url} />}
              <strong>{cur?.name}</strong>
            </div>
            <div className="cctv-list">
              {cams.data.map((c) => (
                <button key={c.id} type="button" className={c.id === cur?.id ? 'on' : ''} onClick={() => setSel(c.id)}>
                  <i className="bi bi-camera-video" />{c.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// 제주공항 항공편: 출발/도착 탭 + 지연·결항 표시
function FlightGuide({ cat }) {
  const [dir, setDir] = useState('depart')
  const [only, setOnly] = useState(false)
  const st = useAsync(() => fetchFlights(dir), [dir])
  const rows = (st.data ?? []).filter((f) => !only || f.cancel || f.delay)
  const delayed = (st.data ?? []).filter((f) => f.delay).length
  const cancelled = (st.data ?? []).filter((f) => f.cancel).length
  return (
    <div className="page">
      <Head cat={cat} />
      <WeatherLine />
      <div className="tabs">
        <button type="button" className={dir === 'depart' ? 'on' : ''} onClick={() => setDir('depart')}><i className="bi bi-airplane-engines" /> 출발</button>
        <button type="button" className={dir === 'arrival' ? 'on' : ''} onClick={() => setDir('arrival')}><i className="bi bi-airplane" /> 도착</button>
      </div>
      {st.loading && <Loading />}
      {st.error && <ApiError error={st.error} />}
      {st.data && (
        <section className="kit-block">
          <div className="block-head">
            <h2>오늘 {dir === 'depart' ? '출발' : '도착'} {st.data.length}편 <small className="muted">지연 {delayed} · 결항 {cancelled}</small></h2>
            <label className="small"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> 지연·결항만</label>
          </div>
          {rows.length === 0 ? <Empty text="해당하는 항공편이 없어요." /> : (
            <div className="flights">
              {rows.map((f, i) => (
                <div key={`${f.no}-${f.plan}-${i}`} className={`flight${f.cancel ? ' cancel' : f.delay ? ' late' : ''}`}>
                  <strong className="ft">{f.plan}</strong>
                  <div className="fm"><b>{f.place}</b><span className="muted small">{f.airline} {f.no}{f.gate ? ` · 게이트 ${f.gate}` : ''}</span></div>
                  <span className="fs">{f.status || '-'}{f.late >= 15 && !f.cancel ? ` (+${f.late}분)` : ''}{f.real && f.real !== f.plan && !f.cancel ? <small className="muted"> {f.real}</small> : null}</span>
                </div>
              ))}
            </div>
          )}
          <p className="notice"><i className="bi bi-info-circle" />출처: 한국공항공사 실시간 운항정보. 탑승 전에는 항공사 안내를 꼭 다시 확인하세요.</p>
        </section>
      )}
    </div>
  )
}

// 청년정책: 공식 사이트로 연결하는 안내 화면
function PolicyGuide({ cat }) {
  return (
    <div className="page">
      <Head cat={cat} />

      <section className="kit-block">
        <h2><i className="bi bi-grid" style={{ color: cat.color }} /> 분야별로 찾아보기</h2>
        <div className="areas">
          {cat.areas.map((a) => (
            <div key={a.label} className="area" style={{ '--c': cat.color }}>
              <i className={`bi bi-${a.icon}`} /><strong>{a.label}</strong><span className="muted">{a.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="kit-block">
        <h2><i className="bi bi-box-arrow-up-right" style={{ color: cat.color }} /> 공식 사이트에서 확인하기</h2>
        <div className="links">
          {cat.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="link-card">
              <strong>{l.name}<i className="bi bi-box-arrow-up-right" /></strong>
              <span className="muted">{l.note}</span>
            </a>
          ))}
        </div>
        <p className="notice"><i className="bi bi-info-circle" />정책 내용·신청 기간은 자주 바뀌어요. 신청 전에 반드시 공식 사이트의 최신 공고를 확인하세요.</p>
      </section>
    </div>
  )
}

export default function DiscoverDetail() {
  const { slug } = useParams()
  const cat = youthOf(slug)
  if (!cat) return <Navigate to="/discover" replace />
  if (cat.kind === 'links') return <PolicyGuide cat={cat} />
  if (cat.kind === 'traffic') return <TrafficGuide cat={cat} />
  if (cat.kind === 'flight') return <FlightGuide cat={cat} />
  return <PlaceTabs key={cat.slug} cat={cat} />
}
