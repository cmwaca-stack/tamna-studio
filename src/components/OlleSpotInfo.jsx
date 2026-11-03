import { Link } from 'react-router-dom'
import ItemCard from './ItemCard'
import { ApiError, Empty, Loading } from './Status'
import { fetchOlle } from '../api/client'
import { OLLE_COURSES } from '../data/olle'
import { useAsync } from '../hooks/useAsync'
import { useWeather } from '../hooks/useWeather'
import { fieldVerdict, hourLabel, weatherIcon } from '../lib/weather'
import { findNearby, kmText } from '../lib/nearby'

// 공공데이터 이름에 섞인 '?'(깨진 하이픈)를 '-' 로
const fixName = (s = '') => s.replace(/([가-힣])\?([가-힣])/g, '$1-$2')
const SECTIONS = [
  ['spot', 'bi-geo-alt', '주변 가볼 곳', '가볼 곳'],
  ['activity', 'bi-bicycle', '주변 체험·레포츠', '체험'],
  ['food', 'bi-cup-hot', '주변 맛집·카페', '맛집·카페'],
  ['stay', 'bi-house-door', '주변 숙소', '숙소'],
]

// 3D 제주에서 올레길 핀(시·종점)을 눌렀을 때의 상세 정보:
//  이 지점을 지나는 코스 · 지금 날씨 · 5km 안 가볼 곳/체험/맛집/숙소(가까운 순)
export default function OlleSpotInfo({ spot, color }) {
  const idx = Number(String(spot.id).replace('olle-w', ''))
  const last = OLLE_COURSES.length // 21코스까지 → 마지막 지점 번호
  const arrive = idx >= 1 ? idx : null // 이 지점에서 끝나는 코스
  const depart = idx < last ? idx + 1 : null // 이 지점에서 시작하는 코스
  const olle = useAsync(() => fetchOlle(), [])
  const picks = [arrive, depart].filter(Boolean).flatMap((n) => (olle.data ?? []).filter((c) => c.no === String(n)))
  const place = spot.lat < 33.38 ? '서귀포시' : '제주시' // 남쪽이면 서귀포 예보
  const weather = useWeather(place)
  const verdict = fieldVerdict(weather.slots)
  const near = useAsync(() => findNearby([[spot.title, spot.lat, spot.lng]]), [spot.id])
  const total = near.data ? SECTIONS.reduce((n, [k]) => n + (near.data[k]?.length ?? 0), 0) : 0

  const hour = (c) => c.time && `${c.time} 소요`
  const lead = [
    arrive && depart ? `올레 ${arrive}코스가 끝나고 ${depart}코스가 시작되는 지점이에요.` : '',
    !arrive && depart ? `올레길 ${depart}코스가 시작되는 첫 지점이에요.` : '',
    arrive && !depart ? `올레 ${arrive}코스가 끝나는 마지막 지점이에요. 섬을 한 바퀴 돌아 1코스 출발점과 가까워요.` : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <section className="place-sec glass">
        <h2 className="section-title"><i className="bi bi-info-circle" />소개</h2>
        <p className="place-text">{lead}</p>
        {picks.length > 0 && (
          <ul className="olle-points">
            {picks.map((c) => (
              <li key={c.name}>
                <b>{c.no}코스</b> {fixName(c.name)} — {[c.km, hour(c)].filter(Boolean).join(' · ')}
              </li>
            ))}
          </ul>
        )}
        {total > 0 && <p className="spot-note"><i className="bi bi-lightbulb-fill" style={{ color }} />반경 5km 안에 가볼 곳 {near.data.spot.length}곳, 맛집·카페 {near.data.food.length}곳, 숙소 {near.data.stay.length}곳을 찾았어요. 걷기 전후에 들르기 좋아요.</p>}
        <p className="muted small">코스 정보는 제주도청 공개 자료, 주변 장소는 한국관광공사 자료예요. 현황은 달라질 수 있으니 방문 전 확인하세요.</p>
      </section>

      <section className="place-sec glass">
        <h2 className="section-title"><i className="bi bi-signpost-2" />이 지점을 지나는 올레 코스</h2>
        {olle.loading ? <Loading /> : olle.error ? <ApiError error={olle.error} onRetry={olle.reload} /> : !picks.length ? <p className="muted">이 지점과 맞는 코스 정보를 찾지 못했어요.</p> : (
          <div className="olle-info">
            {picks.map((c) => (
              <div key={c.name} className="olle-course">
                <strong>{c.no}코스 · {fixName(c.name)}</strong>
                <p className="muted">{c.km && <><i className="bi bi-rulers" /> {c.km}</>}{c.time && <> · <i className="bi bi-clock" /> {c.time}</>}</p>
                {c.ends && <p className="muted small"><i className="bi bi-flag" /> {c.ends.replace(/-/g, ' → ')}</p>}
                <Link className="btn btn-ghost btn-sm" to={`/olle/${c.no}`}>{c.no}코스 자세히 보기<i className="bi bi-chevron-right" /></Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="place-sec glass">
        <h2 className="section-title"><i className="bi bi-cloud-sun" />지금 날씨 <small className="muted">({place} 예보 기준)</small></h2>
        {weather.loading ? <Loading /> : weather.error || !weather.slots.length ? <p className="muted">날씨를 불러오지 못했어요.</p> : (
          <>
            {verdict && <div className={`verdict ${verdict.tone}`}><i className={`bi bi-${verdict.icon}`} />{verdict.text}</div>}
            <div className="hours">
              {weather.slots.slice(0, 6).map((w) => (
                <div key={w.time} className="hour">
                  <span className="muted small">{hourLabel(w.time)}</span>
                  <i className={`bi bi-${weatherIcon(w)}`} />
                  <b>{w.temp}°C</b>
                  <span className="small">강수 {w.pop}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {SECTIONS.map(([key, icon, heading, badge]) => (
        <section key={key} className="place-sec">
          <h2 className="section-title"><i className={`bi ${icon}`} />{heading} <small className="muted">(5km 안 · 가까운 순 · 한국관광공사)</small></h2>
          {near.loading ? <Loading /> : near.error ? <ApiError error={near.error} onRetry={near.reload} /> : !near.data?.[key]?.length ? <Empty text="이 근처에서 찾은 장소가 없어요." /> : (
            <div className="cards">
              {near.data[key].map((p) => (
                <ItemCard key={p.id} lat={p.lat} lng={p.lng} title={p.title} subtitle={`${kmText(p.dist)} · ${p.addr}`} image={p.image} badge={badge} />
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  )
}
