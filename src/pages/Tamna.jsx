import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Chips from '../components/Chips'
import { ApiError, Empty, Loading } from '../components/Status'
import { useAsync } from '../hooks/useAsync'
import { useAppStore } from '../store/useAppStore'
import { mapSearch } from '../lib/kakaoLink'

// 제주특별자치도 "탐나는전 가맹점 데이터"(공공데이터포털 15157894, 2026-03-31 기준). scripts/build-tamna.cjs 가 만든 public/tamna.json 을 읽어요.
// 한 줄: [가맹점명, 주소, 업종 번호, 비트(1 캐시백·인센티브, 2 QR, 4 아동건강체험활동비)]
const PAGE = 24
const CAT_EMOJI = {
  '음식점/식음료업': '🍽️', '여행/숙박': '🛏️', '자동차/주유': '⛽', '보건/복지': '🏥', '생활/리빙': '🏡', '식자재/유통': '🥬', '건축/철물': '🧱',
  '문화/체육': '🎳', '의류/잡화': '👕', '가전/통신': '📱', '가구/인테리어': '🛋️', '귀금속': '💍', '디자인/인쇄': '🖨️',
}
const FLAGS = [
  { bit: 1, label: '캐시백·인센티브', icon: 'piggy-bank' },
  { bit: 2, label: 'QR 결제', icon: 'qr-code' },
  { bit: 4, label: '아동건강체험활동비', icon: 'balloon-heart' },
]
const AREAS = [{ key: '', label: '제주 전체' }, { key: '제주시', label: '제주시' }, { key: '서귀포시', label: '서귀포시' }]

let loading = null
const loadTamna = () => (loading ??= fetch('/tamna.json').then((r) => { if (!r.ok) throw new Error(`가맹점 자료를 불러오지 못했어요 (${r.status})`); return r.json() }).catch((e) => { loading = null; throw e }))

export default function Tamna() {
  const data = useAsync(loadTamna, [])
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(-1) // -1: 전체 업종
  const [area, setArea] = useState('')
  const [flags, setFlags] = useState(0)
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const setThemeKey = useAppStore((s) => s.setThemeKey)
  const goTheme = (k) => { setThemeKey(k); navigate('/kit') }

  useEffect(() => setPage(1), [q, cat, area, flags])

  const rows = data.data?.rows
  const catCount = useMemo(() => {
    if (!data.data) return []
    const n = data.data.cats.map(() => 0)
    data.data.rows.forEach((r) => { n[r[2]] += 1 })
    return n
  }, [data.data])
  const stat = useMemo(() => (rows ? FLAGS.map((f) => rows.filter((r) => r[3] & f.bit).length) : []), [rows])

  const list = useMemo(() => {
    if (!rows) return []
    const w = q.trim().toLowerCase()
    return rows.filter((r) => (cat < 0 || r[2] === cat) && (!area || r[1].startsWith(area)) && (r[3] & flags) === flags && (!w || r[0].toLowerCase().includes(w) || r[1].toLowerCase().includes(w)))
  }, [rows, q, cat, area, flags])
  const last = Math.max(1, Math.ceil(list.length / PAGE))
  const shown = list.slice((page - 1) * PAGE, page * PAGE)
  const topCats = data.data ? data.data.cats.map((n, i) => ({ n, i, c: catCount[i] })).sort((a, b) => b.c - a.c).slice(0, 8).sort((a, b) => (a.n === '기타') - (b.n === '기타')) : [] // 기타는 맨 뒤

  return (
    <div className="page">
      <header className="page-head">
        <h1><i className="bi bi-coin" style={{ color: '#ff7b54' }} />탐나는전 <small className="muted">· 제주 지역화폐</small></h1>
        <p className="muted">탐나는전을 쓸 수 있는 가맹점을 찾아보세요. 이름이나 동네로 검색하고, 업종·캐시백·QR 결제 여부로 골라 볼 수 있어요.</p>
        <Chips value="tamna" onChange={goTheme} />
      </header>

      <section className="kit-block" aria-label="탐나는전 소개">
        <div className="block-head"><h2><i className="bi bi-coin" />탐나는전이 뭐예요?</h2></div>
        <div className="notice calm" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src="/tamna-card.png" alt="탐나는전 카드: 제주지역화폐 탐나는전" width="150" height="237" loading="lazy" style={{ flex: 'none', width: 150, height: 237, objectFit: 'cover', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.12)' }} />
          <div style={{ minWidth: 0, display: 'grid', gap: '.5rem' }}>
            <p style={{ margin: 0 }}><b>제주특별자치도가 발행하고 도내 가맹점에서만 쓰는 제주 전용 지역화폐</b>예요. 카드형·모바일형·지류형이 있어요.</p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '.25rem' }}>
              <li><b>누가</b> — 도민·관광객·가맹점주 모두 쓸 수 있고, 카드 발급·충전·이용은 도민이 아니어도 돼요.</li>
              <li><b>시작</b> — 앱을 설치하면 카드를 신청하지 않아도 충전·결제가 돼요. 남은 충전금은 앱에서 환불받을 수 있어요.</li>
              <li><b>캐시백</b> — 가게마다 달라요(영세 가맹점만 적립, 반기마다 변경). 앱 가맹점 목록의 '캐시백 사용·적립 가맹점' 태그로 확인하세요. 위 목록 표시는 {data.data?.asOf ?? '2026-03-31'} 자료예요.</li>
              <li><b>아이 체험비</b> — 2026년 아동건강체험활동비를 쓸 수 있는 가맹점은 {data.data ? stat[2].toLocaleString() : '1,233'}곳이에요.</li>
            </ul>
            <p style={{ margin: 0 }}>
              <a className="btn btn-primary btn-sm" href="https://tamna.bizplay.co.kr/view/main" target="_blank" rel="noreferrer"><i className="bi bi-box-arrow-up-right" /> 탐나는전 공식 사이트에서 앱 설치·카드 신청</a>
            </p>
            <p className="muted small" style={{ margin: 0 }}>출처: 탐나는전 공식 사이트(2026년 10월 기준)</p>
          </div>
        </div>
      </section>

      <p className="notice"><i className="bi bi-info-circle" />출처: {data.data?.source ?? '제주특별자치도 탐나는전 가맹점 데이터'} · 연 1회 갱신되는 자료라 최근에 바뀐 가맹점은 반영되지 않을 수 있어요. 결제 전에 가게에 한 번 확인해 주세요.</p>

      {data.data && (
        <section className="kit-block">
          <div className="cards">
            <article className="place-row"><strong>🏪 가맹점 {data.data.rows.length.toLocaleString()}곳</strong><span className="muted">{data.data.asOf} 기준 제주특별자치도 자료</span></article>
            {FLAGS.map((f, k) => (
              <article key={f.bit} className="place-row"><strong><i className={`bi bi-${f.icon}`} /> {f.label} {stat[k].toLocaleString()}곳</strong><span className="muted">{Math.round((stat[k] / data.data.rows.length) * 100)}%의 가맹점</span></article>
            ))}
          </div>
        </section>
      )}

      <div className="block-head">
        <div className="seg" role="tablist" aria-label="지역">
          {AREAS.map((a) => <button key={a.key || 'all'} type="button" role="tab" aria-selected={area === a.key} className={area === a.key ? 'on' : ''} onClick={() => setArea(a.key)}>{a.label}</button>)}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setQ(input.trim()) }} className="search jejueo-search">
          <input className="input" value={input} onChange={(e) => { setInput(e.target.value); if (!e.target.value) setQ('') }} placeholder="가게 이름·동네 (예: 협재, 약국)" aria-label="가맹점 검색" />
          <button type="submit" className="btn btn-primary" aria-label="검색"><i className="bi bi-search" /></button>
        </form>
      </div>

      <div className="chips" role="group" aria-label="업종">
        <button type="button" className={`chip${cat < 0 ? ' on' : ''}`} style={{ '--c': '#ff7b54' }} onClick={() => setCat(-1)}>전체 업종</button>
        {topCats.map(({ n, i, c }) => (
          <button key={n} type="button" className={`chip${cat === i ? ' on' : ''}`} style={{ '--c': '#ff7b54' }} onClick={() => setCat(cat === i ? -1 : i)}>{CAT_EMOJI[n] ?? '🏷️'} {n.replace('/', '·')} <small>{c.toLocaleString()}</small></button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="혜택">
        {FLAGS.map((f) => (
          <button key={f.bit} type="button" className={`chip${flags & f.bit ? ' on' : ''}`} style={{ '--c': '#2f9e44' }} onClick={() => setFlags(flags ^ f.bit)}><i className={`bi bi-${f.icon}`} />{f.label}만</button>
        ))}
      </div>

      <p className="muted">{data.data ? `조건에 맞는 가맹점 ${list.length.toLocaleString()}곳` : ''}</p>
      <ApiError error={data.error} onRetry={data.reload} />
      {data.loading ? <Loading /> : data.error ? null : !shown.length ? (
        <Empty text="조건에 맞는 가맹점이 없어요. 검색어나 업종을 바꿔 보세요." />
      ) : (
        <>
          <div className="cards">
            {shown.map((r, k) => (
              <article key={`${r[0]}-${r[1]}-${k}`} className="place-row">
                <strong>{CAT_EMOJI[data.data.cats[r[2]]] ?? '🏷️'} <a href={mapSearch(`${r[1].replace(/\s*\(.*?\)\s*/g, ' ').trim()} ${r[0]}`.slice(0, 60))} target="_blank" rel="noreferrer" title="다음지도에서 위치 보기">{r[0]}</a></strong>
                <span className="muted">{r[1]}</span>
                <span className="muted small">{data.data.cats[r[2]].replace('/', '·')}{FLAGS.filter((f) => r[3] & f.bit).map((f) => ` · ${f.label}`).join('')}</span>
              </article>
            ))}
          </div>
          <div className="pager">
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><i className="bi bi-chevron-left" />이전</button>
            <span className="muted">{page} / {last.toLocaleString()}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= last} onClick={() => setPage(page + 1)}>다음<i className="bi bi-chevron-right" /></button>
          </div>
        </>
      )}
    </div>
  )
}
