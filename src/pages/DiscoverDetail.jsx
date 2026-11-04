import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import Chips from '../components/Chips'
import { useAppStore } from '../store/useAppStore'
import FlightBoard from '../components/FlightBoard'
import LifeGuide from '../components/LifeGuide'
import TrafficBoard from '../components/TrafficBoard'
import ItemCard from '../components/ItemCard'
import WeatherChip from '../components/WeatherChip'
import { ApiError, Empty, Loading } from '../components/Status'
import { withFoodExtra } from '../lib/foodExtra'
import { withFoodRating } from '../lib/foodRating'
import { fetchCulture, fetchPlaces, fetchVjFood, fetchPolicies } from '../api/client'
import { TYPE_LABEL, youthOf } from '../data/youth'
import { useAsync } from '../hooks/useAsync'
import { useWeather } from '../hooks/useWeather'
import { fieldVerdict } from '../lib/weather'

// 사진이 없는 카드에 보여 줄 이모지
const PLACE_EMOJI = { food: '🍜', photo: '📸', weekend: '🎟️' }

// 어느 메뉴 화면에서도 위쪽 메뉴 칩 줄을 그대로 보여 줘요 (주제 칩은 주제별 정보 화면으로, 나머지는 그 메뉴로 이동)
function Head({ cat }) {
  const navigate = useNavigate()
  const setThemeKey = useAppStore((st) => st.setThemeKey)
  const goTheme = (k) => { setThemeKey(k); navigate('/kit') }
  return (
    <header className="page-head" style={{ '--c': cat.color }}>
      <Link to="/" className="back"><i className="bi bi-arrow-left" />홈</Link>
      <h1><i className={`bi bi-${cat.icon}`} style={{ color: cat.color }} />{cat.title}</h1>
      <p className="muted">{cat.desc}</p>
      <Chips value={cat.slug} hideStories onChange={goTheme} />
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

// 맛집 화면 위쪽: 날씨 대신 제주 공공배달앱 먹깨비를 소개해요 (수치는 2025년 4월 언론 보도 기준)
const MUKKEBI = 'https://www.mukkebi.com/'
function MukkebiIntro() {
  const open = () => window.open(MUKKEBI, '_blank', 'noopener,noreferrer')
  const stop = (e) => e.stopPropagation() // 안의 링크(탐나는전·출처)는 따로 열려요
  return (
    <section className="notice calm" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} role="link" tabIndex={0} aria-label="먹깨비 배달 안내 — 누르면 먹깨비 사이트로 이동" title="누르면 먹깨비 사이트(mukkebi.com)로 이동해요" onClick={open} onKeyDown={(e) => { if (e.key === 'Enter') open() }}>
      <img src="/mukkebi.png" alt="먹깨비 캐릭터와 돌하르방" width="112" height="140" style={{ flex: 'none', width: 112, height: 140, objectFit: 'cover', borderRadius: 14 }} />
      <div style={{ minWidth: 0 }}>
      <strong>🛵 먹깨비로 배달도 시켜 보세요</strong>
      <p style={{ margin: '.3rem 0' }}>먹깨비는 제주도가 만든 공공배달앱이에요. 가맹점이 내는 수수료가 1.5%로 민간 배달앱(7~10%)보다 낮고, 입점비·월사용료·광고비가 없어요. 지역화폐 탐나는전과 이어져 결제 혜택도 있었어요(보도 당시 주문금액 15% 페이백). <Link to="/tamna" onClick={stop}>탐나는전 가맹점 보기</Link></p>
      <p style={{ margin: '.3rem 0', fontWeight: 700 }}><i className="bi bi-box-arrow-up-right" /> 이 안내를 누르면 먹깨비 사이트(mukkebi.com)로 이동해요. 거기서 앱을 설치할 수 있어요.</p>
      <p className="muted small" style={{ margin: 0 }}>2025년 4월 기준 가맹점 3,906곳 · 보도 자료예요. 아래 가게마다 먹깨비 배달이 되는지는 공개된 자료가 없어 표시하지 못해요. 먹깨비 앱에서 가게 이름으로 확인해 주세요. 출처: <a href="https://m.go.seoul.co.kr/news/2025/04/24/20250424024002" target="_blank" rel="noreferrer" onClick={stop}>서울신문</a></p>
      </div>
    </section>
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

// 주소로 제주시/서귀포시를 가려요 (byCity 탭): 제주시가 위, 서귀포시가 아래, 어느 쪽도 아니면 맨 아래 '그 밖'
const CITIES = [{ key: 'jeju', label: '제주시' }, { key: 'seogwipo', label: '서귀포시' }, { key: 'etc', label: '그 밖' }]
const cityOf = (addr = '') => (/서귀포/.test(addr) ? 'seogwipo' : /제주시/.test(addr) ? 'jeju' : 'etc')

// 전시·축제·행사 · 올레길: 탭마다 TourAPI 를 다른 조건으로 조회
function PlaceTabs({ cat }) {
  const [i, setI] = useState(0)
  const [q, setQ] = useState('') // 이 화면 안에서 찾는 검색어
  const tab = cat.tabs[i]
  const isCulture = tab.source === 'culture'
  const isVj = FOOD_SRC.includes(tab.source)
  const places = useAsync(() => (isCulture ? fetchCulture() : isVj ? foodTab(tab) : tab.type === '39' ? fetchPlaces(tab.keyword, tab.type, tab.rows ?? 12, tab.arrange ?? '').then(withFoodExtra).then((l) => (tab.minRating ? withFoodRating(l, tab.minRating) : l)) : fetchPlaces(tab.keyword, tab.type, tab.rows ?? 12, tab.arrange ?? '', !!tab.event)), [tab.keyword, tab.type, tab.rows, tab.arrange, tab.minRating, isCulture, isVj, tab.source, tab.event])
  // '기타' 탭(other): 같은 화면의 다른 탭 검색어(흑돼지·횟집·카페 등)에 걸리는 곳을 빼고 나머지만 보여줘요
  const taken = cat.tabs.filter((t) => t.keyword && !t.other).flatMap((t) => t.keyword.split('|').map((w) => w.trim()).filter(Boolean))
  const takenCats = cat.tabs.filter((t) => t.cat3).map((t) => t.cat3) // 업종 분류(예: 카페)로 나눈 탭
  const base = tab.other
    ? places.data?.filter((p) => !taken.some((w) => p.title.includes(w)) && !takenCats.includes(p.cat3))
    : tab.cat3 ? places.data?.filter((p) => p.cat3 === tab.cat3)
      : tab.exceptCats ? places.data?.filter((p) => !takenCats.includes(p.cat3)) : places.data
  const word = q.trim().toLowerCase()
  const list = word ? base?.filter((p) => [p.title, p.addr, p.place, p.area, p.kind].some((v) => String(v ?? '').toLowerCase().includes(word))) : base
  const dot = (d) => (d && d.length === 8 ? `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}` : d)

  return (
    <div className="page">
      <Head cat={cat} />
      {cat.slug === 'food' ? <MukkebiIntro /> : cat.weather && <WeatherLine />}

      <div className="block-head">
        <div className="seg" role="tablist">
          {cat.tabs.map((t, k) => (
            <button key={t.label} type="button" role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => { setI(k); setQ('') }}>{t.label}</button>
          ))}
        </div>
        <label className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'text' }}>
          <i className="bi bi-search" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="검색어 (가게·주소)" aria-label="이 목록에서 검색" style={{ border: 0, outline: 0, background: 'transparent', font: 'inherit', width: 150 }} />
        </label>
      </div>

      {tab.minRating && <p className="muted small">다음지도(카카오맵) 평점 <b>{tab.minRating.toFixed(1)} 이상</b>인 음식점만 평점 높은 순으로 보여줘요. 평점은 미리 모아 둔 값이라 실제와 조금 다를 수 있고, 평점이 없는 가게는 나오지 않아요.</p>}
      <ApiError error={places.error} onRetry={places.reload} />
      {places.loading ? <Loading /> : places.error ? null : !list?.length ? (
        <Empty text={word ? `‘${q.trim()}’ 검색 결과가 없어요. 다른 검색어를 써 보세요.` : `‘${tab.label}’ 검색 결과가 없어요. 다른 탭을 눌러 보세요.`} />
      ) : (
        <>
          {(tab.byCity ? CITIES.map((c) => ({ ...c, rows: list.filter((p) => cityOf(p.addr) === c.key) })).filter((c) => c.rows.length) : [{ key: 'all', rows: list }]).map((g) => (
            <section key={g.key} className={tab.byCity ? 'city-block' : undefined}>
              {tab.byCity && <h2 className="city-title"><i className="bi bi-geo-alt-fill" /> {g.label} <small className="muted">{g.rows.length}곳</small></h2>}
              <div className="cards">
                {g.rows.map((p) => (
                  <ItemCard key={p.id} lat={p.lat} lng={p.lng} emoji={PLACE_EMOJI[cat.slug]} noMap={cat.slug === 'food'} placeUrl={p.placeUrl} title={p.title} subtitle={isCulture ? [p.place || p.area, p.start && `${dot(p.start)} ~ ${dot(p.end)}`].filter(Boolean).join(' · ') : p.addr} image={p.image} imgNote={p.searched ? '검색 이미지' : undefined} href={p.link} hrefLabel={p.linkKind === 'search' ? '검색으로 알아보기' : '공식 안내 보기'} badge={isCulture ? p.kind || '전시·공연' : TYPE_LABEL[p.type] ?? cat.title}>{p.rating?.s != null && <p className="small"><b>⭐ 다음지도 평점 {p.rating.s.toFixed(1)}</b> <span className="muted">(리뷰 {p.rating.n}개)</span></p>}{p.info && <VjInfo p={p} />}{(p.price || p.tel) && <p className="muted small">{p.price && `💰 ${p.price}`}{p.price && p.tel && ' · '}{p.tel && `📞 ${p.tel}`}</p>}</ItemCard>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  )
}

// 실시간 교통정보: 날씨 기반 운전 안내 + 막히는 곳을 보여주는 실시간 교통 지도 + 공식 사이트
function TrafficGuide({ cat }) {
  return (
    <div className="page">
      <Head cat={cat} />
      <WeatherLine />
      <TrafficBoard color={cat.color} />
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
    </div>
  )
}

// 제주공항 항공편: 날씨 한 줄 + 항공편 보드
function FlightGuide({ cat }) {
  return (
    <div className="page">
      <Head cat={cat} />
      <WeatherLine />
      <FlightBoard />
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
  if (cat.kind === 'life') return <LifeGuide cat={cat} />
  return <PlaceTabs key={cat.slug} cat={cat} />
}
