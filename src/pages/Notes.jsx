import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Empty, Loading } from '../components/Status'
import { themeOf } from '../data/themes'
import { isSupabaseReady } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

function Note({ note }) {
  const { updateMemo, removeNote } = useAppStore()
  const [draft, setDraft] = useState(note.memo)
  const dirty = draft !== note.memo
  return (
    <article className="note">
      <div className="note-top">
        <span className={`tag ${note.source}`}>{note.source === 'tour' ? '장소·전시' : '국가유산'}</span>
        <time className="muted">{new Date(note.created_at).toLocaleDateString('ko-KR')}</time>
      </div>
      <h3>{note.title}</h3>
      <textarea className="input" rows={3} placeholder="이 소재로 만들고 싶은 것, 떠오른 아이디어를 적어 두세요" value={draft} onChange={(e) => setDraft(e.target.value)} />
      <div className="note-actions">
        <button type="button" className="btn btn-primary btn-sm" disabled={!dirty} onClick={() => updateMemo(note.id, draft)}>메모 저장</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeNote(note.id)}><i className="bi bi-trash3" />삭제</button>
      </div>
    </article>
  )
}

export default function Notes() {
  const { nickname, setNickname, notes, notesLoading, loadNotes } = useAppStore()
  useEffect(() => { loadNotes() }, [nickname, loadNotes])

  // 테마별로 묶기
  const groups = notes.reduce((acc, n) => { (acc[n.theme ?? 'all'] ??= []).push(n); return acc }, {})

  return (
    <div className="page">
      <header className="page-head">
        <h1><i className="bi bi-journal-bookmark-fill" />내 소재 노트</h1>
        <p className="muted">저장한 소재와 메모 — Supabase <code>tamna_notes</code> 테이블에 저장돼서 새로고침해도 남아요.</p>
        <input className="input short" placeholder="닉네임" maxLength={20} value={nickname} onChange={(e) => setNickname(e.target.value)} />
        {!isSupabaseReady && <p className="notice"><i className="bi bi-database-x" />Supabase 가 연결되지 않았어요. <code>.env.local</code> 을 채우고 서버를 다시 켜세요.</p>}
      </header>

      {notesLoading ? <Loading /> : notes.length === 0 ? (
        <Empty text="아직 저장한 소재가 없어요. 주제별 정보나 3D 탐색에서 저장해 보세요." />
      ) : (
        Object.entries(groups).map(([key, list]) => {
          const t = themeOf(key)
          return (
            <section key={key} className="kit-block" style={{ '--c': t.color }}>
              <h2 className="group-title"><i className={`bi bi-${t.icon}`} />{t.label}<small>{list.length}</small></h2>
              <div className="cards notes">{list.map((n) => <Note key={n.id} note={n} />)}</div>
            </section>
          )
        })
      )}
      {notes.length === 0 && !notesLoading && <p className="center"><Link to="/kit" className="btn btn-primary"><i className="bi bi-box2-heart" />주제별 정보 보기</Link></p>}
    </div>
  )
}
