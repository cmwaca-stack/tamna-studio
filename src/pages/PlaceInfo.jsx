import { mapLink } from '../lib/kakaoLink'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import CctvPlayer from '../components/CctvPlayer'
import ItemCard from '../components/ItemCard'
import OlleSpotInfo from '../components/OlleSpotInfo'
import { ApiError, Empty, Loading } from '../components/Status'
import { fetchHeritage, fetchPlaces } from '../api/client'
import { infoOf } from '../data/spotInfo'
import { SPOTS } from '../data/spots'
import { themeOf } from '../data/themes'
import { useAsync } from '../hooks/useAsync'
import { useAppStore } from '../store/useAppStore'

const ALL = Object.values(SPOTS).flat()
const km = (a, b) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 93)

// 3D 핀을 누르면 오는 장소 상세 화면: 소개 · 방문 팁 · 위치 · 관련 공공데이터
export default function PlaceInfo() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { setThemeKey } = useAppStore()

  const spot = ALL.find((s) => s.id === id) ?? state?.pin ?? null
  const themeKey = spot?.source === 'cctv' ? 'cctv' : spot?.id?.split('-')[0]
  const theme = themeOf(themeKey)
  const info = spot ? infoOf(spot.title) : null
  const kw = info?.kw ?? spot?.title ?? ''
  const isCctv = spot?.source === 'cctv'
  const wantsHeritage = themeKey !== 'oreum' && !isCctv

  const places = useAsync(() => (kw && !isCctv && themeKey !== 'olle' ? fetchPlaces(kw, '', 6) : Promise.resolve([])), [kw, isCctv])
  const heritage = useAsync(() => (kw && wantsHeritage && themeKey !== 'olle' ? fetchHeritage(kw) : Promise.resolve([])), [kw, wantsHeritage])

  const isOlle = themeKey === 'olle' // 올레 핀은 OlleSpotInfo 가 코스·날씨·주변 정보를 따로 보여줘요

  if (!spot) {
    return (
      <div className="page narrow">
        <Empty text="장소를 찾지 못했어요." />
        <Link to="/" className="btn btn-primary"><i className="bi bi-arrow-left" />3D 제주로 돌아가기</Link>
      </div>
    )
  }

  const color = spot.color ?? theme.spotColor ?? theme.color
  const label = spot.label ?? theme.spotLabel ?? theme.label
  const same = ALL.filter((s) => s.id.startsWith(`${themeKey}-`) && s.id !== spot.id)
    .sort((a, b) => km(spot, a) - km(spot, b)).slice(0, 4)
  const q = `${spot.title}에 대해 소재로 쓸 만한 이야기와 방문 팁을 알려줘`
  const enc = encodeURIComponent(spot.title)

  return (
    <div className="page narrow place">
      <header className="page-head" style={{ '--c': color }}>
        <button type="button" className="back linkbtn" onClick={() => navigate(-1)}><i className="bi bi-arrow-left" />3D 제주로 돌아가기</button>
        <span className="tag" style={{ background: color, color: '#fff' }}>{label}</span>
        <h1>{spot.title}</h1>
        {spot.sub && <p className="muted">{spot.sub}</p>}
      </header>

      {theme.sensitive && (
        <p className="notice"><i className="bi bi-heart-pulse" />희생과 아픔이 담긴 장소예요. 기록과 추모의 시선으로 방문하고 다뤄 주세요.</p>
      )}

      {isCctv && (
        <section className="place-sec glass">
          <h2 className="section-title"><i className="bi bi-camera-video" />실시간 영상</h2>
          <CctvPlayer url={spot.url} />
          <p className="muted small">영상 서버가 점검 중이거나 제주 밖 접속을 막으면 나오지 않을 수 있어요. 그럴 땐 <a href="https://www.jejuits.go.kr" target="_blank" rel="noreferrer">제주 교통정보센터</a>에서 확인하세요.</p>
        </section>
      )}

      {!isCctv && !isOlle && (
      <section className="place-sec glass">
        <h2 className="section-title"><i className="bi bi-info-circle" />소개</h2>
        {info ? <p className="place-text">{info.d}</p> : <p className="muted">이 장소의 상세 소개는 아직 준비 중이에요. 아래 관련 공공데이터와 AI 가이드를 이용해 보세요.</p>}
        {info?.tip && <p className="spot-note"><i className="bi bi-lightbulb-fill" style={{ color }} />{info.tip}</p>}
        <p className="muted small">소개는 공개 자료를 요약한 것으로 수치·시설 현황은 달라질 수 있어요. 방문 전 공식 안내를 확인하세요.</p>
      </section>
      )}

      {isOlle && <OlleSpotInfo spot={spot} color={color} />}

      <section className="place-sec glass">
        <h2 className="section-title"><i className="bi bi-geo-alt" />위치</h2>
        {spot.lat != null && <p className="muted">위도 {Number(spot.lat).toFixed(4)} · 경도 {Number(spot.lng).toFixed(4)} <small>(대략적 위치)</small></p>}
        <div className="place-actions">
          <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={mapLink(spot.title, spot.lat, spot.lng)}><i className="bi bi-map" />카카오맵</a>
          <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={`https://map.naver.com/p/search/${enc}`}><i className="bi bi-signpost-2" />네이버지도</a>
          <Link className="btn btn-ghost btn-sm" to="/" onClick={() => themeKey && setThemeKey(themeKey)}><i className="bi bi-badge-3d" />3D 제주에서 보기</Link>
        </div>
      </section>

      {!isCctv && !isOlle && (
      <section className="place-sec">
        <h2 className="section-title"><i className="bi bi-signpost-split" />관련 장소·전시 (한국관광공사)</h2>
        <ApiError error={places.error} onRetry={places.reload} />
        {places.loading ? <Loading /> : places.error ? null : !places.data?.length ? <Empty text="관련 관광 정보가 없어요." /> : (
          <div className="cards">
            {places.data.map((p) => (
              <ItemCard key={p.id} lat={p.lat} lng={p.lng} title={p.title} subtitle={p.addr} image={p.image} badge="장소·전시" />
            ))}
          </div>
        )}
      </section>
      )}

      {wantsHeritage && !isOlle && (
        <section className="place-sec">
          <h2 className="section-title"><i className="bi bi-bank2" />관련 국가유산 (국가유산청)</h2>
          {heritage.loading ? <Loading /> : heritage.error ? <ApiError error={heritage.error} onRetry={heritage.reload} /> : !heritage.data?.length ? <Empty text="관련 국가유산이 없어요." /> : (
            <div className="cards">
              {heritage.data.slice(0, 6).map((h) => (
                <ItemCard key={h.id} lat={h.lat} lng={h.lng} title={h.name} subtitle={[h.kind, h.city].filter(Boolean).join(' · ')} badge="국가유산" tone="heritage" autoImage />
              ))}
            </div>
          )}
        </section>
      )}

      {same.length > 0 && (
        <section className="place-sec">
          <h2 className="section-title"><i className="bi bi-pin-map" />가까운 {theme.label} 장소</h2>
          <div className="chips">
            {same.map((s) => <Link key={s.id} to={`/place/${s.id}`} className="chip on-hover" style={{ '--c': color }}>{s.title}</Link>)}
          </div>
        </section>
      )}

      <div className="place-actions">
        <Link to={`/guide?q=${encodeURIComponent(q)}`} className="btn btn-ghost"><i className="bi bi-stars" />AI 검색으로 물어보기</Link>
      </div>
    </div>
  )
}
