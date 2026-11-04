import { useState } from 'react'

// 제주로 이사 온 사람이 챙길 일. 체크한 상태는 이 기기(브라우저)에만 저장돼요.
const GROUPS = [
  { title: '이사 전', emoji: '📦', items: [
    ['truck', '이삿짐·차량을 배로 보내는 일정과 추가 요금 확인'],
    ['net', '인터넷·TV 이전 신청'],
    ['old', '살던 집 전기·가스·수도 요금 정산'],
  ] },
  { title: '이사 후 14일 안에', emoji: '📝', items: [
    ['move', '전입신고 (정부24 인터넷 또는 주민센터)'],
    ['fix', '전세·월세면 확정일자 받기'],
    ['car', '자동차가 있으면 주소 변경'],
    ['lic', '운전면허증 주소 변경 (전입신고 때 함께 되는지 주민센터에 물어보기)'],
  ] },
  { title: '동네에 적응하기', emoji: '🏡', items: [
    ['trash', '클린하우스 위치와 쓰레기 배출 방법 확인'],
    ['hosp', '가까운 약국·병원·응급실 위치 저장'],
    ['storm', '태풍·대설에 대비한 비상용품 준비'],
    ['tamna', '탐나는전 사용처와 청년 지원 정책 살펴보기'],
  ] },
]
const KEY = 'tamna-move-checklist'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? {} } catch { return {} } }

export default function MoveChecklist() {
  const [done, setDone] = useState(read)
  const total = GROUPS.reduce((n, g) => n + g.items.length, 0)
  const count = Object.values(done).filter(Boolean).length
  const toggle = (id) => setDone((d) => {
    const next = { ...d, [id]: !d[id] }
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* 저장이 막혀도 화면은 동작해요 */ }
    return next
  })
  return (
    <div className="checklist">
      <p className="check-progress"><b>{count}</b> / {total} 완료 <span className="bar" aria-hidden="true"><i style={{ width: `${(count / total) * 100}%` }} /></span></p>
      {GROUPS.map((g) => (
        <section key={g.title} className="check-group">
          <h3><span aria-hidden="true">{g.emoji}</span> {g.title}</h3>
          {g.items.map(([id, text]) => (
            <label key={id} className={`check-item${done[id] ? ' done' : ''}`}>
              <input type="checkbox" checked={!!done[id]} onChange={() => toggle(id)} />
              <span>{text}</span>
            </label>
          ))}
        </section>
      ))}
      <p className="muted small">체크한 내용은 이 기기에만 저장돼요. 기한과 서류는 주민센터에서 한 번 더 확인하세요.</p>
    </div>
  )
}
