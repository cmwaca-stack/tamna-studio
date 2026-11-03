// 제주 언론사·커뮤니티·공공기관 바로가기. 주소가 바뀌면 여기만 고치면 돼요.

export const LINKPAGES = {
  press: {
    title: '제주언론사', icon: 'newspaper', color: '#c92a2a', logos: true,
    desc: '제주 소식을 전하는 지역 신문·방송을 한곳에 모았어요. 눌러서 공식 사이트로 이동합니다.',
    groups: [
      { name: '신문·인터넷 언론', items: [
        { name: '제주일보', url: 'https://www.jejunews.com', note: '제주 종합일간지' },
        { name: '한라일보', url: 'https://www.ihalla.com', note: '제주 종합일간지' },
        { name: '제민일보', url: 'https://www.jemin.com', note: '제주 종합일간지' },
        { name: '제주의소리', url: 'https://www.jejusori.net', note: '인터넷 언론' },
        { name: '헤드라인제주', url: 'https://www.headlinejeju.co.kr', note: '인터넷 언론' },
        { name: '뉴제주일보', url: 'https://www.newsjeju.net', note: '지역 일간지' },
      ] },
      { name: '방송', items: [
        { name: 'KBS 제주', url: 'https://news.kbs.co.kr/news/pc/local/main.do?ncd=jeju', note: '제주 지역 뉴스' },
        { name: '제주 MBC', url: 'https://www.jejumbc.com', note: '제주 지역 방송' },
        { name: 'JIBS 제주방송', url: 'https://www.jibs.co.kr', note: '제주 지역 방송' },
      ] },
    ],
  },
  community: {
    title: '제주커뮤니티', icon: 'people', color: '#e8590c', logos: true,
    desc: '제주살이 이야기와 이사·정착 정보를 나누는 곳으로 바로 연결해요.',
    groups: [
      { name: '이야기·정보 찾기', items: [
        { name: '픽제주', url: 'https://www.picjeju.com/', note: '제주 소식·정보 사이트' },
        { name: '플레이제주', url: 'https://playjeju.co.kr/', note: '제주 소식·정보 사이트' },
        { name: '잇지제주', url: 'https://www.idge.co.kr/', note: '제주 청년 정보·교육·지원사업 소식' },
        { name: '탐라오', url: 'https://tamraoo.com/', note: '제주 정보 사이트' },
        { name: '제주청년', url: 'https://jejuyouth.com/index.php', note: '제주 청년 정보 사이트' },
        { name: '한라대게시판', url: 'https://www.halla.ac.kr/kr/160/subview.do', note: '한라대학교 게시판' },
        { name: '제주대게시판', url: 'https://www.jejunu.ac.kr/ara/noticesurvey/jnuboard.htm', note: '제주대학교 학생·구성원 게시판', logoSrc: 'https://www.jejunu.ac.kr/pub/site/jejunu/images/main/favicon.png' },
        { name: '제주생활게시판', url: 'https://www.jejugesipan.com/', note: '제주 생활 정보 게시판', logo: false },
      ] },
    ],
  },
  public: {
    title: '공공기관', icon: 'bank', color: '#1971c2', logos: true,
    desc: '제주살이에 자주 쓰는 도·시 기관 공식 사이트예요. 민원·공고·지원 사업을 확인할 때 이용하세요.',
    groups: [
      { name: '도·시 행정', items: [
        { name: '제주특별자치도', url: 'https://www.jeju.go.kr', note: '도청 공고·민원', logoSrc: 'https://www.jeju.go.kr/favicon.ico' },
        { name: '제주시', url: 'https://www.jejusi.go.kr', note: '제주시 행정 안내', logoSrc: 'https://www.jejusi.go.kr/favicon.ico' },
        { name: '서귀포시', url: 'https://www.seogwipo.go.kr', note: '서귀포시 행정 안내', logoSrc: 'https://www.seogwipo.go.kr/favicon.ico' },
        { name: '제주도의회', url: 'https://www.council.jeju.kr', note: '의정 소식', logo: false },
        { name: '제주도교육청', url: 'https://www.jje.go.kr', note: '교육 정책·공고', logoSrc: 'https://www.jje.go.kr/images/new/Potal/layout/2024favicon.ico' },
      ] },
      { name: '공공기관 모아보기', items: [
        { name: '제주도 공공기관 목록 (제주도로지스)', url: 'http://www.jejudologis.com/jejupol.php?page=1&gubun=%EA%B3%B5%EA%B3%B5%EA%B8%B0%EA%B4%80&keyword=', note: '제주 지역 공공기관을 한눈에 찾아봐요' },
      ] },
      { name: '지원·생활 기관', items: [
        { name: '정부24', url: 'https://www.gov.kr', note: '전입신고·증명서 등 민원' },
        { name: '온통청년', url: 'https://www.youthcenter.go.kr', note: '청년정책 통합 검색' },
        { name: '제주관광공사', url: 'https://ijto.or.kr', note: '관광·여행 정보', logo: false },
        { name: '제주지방기상청', url: 'https://www.kma.go.kr/jeju/index.jsp', note: '제주 날씨·특보' },
        { name: '제주경찰청', url: 'https://jjpolice.go.kr/index.jsp', note: '치안·민원 안내', logo: false },
      ] },
    ],
  },
}
