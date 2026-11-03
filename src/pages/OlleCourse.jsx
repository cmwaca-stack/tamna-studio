import { Link, Navigate, useParams } from 'react-router-dom'
import ItemCard from '../components/ItemCard'
import { ApiError, Empty, Loading } from '../components/Status'
import { fetchOlle } from '../api/client'
import { isSubCourse, OLLE_ORDER, SUB_POINTS } from '../data/olleCourses'
import { OLLE_COURSES } from '../data/olle'
import { useAsync } from '../hooks/useAsync'
import { findNearby, kmText } from '../lib/nearby'
import { useAppStore } from '../store/useAppStore'

// "포구·선착장-포구" 처럼 이어진 시·종점 글자를 둘로 나눠요
const splitEnds = (ends = '') => ends.split('-').map((s) => s.trim()).filter(Boolean)
// 공공데이터 이름에 섞인 '?'(깨진 하이픈)를 '-' 로
const fixName = (s = '') => s.replace(/([가-힣])\?([가-힣])/g, '$1-$2')
// 올레길 코스 한 개를 설명하는 화면 (/olle/:no)
export default function OlleCourse() {
  const { no } = useParams()
  const { addNote } = useAppStore()
  const idx = OLLE_ORDER.indexOf(no)
  const olle = useAsync(() => fetchOlle(), [])
  const rows = (olle.data ?? []).filter((c) => c.no === no)
  const base = OLLE_COURSES.find((c) => String(c.no) === no) // 1~21코스의 시·종점(키 없이도 있음)
  const first = rows[0]
  const [start, end] = first ? splitEnds(first.ends) : base ? [base.from[0], base.to[0]] : []
  // 시·종점 좌표: 1~21코스는 data/olle.js, 부속 코스는 data/olleCourses.js 의 SUB_POINTS
  const points = base ? [base.from, base.to] : SUB_POINTS[no] ?? []
  const places = useAsync(() => findNearby(points), [no])
  if (idx < 0) return <Navigate to="/kit" replace />
  const prev = OLLE_ORDER[idx - 1]
  const next = OLLE_ORDER[idx + 1]
  const sub = isSubCourse(no)
  const title = fixName(first?.name).replace(/\([AB]\)$/, '') || (base ? `${base.from[0]} → ${base.to[0]}` : '')

  return (
    <div className="page">
      <header className="page-head" style={{ '--c': '#2f9e44' }}>
        <Link to="/kit" className="back"><i className="bi bi-arrow-left" />주제별 정보</Link>
        <h1><i className="bi bi-signpost-split" style={{ color: '#2f9e44' }} />올레 {no}코스{sub ? ' (부속 코스)' : ''}</h1>
        {title && <p className="lead">{title}</p>}
      </header>

      <section className="kit-block">
        {olle.loading && !base ? <Loading /> : (
          <>
            {olle.error && !rows.length && <ApiError error={olle.error} onRetry={olle.reload} />}
            {rows.length > 0 ? (
              <div className="olle-info">
                {rows.map((c) => (
                  <div key={c.name} className="olle-course">
                    <strong>{fixName(c.name) || `${no}코스`}</strong>
                    <p className="muted">
                      {c.km && <><i className="bi bi-rulers" /> {c.km}</>}
                      {c.time && <> · <i className="bi bi-clock" /> {c.time}</>}
                    </p>
                    {c.ends && <p className="muted small"><i className="bi bi-flag" /> {c.ends.replace(/-/g, ' → ')}</p>}
                  </div>
                ))}
              </div>
            ) : base && (
              <div className="olle-info">
                <div className="olle-course">
                  <strong>{base.from[0]} → {base.to[0]}</strong>
                  <p className="muted small">거리·소요 시간은 지금 불러오지 못했어요. 아래 공식 사이트에서 확인하세요.</p>
                </div>
              </div>
            )}
            {rows.length > 1 && <p className="muted small">같은 번호에 길이가 다른 코스가 여럿 있어요. 위 정보를 비교해 보세요.</p>}
            <p className="place-text">
              {start && end && start !== end
                ? `${start}에서 출발해 ${end}까지 걷는 코스예요.`
                : start ? `${start}에서 출발해 한 바퀴 도는 코스예요.` : ''}
              {sub
                ? ' 본 코스 사이에서 섬(우도·가파도·추자도 등)이나 샛길을 돌아보는 부속 코스예요.'
                : prev || next ? ` 올레길은 코스가 이어져 있어서${prev && !isSubCourse(prev) ? ` ${prev}코스에서 이어 걷거나` : ''}${next && !isSubCourse(next) ? ` ${next}코스로 이어서 걸을 수 있어요.` : ' 걸을 수 있어요.'}` : ''}
            </p>
          </>
        )}
      </section>

      {[['spot', 'bi-geo-alt', '시·종점 주변 가볼 곳', '가볼 곳'], ['activity', 'bi-bicycle', '시·종점 주변 체험·레포츠', '체험'], ['food', 'bi-cup-hot', '시·종점 주변 맛집·카페', '맛집·카페'], ['stay', 'bi-house-door', '시·종점 주변 숙소', '숙소']].map(([key, icon, heading, badge]) => (
        <section key={key} className="kit-block">
          <h2><i className={`bi ${icon}`} />{heading} <small className="muted">(5km 안 · 가까운 순 · 한국관광공사)</small></h2>
          {places.loading ? <Loading /> : places.error ? <ApiError error={places.error} onRetry={places.reload} />
            : !places.data?.[key]?.length ? <Empty text="이 근처에서 찾은 장소가 없어요." /> : (
              <div className="cards">
                {places.data[key].map((p) => (
                  <ItemCard key={p.id} title={p.title} subtitle={`${p.from} 근처 ${kmText(p.dist)} · ${p.addr}`} image={p.image} badge={badge}
                    onSave={() => addNote({ source: 'tour', id: String(p.id), title: p.title })} />
                ))}
              </div>
            )}
        </section>
      ))}

      <section className="kit-block">
        <div className="olle-nav">
          {prev ? <Link className="btn btn-ghost" to={`/olle/${prev}`}><i className="bi bi-chevron-left" />{prev}코스</Link> : <span />}
          <Link className="btn btn-ghost" to="/kit"><i className="bi bi-list" />전체 코스</Link>
          {next ? <Link className="btn btn-ghost" to={`/olle/${next}`}>{next}코스<i className="bi bi-chevron-right" /></Link> : <span />}
        </div>
        <p className="notice"><i className="bi bi-info-circle" />코스 상태와 정확한 경로는 바뀔 수 있어요. 걷기 전에 <a href="https://www.jejuolle.org" target="_blank" rel="noreferrer">제주올레 공식 사이트</a>와 올레패스 앱을 확인하세요.</p>
      </section>
    </div>
  )
}
