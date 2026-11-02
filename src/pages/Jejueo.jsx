import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Chips from '../components/Chips'
import { useAppStore } from '../store/useAppStore'
import { ApiError, Empty, Loading } from '../components/Status'
import { fetchJejueo } from '../api/client'
import { useAsync } from '../hooks/useAsync'

// 제주도청 제주어 OpenAPI 3종 (B01 방언사전 · B02 생활방언 · B03 속담사전)
const KINDS = [
  { key: 'dialect', label: '방언사전', icon: 'book', note: '제주 방언 단어와 뜻' },
  { key: 'life', label: '생활방언', icon: 'chat-heart', note: '일상 속 제주어 표현' },
  { key: 'adage', label: '속담사전', icon: 'quote', note: '제주 속담과 풀이' },
]
const TYPES = {
  '': '전체', DETI: '때·기후', DEIN: '인륜', DEJI: '지리', DESK: '천문', DEMA: '신체', DEHO: '집', DEFO: '음식', DEBO: '복식',
  DERO: '농경', DEMU: '무속', DENA: '날짐승', DEJS: '짐승', DEWA: '물동물', DECM: '초목', DEGS: '지명', DE04: '느낌씨',
}

// 음성은 서버(/api/audio)를 거쳐 재생합니다. 실패하면 원인(서버가 알려 준 메시지)과 원본 링크를 보여 줍니다.
function Sound({ url, title }) {
  const [err, setErr] = useState('')
  const src = `/api/audio?u=${encodeURIComponent(url)}`
  async function onError() {
    try {
      const r = await fetch(src)
      const j = r.ok ? null : await r.json()
      setErr(/음성 파일이 아니라/.test(j?.error ?? '') ? '이 항목은 음성 파일이 제공되지 않아요' : (j?.error ?? '재생할 수 없는 파일이에요'))
    } catch { setErr('재생할 수 없는 파일이에요') }
  }
  return (
    <div className="sound">
      <audio controls preload="none" src={src} aria-label={`${title} 발음`} onError={onError} onPlay={() => setErr('')} />
      {err && <small className="notice-inline"><i className="bi bi-exclamation-triangle" /> {err} · <a href={url} target="_blank" rel="noreferrer">원본 열기</a></small>}
    </div>
  )
}

function Word({ w, kind }) {
  return (
    <article className="word-card">
      <header>
        <h3>{w.title}</h3>
        {w.tag && <span className="tag">{w.tag}</span>}
      </header>
      {w.image && <img className="word-img" src={`/api/audio?kind=image&u=${encodeURIComponent(w.image)}`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
      {w.sound && <Sound url={w.sound} title={w.title} />}
      <p>{w.meaning}</p>
      {w.eng && <small className="muted">{w.eng}</small>}
      {kind === 'life' && w.old && w.old !== w.title && <small className="muted">원문: {w.old}</small>}
    </article>
  )
}

export default function Jejueo() {
  const [kind, setKind] = useState('dialect')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const data = useAsync(() => fetchJejueo(kind, { page, q, type }), [kind, page, q, type])
  const cur = KINDS.find((k) => k.key === kind)
  const last = data.data ? Math.max(1, Math.ceil(data.data.total / data.data.pageSize)) : 1

  const navigate = useNavigate()
  const setThemeKey = useAppStore((s) => s.setThemeKey)
  const goTheme = (k) => { setThemeKey(k); navigate('/kit') } // 다른 주제를 누르면 주제별 정보 화면으로

  function pickKind(k) { setKind(k); setPage(1); setQ(''); setInput(''); setType('') }
  function search(e) { e.preventDefault(); setPage(1); setQ(input.trim()) }

  return (
    <div className="page">
      <header className="page-head">
        <h1><i className="bi bi-chat-quote" style={{ color: '#ffb703' }} />제주어</h1>
        <p className="muted">제주특별자치도청 OpenAPI로 제주 방언사전·생활방언·속담을 찾아보세요. "혼저 옵서예"를 오늘의 소재로.</p>
        <Chips value="jejueo" onChange={goTheme} />
      </header>

      <div className="block-head">
        <div className="seg" role="tablist">
          {KINDS.map((k) => (
            <button key={k.key} type="button" role="tab" aria-selected={kind === k.key} className={kind === k.key ? 'on' : ''} onClick={() => pickKind(k.key)}>
              <i className={`bi bi-${k.icon}`} /> {k.label}
            </button>
          ))}
        </div>
        <form onSubmit={search} className="search jejueo-search">
          <input className="input" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={kind === 'dialect' ? '제주어 단어 검색 (예: 옵서)' : '현재 페이지에서 검색'} />
          <button type="submit" className="btn btn-primary" aria-label="검색"><i className="bi bi-search" /></button>
        </form>
      </div>
      <p className="muted">{cur.note}{data.data ? ` · 전체 ${data.data.total.toLocaleString()}건` : ''}</p>

      {kind === 'dialect' && (
        <div className="seg jejueo-types">
          {Object.entries(TYPES).map(([code, label]) => (
            <button key={code || 'all'} type="button" className={type === code ? 'on' : ''} onClick={() => { setType(code); setPage(1) }}>{label}</button>
          ))}
        </div>
      )}

      <ApiError error={data.error} onRetry={data.reload} />
      {data.loading ? <Loading /> : data.error ? null : !data.data?.items.length ? (
        <Empty text="검색 결과가 없어요. 다른 단어나 분류로 찾아보세요." />
      ) : (
        <>
          <div className="cards words">{data.data.items.map((w) => <Word key={`${kind}-${w.id}-${w.title}`} w={w} kind={kind} />)}</div>
          <div className="pager">
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><i className="bi bi-chevron-left" />이전</button>
            <span className="muted">{page} / {last}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= last} onClick={() => setPage(page + 1)}>다음<i className="bi bi-chevron-right" /></button>
          </div>
        </>
      )}
      <p className="notice"><i className="bi bi-info-circle" />옛한글 전용 글자는 아래아(ㆍ)로 근사해서 보여 줘요. 출처: 제주특별자치도청 OpenAPI.</p>
    </div>
  )
}
