import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const EXAMPLES = [
  '제주시 지금 날씨 어때? 오름 촬영 가도 돼?',
  '관덕정이 어떤 국가유산이야?',
  '해녀를 소재로 전시 준비 중인데, 내일 서귀포에 비 오면 볼 만한 실내 장소 알려줘',
  '제주에 에펠탑 알려줘',
]

const TOOL_LABEL = { search_tour_places: '장소 검색', get_weather: '날씨 조회', search_heritage: '국가유산 검색' }

export default function Guide() {
  const { messages, chatLoading, sendMessage, clearChat } = useAppStore()
  const [params] = useSearchParams()
  const [input, setInput] = useState(params.get('q') ?? '') // 장소 화면에서 넘어오면 질문이 미리 채워져요
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, chatLoading])

  function submit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || chatLoading) return
    sendMessage(text)
    setInput('')
  }
  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e) // 한글 조합 중 Enter 는 무시
  }

  return (
    <div className="page narrow">
      <header className="page-head">
        <h1><i className="bi bi-stars" />AI 소재 가이드</h1>
        <p className="muted">장소·날씨·유산 API 를 도구로 삼아, 에이전트가 스스로 골라 호출한 뒤 답해요.</p>
      </header>

      <div className="chat glass">
        {messages.length === 0 && (
          <div className="examples">
            <div className="eyebrow">이렇게 물어보세요</div>
            {EXAMPLES.map((q) => (
              <button key={q} type="button" className="example" disabled={chatLoading} onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.steps?.length > 0 && (
              <div className="tools">
                <span className="muted"><i className="bi bi-tools" />에이전트가 호출한 도구</span>
                {m.steps.map((s, k) => (
                  <span key={k} className="tool" title={JSON.stringify(s.args)}>
                    {TOOL_LABEL[s.tool] ?? s.tool} <small>{s.tool}({Object.values(s.args ?? {}).join(', ')}) → {s.count}건</small>
                  </span>
                ))}
              </div>
            )}
            {m.text}
          </div>
        ))}
        {chatLoading && <div className="bubble assistant typing"><span className="spinner" />에이전트가 도구를 고르는 중…</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="composer">
        <textarea className="input" rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey}
          placeholder="질문을 입력하세요 (Enter 전송 · Shift+Enter 줄바꿈)" maxLength={500} />
        <button type="submit" className="btn btn-primary" disabled={chatLoading || !input.trim()} aria-label="보내기"><i className="bi bi-send-fill" /></button>
        {messages.length > 0 && <button type="button" className="btn btn-ghost" onClick={clearChat} aria-label="대화 지우기"><i className="bi bi-trash3" /></button>}
      </form>
    </div>
  )
}
