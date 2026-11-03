// 제주 언론사·커뮤니티·공공기관 바로가기. 주소가 바뀌면 여기만 고치면 돼요.

const q = (t) => encodeURIComponent(t)
const map = (t) => `https://map.kakao.com/?q=${q(t)}` // 다음(카카오)지도 검색

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
        { name: '제주투데이', url: 'https://www.ijejutoday.com', note: '인터넷 언론' },
        { name: '제주도민일보', url: 'https://www.jejudomin.co.kr', note: '지역 일간지' },
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
      ] },
      { name: '지원·생활 기관', items: [
        { name: '정부24', url: 'https://www.gov.kr', note: '전입신고·증명서 등 민원' },
        { name: '제주관광공사', url: 'https://ijto.or.kr', note: '관광·여행 정보', logo: false },
        { name: '제주지방기상청', url: 'https://www.kma.go.kr/jeju/index.jsp', note: '제주 날씨·특보' },
        { name: '제주경찰청', url: 'https://jjpolice.go.kr/index.jsp', note: '치안·민원 안내', logo: false },
      ] },
      { name: '공공기관 모아보기', items: [
        { name: '제주도 공공기관 목록 (제주도로지스)', url: 'http://www.jejudologis.com/jejupol.php?page=1&gubun=%EA%B3%B5%EA%B3%B5%EA%B8%B0%EA%B4%80&keyword=', note: '제주 지역 공공기관을 한눈에 찾아봐요' },
      ] },
    ],
  },
  hospital: {
    title: '병원', icon: 'hospital', color: '#e0527e', logos: true,
    desc: '아프거나 다쳤을 때 바로 쓰는 곳을 모았어요. 응급 상황이면 망설이지 말고 119에 전화하세요. 지도 검색은 다음지도에서 가까운 곳을 찾아 줘요.',
    groups: [
      { name: '지금 급해요', items: [
        { name: '응급의료포털', url: 'https://www.e-gen.or.kr', note: '응급실·병원·약국 실시간 정보, 달빛어린이병원 안내' },
        { name: '약국정보 (심야·공휴일 약국)', url: 'https://www.pharm114.or.kr', note: '밤늦게·휴일에 문 여는 약국 찾기' },
        { name: '응급실 찾기 · 제주', url: map('제주 응급실'), note: '다음지도에서 가까운 응급실', emoji: '🚑' },
        { name: '심야·24시 약국 · 제주', url: map('제주 24시 약국'), note: '다음지도에서 늦게까지 여는 약국', emoji: '💊' },
      ] },
      { name: '진료과로 찾기 (다음지도)', items: [
        { name: '소아과·달빛어린이병원', url: map('제주 소아청소년과'), note: '아이가 아플 때', emoji: '🧸' },
        { name: '치과', url: map('제주 치과'), note: '치통·치아 진료', emoji: '🦷' },
        { name: '한의원', url: map('제주 한의원'), note: '한방 진료·침·물리치료', emoji: '🌿' },
        { name: '내과·가정의학과', url: map('제주 내과'), note: '감기·복통·건강검진', emoji: '🩺' },
        { name: '정형외과', url: map('제주 정형외과'), note: '삐었거나 다쳤을 때', emoji: '🦴' },
        { name: '피부과', url: map('제주 피부과'), note: '햇볕 화상·피부 트러블', emoji: '🧴' },
        { name: '이비인후과', url: map('제주 이비인후과'), note: '코·목·귀 증상', emoji: '👂' },
        { name: '안과', url: map('제주 안과'), note: '눈 충혈·이물감', emoji: '👁️' },
      ] },
      { name: '주요 병원', items: [
        { name: '제주대학교병원', url: 'https://www.jejunuh.co.kr', note: '제주시 · 상급종합병원' },
        { name: '제주한라병원', url: 'https://www.hallahosp.co.kr', note: '제주시 · 종합병원' },
        { name: '제주의료원 (지도로 찾기)', url: map('제주의료원'), note: '제주시 · 공공의료기관', emoji: '🏥' },
        { name: '서귀포의료원 (지도로 찾기)', url: map('서귀포의료원'), note: '서귀포시 · 공공의료기관', emoji: '🏥' },
      ] },
      { name: '보건·건강 정보', items: [
        { name: '제주특별자치도 보건', url: 'https://www.jeju.go.kr/health/index.htm', note: '보건소·감염병·건강 정책 안내' },
        { name: '서귀포시 보건', url: 'https://www.seogwipo.go.kr/health/index.htm', note: '서귀포시 보건소·건강 안내' },
        { name: '국민건강보험공단', url: 'https://www.nhis.or.kr', note: '자격 확인·건강검진·환급' },
        { name: '보건복지부', url: 'https://www.mohw.go.kr', note: '보건복지상담 129 · 정책 안내' },
      ] },
    ],
  },
}
