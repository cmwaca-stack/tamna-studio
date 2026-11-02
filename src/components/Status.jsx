// 데이터·로딩·에러 3종 세트 — 모든 목록 화면이 공통으로 씁니다
export function Loading({ text = '불러오는 중…' }) {
  return <div className="state"><span className="spinner" />{text}</div>
}
export function ErrorBox({ error }) {
  if (!error) return null
  return <div className="state error"><i className="bi bi-exclamation-triangle" />{String(error)}</div>
}
export function Empty({ text = '결과가 없어요. 다른 검색어로 찾아보세요.' }) {
  return <div className="state"><i className="bi bi-inbox" />{text}</div>
}

// API 오류 표시. 공공데이터 키 문제면 "무엇을 하면 되는지" 안내 카드를, 그 밖의 오류면 메시지 + 다시 시도 버튼을 보여 줍니다.
const KEY_ISSUE = /DATA_GO_KR_KEY|SERVICE_KEY|키가 등록|활용신청|호출 한도/
export function ApiError({ error, onRetry }) {
  if (!error) return null
  const retry = onRetry && (
    <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}><i className="bi bi-arrow-clockwise" />다시 시도</button>
  )
  if (!KEY_ISSUE.test(error)) {
    return <div className="state error"><i className="bi bi-exclamation-triangle" />{String(error)}{retry}</div>
  }
  return (
    <div className="setup">
      <div className="setup-head"><i className="bi bi-key" /><strong>공공데이터 키 설정이 필요해요</strong></div>
      <p className="muted">{String(error)}</p>
      <ol>
        <li>data.go.kr 마이페이지 → <b>활용신청 현황</b>에서 한국관광공사 TourAPI(KorService2)와 기상청 단기예보가 <b>승인</b> 상태인지 확인</li>
        <li><b>일반 인증키(Decoding)</b>를 복사</li>
        <li>프로젝트 루트의 <code>.env.local</code>에 <code>DATA_GO_KR_KEY=키값</code> 저장 (따옴표·공백 없이, 파일명이 <code>.env.local.txt</code>가 아닌지 확인)</li>
        <li>터미널에서 <code>Ctrl+C</code> → <code>npm run dev</code> 로 서버 재시작</li>
      </ol>
      <p className="muted">국가유산 검색은 키 없이도 동작해요.</p>
      {retry}
    </div>
  )
}
