import { useState } from 'react'
import { Link } from 'react-router-dom'
import Chips from '../components/Chips'
import ItemCard from '../components/ItemCard'
import { ApiError, Empty, Loading } from '../components/Status'
import { fetchHeritage, fetchPlaces } from '../api/client'
import { isSubCourse, OLLE_ORDER } from '../data/olleCourses'
import { SPOTS } from '../data/spots'
import { useStamps } from '../lib/stamps'
import { PLACE_TYPES, themeOf } from '../data/themes'
import { useAsync } from '../hooks/useAsync'
import { useAppStore } from '../store/useAppStore'

// 사진이 없는 대표 장소 카드에 보여 줄 이모지
const SPOT_EMOJI = { oreum: '⛰️', myth: '✨', jeju43: '🌸', history: '🏯', olle: '🥾' }

// 주제별 정보 (옛 이름: 소재 키트) = 한 테마를 3개 공공 API 로 입체적으로 살펴보는 화면
//   ① 뿌리(국가유산청) ② 보러 갈 곳(한국관광공사) ③ 답사 날씨(기상청)
export default function Kit() {
  const { themeKey, setThemeKey } = useAppStore()
  const { has: stamped } = useStamps()
  const theme = themeOf(themeKey)
  const [type, setType] = useState('12')

  // 주제마다 어울리는 검색어를 따로 씁니다 (kitKeyword / kitHeritage). kitHeritage 가 false 면 국가유산 칸을 숨겨요.
  const heritageWord = theme.kitHeritage === undefined ? theme.heritageKeyword : theme.kitHeritage
  const showHeritage = heritageWord !== false && !theme.noHeritage
  const placeWord = theme.kitKeyword ?? theme.keyword
  const spots = SPOTS[theme.spots] ?? []
  const heritage = useAsync(() => (showHeritage ? fetchHeritage(heritageWord || '') : Promise.resolve([])), [showHeritage, heritageWord])
  const places = useAsync(() => fetchPlaces(placeWord, type, 24), [placeWord, type])

  return (
    <div className="page">
      <header className="page-head">
        <h1><i className="bi bi-box2-heart" />주제별 정보</h1>
        <p className="muted">오름·신화·4·3 같은 주제를 고르면 역사 배경, 가볼 만한 곳, 날씨를 한 번에 보여줘요.</p>
        <Chips value={theme.key} onChange={setThemeKey} />
      </header>

      <section className="kit-hero glass" style={{ '--c': theme.color }}>
        <div>
          <h2><i className={`bi bi-${theme.icon}`} />{theme.label}</h2>
          <p>{theme.blurb}</p>
          {theme.sensitive && <p className="notice"><i className="bi bi-heart-pulse" />민감한 역사예요. 확인된 사실만 쓰고, 추모와 존중의 톤을 지켜 주세요.</p>}
        </div>
      </section>

      {theme.key === 'olle' && (
        <section className="kit-block">
          <div className="block-head"><h2><i className="bi bi-signpost-split" />올레 코스 둘러보기 <small className="muted">점을 누르면 코스 설명으로 가요</small></h2></div>
          <div className="olle-track" role="list">
            {OLLE_ORDER.map((no) => (
              <Link key={no} to={`/olle/${no}`} role="listitem" className={`olle-stop${isSubCourse(no) ? ' sub' : ''}${stamped(no) ? ' done' : ''}`} aria-label={`올레 ${no}코스${stamped(no) ? ' (도장 찍음)' : ''}`} title={`올레 ${no}코스${stamped(no) ? ' · 도장 찍음 🐾' : ''}`}>
                <span className="olle-dot" /><b>{no}</b>
              </Link>
            ))}
          </div>
          <p className="muted small">1~21코스는 섬을 한 바퀴 도는 본 코스, 빈 점(예: 1-1)은 우도·가파도·추자도 등 부속 코스예요. 🐾 도장을 찍은 코스는 분홍색으로 바뀌어요.</p>
        </section>
      )}

      {theme.key === 'history' && (
        <section className="kit-block">
          <div className="block-head"><h2><i className="bi bi-chat-quote" />제주어 <small className="muted">제주역사의 한 부분</small></h2></div>
          <Link to="/jejueo" className="place-row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong>💬 제주어 사전 열기</strong>
            <span className="muted">제주도청 OpenAPI로 방언사전·생활방언·속담을 찾아보세요. 말에도 제주의 역사가 담겨 있어요.</span>
          </Link>
        </section>
      )}

      {spots.length > 0 && (
        <section className="kit-block">
          <div className="block-head"><h2><i className={`bi bi-${theme.icon}`} />대표 {theme.spotLabel ?? theme.label} <small className="muted">{spots.length}곳</small></h2></div>
          <div className="cards">
            {spots.map((s) => (
              <ItemCard key={s.id} lat={s.lat} lng={s.lng} emoji={SPOT_EMOJI[theme.key]} title={s.title} subtitle={s.sub} autoImage badge={theme.spotLabel ?? theme.label} />
            ))}
          </div>
        </section>
      )}

      {theme.key === 'olle' && (
        <section className="kit-block">
          <img className="olle-map" src="/olle-info-map.webp" alt="제주올레 안내소 지도: 공식안내소와 족은안내소 위치" loading="lazy" />
          <p className="muted small">출처: 제주올레 (jejuolle.org)</p>
        </section>
      )}

      {showHeritage && <section className="kit-block">
        <div className="block-head">
          <h2><i className="bi bi-bank2" />{theme.label}와 이어진 국가유산</h2>
        </div>
        <ApiError error={heritage.error} onRetry={heritage.reload} />
        {heritage.loading || heritage.error ? (heritage.loading ? <Loading /> : null) : !heritage.data?.length ? (
          <Empty text={`‘${theme.label}’ 관련 국가유산 검색 결과가 없어요.`} />
        ) : (
          <div className="cards">
            {heritage.data.map((h) => (
              <ItemCard key={h.id} lat={h.lat} lng={h.lng} tone="heritage" autoImage title={h.name} subtitle={h.city} badge={h.kind} />
            ))}
          </div>
        )}
      </section>}

      {theme.key !== 'olle' && <section className="kit-block">
        <div className="block-head">
          <h2><i className="bi bi-geo-alt" />{theme.label} 관련 가볼 곳</h2>
          <div className="seg">
            {Object.entries(PLACE_TYPES).map(([v, label]) => (
              <button key={v} type="button" className={type === v ? 'on' : ''} onClick={() => setType(v)}>{label}</button>
            ))}
          </div>
        </div>
        <ApiError error={places.error} onRetry={places.reload} />
        {places.loading || places.error ? (places.loading ? <Loading /> : null) : !places.data?.length ? (
          <Empty text={`‘${theme.label}’ ${PLACE_TYPES[type]} 검색 결과가 없어요. 다른 분류를 눌러 보세요.`} />
        ) : (
          <div className="cards">
            {places.data.map((p) => (
              <ItemCard key={p.id} lat={p.lat} lng={p.lng} title={p.title} subtitle={p.addr} image={p.image} badge={PLACE_TYPES[p.type]} />
            ))}
          </div>
        )}
      </section>}
    </div>
  )
}
