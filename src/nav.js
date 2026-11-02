// 페이지를 추가할 때: ① pages/ 에 파일 ② 아래 NAV_ITEMS 한 줄 ③ router.jsx 의 routes 한 줄
// 아이콘 이름: https://icons.getbootstrap.com
export const NAV_ITEMS = [
  { to: '/', label: '스튜디오', icon: 'house-heart' },
  { to: '/discover', label: '청년 탐색', icon: 'balloon-heart' },
  { to: '/explore', label: '3D 탐색', icon: 'badge-3d' },
  { to: '/jejueo', label: '제주어', icon: 'chat-quote' },
  { to: '/kit', label: '주제별 정보', icon: 'box2-heart' },
  { to: '/guide', label: 'AI 가이드', icon: 'stars' },
  { to: '/notes', label: '내 노트', icon: 'journal-bookmark-fill' },
]
