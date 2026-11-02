// 페이지를 추가할 때: ① pages/ 에 파일 ② 아래 NAV_ITEMS 한 줄 ③ router.jsx 의 routes 한 줄
// 아이콘 이름: https://icons.getbootstrap.com
export const NAV_ITEMS = [
  { to: '/', label: '스튜디오', icon: 'house-heart' },
  { to: '/kit', label: '주제별 검색', icon: 'search', also: ['/jejueo'] },
  { to: '/guide', label: 'AI 가이드', icon: 'stars' },
  { to: '/links/press', label: '제주언론사', icon: 'newspaper' },
  { to: '/links/community', label: '제주커뮤니티', icon: 'people' },
  { to: '/links/public', label: '공공기관', icon: 'bank' },
]
