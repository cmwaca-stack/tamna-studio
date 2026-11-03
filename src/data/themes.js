// 제주 IP 소재 테마. 테마를 고르면 3개 공공 API 를 이 키워드로 한꺼번에 조회합니다.
//  keyword          → 한국관광공사 TourAPI 검색어 (장소·전시·행사)
//  heritageKeyword  → 국가유산청 검색어 (비우면 제주 전체 유산)
export const THEMES = [
  {
    key: 'oreum', label: '오름', icon: 'triangle', color: '#80b918',
    keyword: '오름', heritageKeyword: '', kitKeyword: '오름|분화구|탐방로|오름 트레킹', kitHeritage: false, spots: 'oreum', noHeritage: true, spotColor: '#2f9e44', spotLabel: '오름', spotNote: '제주 전역의 오름 위치를 핀으로 표시해요.',
    blurb: '368개의 작은 화산. 계절·빛에 따라 달라지는 풍경 촬영 소재.',
    ideas: ['오름 타임랩스 영상', '등고선 포스터', '오름 스탬프 투어 앱'],
  },
  {
    key: 'myth', label: '신화·설화', icon: 'stars', color: '#b388eb',
    keyword: '신화', heritageKeyword: '삼성혈', kitKeyword: '신화|설문대|삼성혈|설화|전설|영등|신당', kitHeritage: '삼성혈|산방산|영주십경|신당', spots: 'myth', spotColor: '#7048e8', spotLabel: '신화·설화 장소', spotNote: '신화와 전설이 깃든 장소를 제주 전역에 핀으로 표시해요.',
    blurb: '설문대할망, 삼성혈, 1만 8천 신들. 세계관을 만들기 좋은 이야기 소재.',
    ideas: ['설문대할망 웹툰', '신화 속 장소 AR 전시', '신들의 카드 게임'],
  },
  {
    key: 'jeju43', label: '4·3', icon: 'flower1', color: '#e5989b', sensitive: true,
    keyword: '4·3', heritageKeyword: '', kitKeyword: '4·3|평화공원|너븐숭이|북촌|다랑쉬|낙선동|동광', kitHeritage: false, spots: 'jeju43', spotsOnly: true, spotColor: '#d6336c', spotLabel: '4·3 희생지·유적', spotNote: '제주 전역의 4·3 희생지·유적을 핀으로 표시해요.',
    blurb: '기억하고 존중해야 할 역사. 가볍게 소비하지 않는 기록과 추모 중심의 소재.',
    ideas: ['추모 기록 아카이브 전시', '증언 기반 다큐', '평화공원 답사 가이드'],
  },
  {
    key: 'history', label: '제주역사', icon: 'bank', color: '#ffb703',
    keyword: '유적', heritageKeyword: '', kitKeyword: '유적|읍성|향교|항몽|추사|목관아|환해장성|산성|삼양동', kitHeritage: '읍성|산성|향교|관덕정|봉수|항파두리|추사|방사탑|환해장성|연대', spots: 'history', spotColor: '#e8590c', spotLabel: '역사 유적지', spotNote: '제주를 대표하는 역사 유적지를 핀으로 표시해요.',
    blurb: '탐라국부터 조선 유배, 항몽·근현대까지. 천 년의 이야기가 쌓인 유적을 소재로.',
    ideas: ['유적지 스탬프 투어 앱', '탐라 건국 신화 웹툰', '유배 문화 다큐'],
  },
  // 올레길: 홈의 '청년 탐색' 줄에서 선택 (칩 줄에는 숨김). 3D 제주 위에 1~21코스를 선으로 그려요.
  {
    key: 'olle', label: '올레길', icon: 'signpost-split', color: '#2f9e44',
    keyword: '올레', heritageKeyword: '', spotsOnly: true, routes: 'olle', spotSets: [{ key: 'olle', color: '#2f9e44', label: '올레길 시·종점' }],
    spotNote: '제주올레 1~21코스를 3D 제주 위에 선으로 보여줘요. 핀은 코스의 시·종점이고, 선은 시·종점 사이를 해안선을 따라 이은 개략선이에요.',
    blurb: '섬을 한 바퀴 도는 21개 코스. 걸으며 만나는 바다·오름·마을을 소재로.',
    ideas: ['코스별 스탬프 지도 굿즈', '올레길 도보 여행 영상', '코스 일러스트 포스터'],
  },
  // 도로 CCTV: 교통정보 화면의 '3D 지도에서 위치 보기'로 진입 (칩 줄에는 숨김). 제주시 적설 감시 CCTV 위치를 핀으로 표시
  {
    key: 'cctv', label: '도로 CCTV', icon: 'camera-video', color: '#7048e8', hidden: true, cctv: true,
    keyword: '', heritageKeyword: '', spotsOnly: true,
    spotNote: '제주시 적설 감시 CCTV 위치예요. 핀을 누르면 그 도로의 영상을 볼 수 있어요(영상 서버가 열려 있을 때).',
    blurb: '눈·결빙이 잦은 산간도로를 지켜보는 CCTV. 출발 전에 도로 상황을 확인하세요.',
    ideas: [],
  },
  // 제주어는 3D 핀이 아니라 제주도청 OpenAPI 사전 화면(/jejueo)으로 이동합니다
  { key: 'jejueo', label: '제주어', icon: 'chat-quote', color: '#ffb703', href: '/jejueo', keyword: '제주어', heritageKeyword: '', blurb: '제주도청 OpenAPI로 방언사전·생활방언·속담을 찾아보세요.', ideas: ['제주어 타이포 굿즈', '일상 제주어 이모티콘', '제주어 낭독 영상'] },
]

// 테마의 고정 핀 묶음. spotSets(여러 묶음)가 없으면 spots 하나를 묶음으로 취급
export const spotSetsOf = (t) => t.spotSets ?? (t.spots ? [{ key: t.spots, color: t.spotColor, label: t.spotLabel }] : [])

export const themeOf = (key) => THEMES.find((t) => t.key === key) ?? THEMES[0]

// TourAPI contentTypeId
export const PLACE_TYPES = { 14: '전시·문화시설', 15: '축제·행사', 12: '답사 명소' }
