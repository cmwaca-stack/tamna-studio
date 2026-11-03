// 청년 탐색 카테고리. 카드를 누르면 /discover/:slug 로 이동하고, 탭마다 한국관광공사 TourAPI 를 다른 조건으로 조회합니다.
//  tabs[].type    → TourAPI contentTypeId (12 관광지 · 14 문화시설 · 15 축제·행사 · 28 레포츠 · 38 쇼핑 · 39 음식점·카페)
//  tabs[].keyword → 검색어 (비우면 해당 분류 전체)
export const TYPE_LABEL = { 12: '명소', 14: '전시·문화', 15: '축제·행사', 28: '체험·레포츠', 38: '쇼핑', 39: '음식점·카페' }

export const YOUTH = [
  {
    slug: 'weekend', title: '전시·축제·행사', icon: 'ticket-perforated', color: '#f08c00', weather: true,
    tagline: '이번 주말, 볼거리 가득',
    desc: '제주에서 열리는 전시와 문화시설, 축제·행사를 모았어요. 날씨를 먼저 보고 계획하세요.',
    tabs: [
      { label: '진행 중 전시·공연', source: 'culture' },
      { label: '전시·문화', type: '14', keyword: '' },
      { label: '축제·행사', type: '15', keyword: '' },
    ],
  },
  {
    slug: 'food', title: '맛집', icon: 'cup-hot', color: '#e8590c', weather: true,
    tagline: '제주에서 뭐 먹지?',
    desc: '흑돼지·해산물·고기국수부터 바다 보이는 카페까지, 한국관광공사 정보로 제주 맛집을 모았어요. 비 오는 날은 따뜻한 국물 요리가 좋아요.',
    tabs: [
      { label: '추천 맛집', type: '39', keyword: '', rows: 500, arrange: 'Q', exceptCats: true }, // 최근 갱신·사진 있는 식당 순 (카페는 카페 탭에)
      { label: '흑돼지', type: '39', keyword: '흑돼지|돼지|오겹|근고기|돔베|제주돈', rows: 40 },
      { label: '해산물·회', type: '39', keyword: '횟집|물회|해물|활어|해산물|전복|갈치|고등어|성게|회센터|해녀|한치|옥돔|어촌|수산', rows: 60 },
      { label: '고기국수·국밥', type: '39', keyword: '고기국수|국수|몸국|국밥|순대|접짝뼈|해장국|보말|칼국수|수제비', rows: 60 },
      { label: '카페', type: '39', keyword: '', rows: 500, arrange: 'Q', cat3: 'A05020900' }, // 업종 분류 A05020900 = 카페/전통찻집
      { label: '기타', type: '39', keyword: '', rows: 500, arrange: 'Q', other: true },
    ],
  },
  {
    slug: 'photo', title: '인생샷 장소', icon: 'camera', color: '#ff8fab', weather: true,
    tagline: '사진 찍기 좋은 곳만 쏙쏙',
    desc: '바다·오름·꽃밭·감성 카페까지, 사진이 잘 나오는 제주 장소를 모았어요. 날씨를 먼저 보고 골라 보세요.',
    tabs: [
      { label: '해변·바다', type: '12', keyword: '해변|해수욕장|포구|해안', rows: 40 },
      { label: '오름·숲', type: '12', keyword: '오름|숲|곶자왈|폭포', rows: 40 },
      { label: '정원·꽃', type: '12', keyword: '정원|수목원|공원|꽃|유채|동백|수국', rows: 40 },
      { label: '감성 카페', type: '39', keyword: '', rows: 500, arrange: 'Q', cat3: 'A05020900' },
    ],
  },
  {
    slug: 'traffic', title: '실시간 교통정보', icon: 'cone-striped', color: '#7048e8', kind: 'traffic', weather: true,
    tagline: '떠나기 전, 지금 도로 상황',
    desc: '이동 전에 날씨에 맞는 운전 주의 사항을 확인하고, 공식 사이트에서 도로 상황과 버스 정보를 바로 열어 보세요.',
    links: [
      { name: '제주 교통정보센터', url: 'https://www.jejuits.go.kr', note: '제주 도로 CCTV·소통·돌발 정보 (실시간 영상은 여기서!)' },
      { name: '국가교통정보센터', url: 'https://www.its.go.kr', note: '전국 실시간 교통·CCTV' },
      { name: '제주버스정보', url: 'https://bus.jeju.go.kr', note: '버스 노선·도착 정보' },
    ],
  },
  {
    slug: 'flight', title: '항공편', icon: 'airplane', color: '#1c7ed6', kind: 'flight', weather: true,
    tagline: '제주공항 오늘의 운항',
    desc: '제주공항(CJU)의 오늘 출발·도착 항공편을 보여줘요. 지연·결항 여부를 확인하고 출발하세요. (한국공항공사 실시간 운항정보)',
  },
  {
    slug: 'olle', theme: 'olle', title: '올레길', icon: 'signpost-split', color: '#2f9e44', weather: true,
    tagline: '걸으며 만나는 제주',
    desc: '제주올레 코스와 걷기 좋은 길을 찾아보세요. 걷는 동안 만나는 풍경과 이야기가 창작 소재가 됩니다.',
    tabs: [
      { label: '올레길 코스', type: '12', keyword: '올레' },
      { label: '둘레길·숲길', type: '12', keyword: '숲길' },
      { label: '해안 산책', type: '12', keyword: '해안' },
    ],
  },
  {
    slug: 'policy', title: '청년정책', icon: 'piggy-bank', color: '#0b8f9c', kind: 'links',
    tagline: '놓치기 쉬운 지원, 한 번에 확인',
    desc: '일자리·주거·교육·복지문화·참여 분야의 청년 지원 정책을 공식 사이트에서 제주 지역으로 찾아볼 수 있어요.',
    links: [
      { name: '온통청년', url: 'https://www.youthcenter.go.kr', note: '전국 청년정책 통합 검색 · 지역을 ‘제주’로 선택해 찾아보세요' },
      { name: '제주특별자치도청', url: 'https://www.jeju.go.kr', note: '제주도 공고·모집 안내' },
    ],
  },
]

export const youthOf = (slug) => YOUTH.find((c) => c.slug === slug)
