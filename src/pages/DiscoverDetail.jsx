import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import CctvPlayer from '../components/CctvPlayer'
import ItemCard from '../components/ItemCard'
import WeatherChip from '../components/WeatherChip'
import { ApiError, Empty, Loading } from '../components/Status'
import { withFoodExtra } from '../lib/foodExtra'
import { fetchCulture, fetchFlights, fetchPlaces, fetchVjFood, fetchPolicies, fetchSnowCctv } from '../api/client'
import { TYPE_LABEL, youthOf } from '../data/youth'
import { useAsync } from '../hooks/useAsync'
import { useWeather } from '../hooks/useWeather'
import { fieldVerdict } from '../lib/weather'
import { useAppStore } from '../store/useAppStore'

// 사진이 없는 카드에 보여 줄 이모지
const PLACE_EMOJI = { food: '🍜', photo: '📸', weekend: '🎟️' }

function Head({ cat }) {
  return (
    <header className="page-head" style={{ '--c': cat.color }}>
      <Link to="/" className="back"><i className="bi bi-arrow-left" />홈</Link>
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

// 음식점 자료 3종(비짓제주·향토음식·모범음식점)을 이름으로 이어 붙여요. 한국관광공사 자료에 같은 이름이 있으면 사진도 붙여요
const nameKey = (n) => n.replace(/\(.*?\)|\s+/g, '')
const FOOD_SRC = ['vjfood', 'localfood', 'modelfood']
async function foodTab(tab) {
  if (tab.source === 'localfood') {
    const [list, tour] = await Promise.all([fetchVjFood(tab.keyword, 'local'), fetchPlaces('', '39', 500, 'Q').catch(() => [])])
    const img = new Map(tour.map((p) => [nameKey(p.title), p.image]))
    return withFoodExtra(list.map((v, k) => ({ id: `lf-${k}`, title: v.title, addr: v.addr, lat: v.lat, lng: v.lng, image: img.get(nameKey(v.title)), type: '39', info: { menu: v.menu } })))
  }
  if (tab.source === 'modelfood') {
    const list = await fetchVjFood(tab.keyword, 'model')
    return withFoodExtra(list.map((v, k) => ({ id: `mf-${k}`, title: v.title, addr: v.addr, type: '39', info: { kind: v.kind } })))
  }
  const [vj, model, local, tour] = await Promise.all([
    fetchVjFood(tab.keyword, 'vj'), fetchVjFood(tab.keyword, 'model').catch(() => []), fetchVjFood('', 'local').catch(() => []), fetchPlaces('', '39', 500, 'Q').catch(() => []),
  ])
  const byName = (arr) => new Map(arr.map((p) => [nameKey(p.title), p]))
  const T = byName(tour); const L = byName(local); const M = byName(model)
  const seen = new Set()
  const out = []
  const add = (v, info) => {
    const k = nameKey(v.title)
    if (seen.has(k)) return
    seen.add(k)
    const t = T.get(k); const l = L.get(k); const m = M.get(k)
    out.push({ id: `vj-${out.length}`, title: v.title, addr: t?.addr || l?.addr || m?.addr, image: t?.image, lat: t?.lat || l?.lat, lng: t?.lng || l?.lng, type: '39', info: { ...info, menu: info.menu || l?.menu } })
  }
  vj.forEach((v) => add(v, v))
  model.forEach((v) => add(v, {})) // 모범음식점 중 이름에 해당 음식이 들어간 곳도 함께
  return withFoodExtra(out)
}

function VjInfo({ p }) {
  const { open, weekend, rest, reserve, menu, kind } = p.info
  const lines = [kind && `🍽️ ${kind} · 제주도 모범음식점`, open && `🕘 영업 ${open}${weekend && weekend !== open ? ` (주말 ${weekend})` : ''}`, rest && `☕ 휴게 ${rest}`, reserve && `📞 예약 ${reserve}`, menu && `🍲 ${menu}`].filter(Boolean)
  return lines.length ? <p className="muted small">{lines.map((l) => <span key={l} style={{ display: 'block' }}>{l}</span>)}</p> : null
}

// 전시·축제·행사 · 올레길: 탭마다 TourAPI 를 다른 조건으로 조회
function PlaceTabs({ cat }) {
  const [i, setI] = useState(0)
  const tab = cat.tabs[i]
  const isCulture = tab.source === 'culture'
  const isVj = FOOD_SRC.includes(tab.source)
  const places = useAsync(() => (isCulture ? fetchCulture() : isVj ? foodTab(tab) : tab.type === '39' ? fetchPlaces(tab.keyword, tab.type, tab.rows ?? 12, tab.arrange ?? '').then(withFoodExtra) : fetchPlaces(tab.keyword, tab.type, tab.rows ?? 12, tab.arrange ?? '')), [tab.keyword, tab.type, tab.rows, tab.arrange, isCulture, isVj, tab.source])
  // '기타' 탭(other): 같은 화면의 다른 탭 검색어(흑돼지·횟집·카페 등)에 걸리는 곳을 빼고 나머지만 보여줘요
  const taken = cat.tabs.filter((t) => t.keyword && !t.other).flatMap((t) => t.keyword.split('|').map((w) => w.trim()).filter(Boolean))
  const takenCats = cat.tabs.filter((t) => t.cat3).map((t) => t.cat3) // 업종 분류(예: 카페)로 나눈 탭
  const list = tab.other
    ? places.data?.filter((p) => !taken.some((w) => p.title.includes(w)) && !takenCats.includes(p.cat3))
    : tab.cat3 ? places.data?.filter((p) => p.cat3 === tab.cat3)
      : tab.exceptCats ? places.data?.filter((p) => !takenCats.includes(p.cat3)) : places.data
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
      {places.loading ? <Loading /> : places.error ? null : !list?.length ? (
        <Empty text={`‘${tab.label}’ 검색 결과가 없어요. 다른 탭을 눌러 보세요.`} />
      ) : (
        <div className="cards">
          {list.map((p) => (
            <ItemCard key={p.id} lat={p.lat} lng={p.lng} emoji={PLACE_EMOJI[cat.slug]} title={p.title} subtitle={isCulture ? [p.place || p.area, p.start && `${dot(p.start)} ~ ${dot(p.end)}`].filter(Boolean).join(' · ') : p.addr} image={p.image} imgNote={p.searched ? '검색 이미지' : undefined} badge={isCulture ? p.kind || '전시·공연' : TYPE_LABEL[p.type] ?? cat.title}>{p.info && <VjInfo p={p} />}</ItemCard>
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
function PolicyList() {
  const [scope, setScope] = useState('jeju')
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('전체')
  const [open, setOpen] = useState('')
  const st = useAsync(() => fetchPolicies(scope), [scope])
  const all = st.data ?? []
  const kinds = ['전체', ...new Set(all.map((p) => p.kind.split(',')[0]).filter(Boolean))]
  const rows = all.filter((p) => (kind === '전체' || p.kind.includes(kind)) && (!q || `${p.title}${p.keywords}${p.desc}`.includes(q)))
  return (
    <section className="kit-block">
      <h2><i className="bi bi-list-stars" /> 지금 받을 수 있는 정책</h2>
      <div className="tabs">
        <button type="button" className={scope === 'jeju' ? 'on' : ''} onClick={() => { setScope('jeju'); setKind('전체') }}>제주 지역 <small>제주도·제주시·서귀포시</small></button>
        <button type="button" className={scope === 'all' ? 'on' : ''} onClick={() => { setScope('all'); setKind('전체') }}>전국 공통 <small>중앙부처·전국 기관</small></button>
      </div>
      <input className="input" placeholder="정책 검색 (예: 월세, 취업, 교통)" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {kinds.map((k) => <button key={k} type="button" className={`chip${kind === k ? ' on' : ''}`} onClick={() => setKind(k)}>{k}</button>)}
      </div>
      {st.loading && <Loading />}
      {st.error && <ApiError error={st.error} onRetry={st.reload} />}
      {st.data && (rows.length === 0 ? <Empty text="조건에 맞는 정책이 없어요." /> : (
        <div className="policies">
          {rows.map((p) => (
            <article key={p.id} className="policy">
              <button type="button" className="policy-head" onClick={() => setOpen(open === p.id ? '' : p.id)}>
                <strong>{p.title}</strong>
                <span className="muted small">{[p.kind, p.org, p.ageMin || p.ageMax ? `만 ${p.ageMin || '?'}~${p.ageMax || '?'}세` : ''].filter(Boolean).join(' · ')}</span>
                {p.period && <span className="small">신청 {p.period}</span>}
              </button>
              {open === p.id && (
                <div className="policy-body">
                  {p.desc && <p>{p.desc}</p>}
                  {p.support && <p><b>지원 내용</b><br />{p.support}</p>}
                  {p.how && <p><b>신청 방법</b><br />{p.how}</p>}
                  {p.url && <a href={p.url.startsWith('http') ? p.url : `https://${p.url}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">신청·자세히 보기 <i className="bi bi-box-arrow-up-right" /></a>}
                </div>
              )}
            </article>
          ))}
        </div>
      ))}
    </section>
  )
}

function PolicyGuide({ cat }) {
  return (
    <div className="page">
      <Head cat={cat} />
      <PolicyList />

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
  if (!cat) return <Navigate to="/" replace />
  if (cat.kind === 'links') return <PolicyGuide cat={cat} />
  if (cat.kind === 'traffic') return <TrafficGuide cat={cat} />
  if (cat.kind === 'flight') return <FlightGuide cat={cat} />
  return <PlaceTabs key={cat.slug} cat={cat} />
}
