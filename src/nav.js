// 페이지를 추가할 때: ① pages/ 에 파일 ② 아래 NAV_ITEMS 한 줄 ③ router.jsx 의 routes 한 줄
// 아이콘 이름: https://icons.getbootstrap.com
export const NAV_ITEMS = [
  { to: '/', label: '홈', icon: 'house-heart' },
  // 주제별 검색을 누르면 생활정보가 먼저 선택된 화면이 열려요. 아래 화면들에서도 이 메뉴가 선택된 것으로 보여요.
  { to: '/discover/life', label: '주제별 검색', icon: 'search', also: ['/kit', '/explore', '/jejueo', '/tamna', '/links/hospital', '/discover/weekend', '/discover/food', '/discover/photo', '/discover/traffic', '/discover/flight', '/discover/policy', '/discover/olle'] },
  { to: '/links/press', label: '제주언론사', icon: 'newspaper' },
  { to: '/links/community', label: '제주커뮤니티', icon: 'people' },
  { to: '/links/public', label: '공공기관', icon: 'bank' },
  { to: '/guide', label: 'AI 검색', icon: 'stars' },
]
