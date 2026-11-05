import LinkCards, { Tip } from './LinkCards'
import NewsFeed from './NewsFeed'
import PlaceMap from '../PlaceMap'

// 일상·제주살이에 더한 항목들 (panels.jsx 와 같은 방식)
const MapNote = () => <p className="muted small">지도에 등록된 곳이 전부는 아닐 수 있어요. 가기 전에 영업시간과 휴무일을 전화나 지도에서 한 번 더 확인하세요.</p>

// ── 일상 ──────────────────────────────────────────────
export function Clinic() {
  return (
    <section className="kit-block">
      <PlaceMap options={[{ label: '내과', keyword: '내과' }, { label: '소아청소년과', keyword: '소아청소년과' }, { label: '치과', keyword: '치과' }, { label: '한의원', keyword: '한의원' }, { label: '정형외과', keyword: '정형외과' }, { label: '피부과', keyword: '피부과' }]} />
      <MapNote />
      <LinkCards items={[{ emoji: '🚑', name: '응급실·약국 찾기', url: '/discover/life?tab=pharmacy', note: '급할 때는 약국·응급실 지도로 가세요' }]} />
    </section>
  )
}

export function Bank() {
  return (
    <section className="kit-block">
      <PlaceMap options={[{ label: '은행', keyword: '은행' }, { label: '우체국', keyword: '우체국' }, { label: '주민센터', keyword: '주민센터' }]} />
      <MapNote />
      <LinkCards items={[
        { emoji: '🏛️', name: '정부24', url: 'https://www.gov.kr', note: '주민센터에 가지 않고도 되는 민원·증명서 발급' },
        { emoji: '📮', name: '우체국 택배·우편 조회', url: 'https://service.epost.go.kr', note: '우편·택배 조회와 접수 (공식)' },
      ]} />
    </section>
  )
}

export function Sports() {
  return (
    <section className="kit-block">
      <PlaceMap options={[{ label: '도서관', keyword: '도서관' }, { label: '수영장', keyword: '수영장' }, { label: '체육관', keyword: '체육관' }]} />
      <MapNote />
    </section>
  )
}

export function Pet() {
  return (
    <section className="kit-block">
      <PlaceMap options={[{ label: '동물병원', keyword: '동물병원' }, { label: '반려동물용품', keyword: '반려동물용품' }]} />
      <MapNote />
      <Tip icon="credit-card-2-front" title="반려동물은 동물등록이 필요해요">생후 2개월 이상 반려견은 등록해야 해요. 주소가 바뀌면 변경 신고도 해 주세요. 동물보호관리시스템에서 확인하세요.</Tip>
      <LinkCards items={[{ emoji: '🐶', name: '동물보호관리시스템', url: 'https://www.animal.go.kr', note: '동물등록·변경 신고, 유실·유기동물 찾기 (공식)' }]} />
    </section>
  )
}

// ── 제주살이 ──────────────────────────────────────────
export function Housing() {
  return (
    <section className="kit-block">
      <div className="tips">
        <Tip tone="maybe" icon="cash-coin" title="제주에는 연세(年稅)라는 방식이 있어요">1년 치 월세를 한꺼번에 내는 방식이에요. 월세·보증금 조건이 육지와 다를 수 있으니 계약 전에 꼭 물어보세요.</Tip>
        <Tip icon="file-earmark-check" title="계약 전에 등기부등본을 확인하세요">집주인이 맞는지, 대출이나 압류가 걸려 있지 않은지 인터넷등기소에서 볼 수 있어요.</Tip>
        <Tip icon="shield-check" title="전입신고와 확정일자로 보증금을 지켜요">이사한 날 바로 전입신고를 하고 확정일자를 받아 두세요.</Tip>
      </div>
      <LinkCards items={[
        { emoji: '🏠', name: '네이버 부동산', url: 'https://land.naver.com', note: '제주 전월세·매물 검색' },
        { emoji: '🏘️', name: '다방', url: 'https://www.dabangapp.com', note: '원룸·투룸 매물 검색' },
        { emoji: '📜', name: '인터넷등기소', url: 'https://www.iros.go.kr', note: '등기부등본 열람·발급 (공식)' },
        { emoji: '💰', name: '청년정책 (월세·주거 지원)', url: '/discover/policy', note: '청년 월세·주거 지원 정책을 찾아보세요' },
      ]} />
    </section>
  )
}

export function Jobs() {
  return (
    <section className="kit-block">
      <LinkCards items={[
        { emoji: '💼', name: '고용24', url: 'https://www.work24.go.kr', note: '채용정보·직업훈련·실업급여 (고용노동부, 공식)' },
        { emoji: '🧑‍💼', name: '온통청년', url: 'https://www.youthcenter.go.kr', note: '청년 일자리·정책 통합 검색 (지역을 ‘제주’로)' },
        { emoji: '🌱', name: 'K-Startup', url: 'https://www.k-startup.go.kr', note: '창업 지원사업·공고 (중소벤처기업부)' },
        { emoji: '🏪', name: '소상공인시장진흥공단', url: 'https://www.semas.or.kr', note: '소상공인 지원·교육·대출 안내' },
        { emoji: '🏛️', name: '제주특별자치도청', url: 'https://www.jeju.go.kr', note: '도 일자리·모집 공고 (사이트에서 ‘일자리’ 검색)' },
      ]} />
    </section>
  )
}

export function Hiring() {
  return (
    <section className="kit-block">
      <LinkCards items={[
        { emoji: '🔍', name: '잡코리아', url: 'https://www.jobkorea.co.kr', note: '제주 지역 채용공고 검색' },
        { emoji: '🧑‍💻', name: '인크루트', url: 'https://www.incruit.com', note: '제주 지역 채용공고 검색' },
        { emoji: '📝', name: '사람인', url: 'https://www.saramin.co.kr', note: '제주 지역 채용공고 검색' },
        { emoji: '🎓', name: '제주대학교', url: 'https://www.jejunu.ac.kr', note: '대학 채용게시판 (사이트에서 ‘채용’·‘공지사항’ 확인)' },
        { emoji: '🎓', name: '한라대학교', url: 'https://www.halla.ac.kr', note: '대학 채용게시판 (사이트에서 ‘채용’·‘공지사항’ 확인)' },
        { emoji: '🏢', name: '잡알리오', url: 'https://job.alio.go.kr', note: '공공기관·공기업 채용정보 통합 (지역을 ‘제주’로)' },
        { emoji: '🏛️', name: '나라일터', url: 'https://www.gojobs.go.kr', note: '공무원·공공부문 채용 공고 (인사혁신처)' },
        { emoji: '🏝️', name: '제주특별자치도청', url: 'https://www.jeju.go.kr', note: '도 공무직·기간제·공공기관 채용 공고 (‘채용’ 검색)' },
        { emoji: '📋', name: '고용24', url: 'https://www.work24.go.kr', note: '공공·민간 채용공고 (고용노동부, 공식)' },
      ]} />
      <p className="muted small">채용 조건과 마감일은 공고마다 달라요. 지원 전에 각 사이트에서 최신 공고를 확인하세요.</p>
    </section>
  )
}

export function Welfare() {
  return (
    <section className="kit-block">
      <LinkCards items={[
        { emoji: '🤝', name: '복지로', url: 'https://www.bokjiro.go.kr', note: '나에게 맞는 복지 서비스 찾기·신청 (보건복지부, 공식)' },
        { emoji: '💰', name: '청년정책', url: '/discover/policy', note: '제주 지역 청년 지원 정책' },
        { emoji: '🏛️', name: '정부24', url: 'https://www.gov.kr', note: '보조금·지원금 조회와 민원 신청' },
        { emoji: '🪙', name: '탐나는전', url: '/tamna', note: '제주 지역화폐 사용처' },
      ]} />
      <p className="muted small">복지 서비스는 나이·소득·거주 기간에 따라 달라요. 신청 전에 조건을 꼭 확인하고, 모르면 주민센터나 복지로(129)에 물어보세요.</p>
    </section>
  )
}

export function News() {
  return <section className="kit-block"><NewsFeed /></section>
}
