import LinkCards, { Tip } from './LinkCards'
import IceRoads from './IceRoads'
import LiveAlerts from './LiveAlerts'
import MoveChecklist from './MoveChecklist'
import SeaWaves from './SeaWaves'
import PlaceMap from '../PlaceMap'

const naver = (q) => `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`

// ── 날씨·안전 ─────────────────────────────────────────
export function Alerts() {
  return (
    <section className="kit-block">
      <LiveAlerts />
      <LinkCards items={[
        { emoji: '⚠️', name: '기상청 기상특보', url: 'https://www.weather.go.kr', note: '지금 제주에 내려진 태풍·강풍·호우·대설 특보 (공식)' },
        { emoji: '📱', name: '안전디딤돌 (재난문자)', url: 'https://www.safekorea.go.kr', note: '우리 동네에 온 재난·안전 문자와 행동 요령 (행정안전부)' },
        { emoji: '✈️', name: '항공편 운항 보기', url: '/discover/flight', note: '제주공항 오늘 출발·도착, 지연·결항 확인' },
      ]} />
    </section>
  )
}

export function Sea() {
  return <section className="kit-block"><SeaWaves /></section>
}

export function Snow() {
  return (
    <section className="kit-block">
      <IceRoads />
      <LinkCards items={[
        { emoji: '📹', name: '도로 CCTV·교통정보 보기', url: '/discover/traffic', note: '눈 감시 CCTV 위치와 운전 주의 사항' },
        { emoji: '🚦', name: '제주 교통정보센터', url: 'https://www.jejuits.go.kr', note: '도로 CCTV·소통·돌발 정보 (공식)' },
        { emoji: '🏛️', name: '제주특별자치도청', url: 'https://www.jeju.go.kr', note: '도로 통제·제설 공지 (사이트에서 ‘통제’ 검색)' },
      ]} />
    </section>
  )
}

// ── 이동 ──────────────────────────────────────────────
export function Ship() {
  return (
    <section className="kit-block">
      <Tip tone="maybe" icon="water" title="섬 가는 배는 바람과 파도에 자주 멈춰요">
        우도·가파도·마라도·추자도는 날씨에 따라 결항이 잦아요. 가기 전날과 당일 아침에 꼭 확인하세요. 운항 정보는 배를 운영하는 회사 사이트가 가장 정확해서, 검색 결과로 연결해 드려요.
      </Tip>
      <LinkCards items={[
        { emoji: '🏝️', name: '우도 배편 운항', url: naver('우도 도항선 운항 현황'), note: '성산항·종달항에서 우도로 가는 배' },
        { emoji: '🌾', name: '가파도·마라도 배편 운항', url: naver('가파도 마라도 여객선 운항'), note: '운진항에서 가는 배' },
        { emoji: '🐟', name: '추자도 배편 운항', url: naver('추자도 여객선 운항'), note: '제주항·완도에서 가는 배' },
        { emoji: '🚢', name: '제주↔육지 배편', url: naver('제주 여객선 운항 시간표'), note: '제주항·화순항에서 육지로 가는 여객선·차량 선적' },
        { emoji: '🌊', name: '지금 바다 파도 높이 보기', url: '/discover/life?tab=sea', note: '배가 뜰지 가늠해 보세요' },
      ]} />
    </section>
  )
}

export function Airport() {
  return (
    <section className="kit-block">
      <LinkCards items={[
        { emoji: '✈️', name: '제주공항 항공편 보기', url: '/discover/flight', note: '오늘 출발·도착과 지연·결항' },
        { emoji: '🅿️', name: '한국공항공사 (주차장 현황)', url: 'https://www.airport.co.kr', note: '제주공항 주차장이 얼마나 찼는지는 여기서 확인해요 (공식)' },
        { emoji: '🚕', name: '제주공항 이용 안내 검색', url: naver('제주공항 주차 혼잡 렌터카 하차'), note: '렌터카 하우스 위치, 주차 혼잡 시간대 소식' },
      ]} />
      <Tip icon="clock" title="성수기·연휴에는 일찍 가세요">주차장이 가득 차면 입구에서 오래 기다릴 수 있어요. 대중교통이나 택시를 함께 생각해 보세요.</Tip>
    </section>
  )
}

export function Transit() {
  return (
    <section className="kit-block">
      <LinkCards items={[
        { emoji: '🚌', name: '제주버스정보', url: 'https://bus.jeju.go.kr', note: '버스 노선·도착 시간 (공식)' },
        { emoji: '🚦', name: '도로 상황·교통정보', url: '/discover/traffic', note: '날씨별 운전 주의, CCTV' },
        { emoji: '🚗', name: '제주 교통정보센터', url: 'https://www.jejuits.go.kr', note: '도로 소통·돌발 정보 (공식)' },
      ]} />
    </section>
  )
}

// ── 일상 ──────────────────────────────────────────────
export function Pharmacy() {
  return (
    <section className="kit-block">
      <PlaceMap options={[{ label: '약국', keyword: '약국' }, { label: '24시 약국·심야약국', keyword: '24시 약국' }, { label: '응급실', keyword: '응급실' }, { label: '야간 진료 병원', keyword: '야간진료' }, { label: '달빛어린이병원', keyword: '달빛어린이병원' }]} />
      <p className="muted small">지도에 등록된 곳이 전부는 아닐 수 있어요. 급할 때는 가기 전에 전화로 문을 열었는지 확인하세요. 몸이 많이 아프면 119에 연락하세요.</p>
      <LinkCards items={[
        { emoji: '🚑', name: '병원·응급실 자료 보기', url: '/links/hospital', note: '응급의료기관과 공공의료기관 현황' },
        { emoji: '💊', name: '응급의료포털 (e-gen)', url: 'https://www.e-gen.or.kr', note: '지금 문 연 약국·응급실을 찾아요 (공식)' },
      ]} />
    </section>
  )
}

export function Shop() {
  return (
    <section className="kit-block">
      <PlaceMap options={[{ label: '대형마트', keyword: '대형마트' }, { label: '하나로마트', keyword: '하나로마트' }, { label: '빨래방·세탁소', keyword: '세탁소' }, { label: '은행·ATM', keyword: '은행' }]} />
      <p className="muted small">지도 범위 안에서 찾아요. 영업시간은 가게마다 달라서 지도 정보를 한 번 더 확인하세요.</p>
    </section>
  )
}

// ── 제주살이 ──────────────────────────────────────────
export function Move() {
  return <section className="kit-block"><MoveChecklist /></section>
}

export function Bills() {
  return (
    <section className="kit-block">
      <div className="tips">
        <Tip icon="journal-text" title="전입신고는 이사 후 14일 안에">정부24에서 인터넷으로 하거나 새로 사는 동네 주민센터에 가서 해요.</Tip>
        <Tip tone="maybe" icon="lightning-charge" title="전기·수도는 이사 날짜에 맞춰 정산해요">전기는 한국전력, 수도는 제주도 상하수도 담당 부서에 신청하거나 문의해요.</Tip>
      </div>
      <LinkCards items={[
        { emoji: '🏛️', name: '정부24 (전입신고·서류)', url: 'https://www.gov.kr', note: '전입신고, 등본·초본 떼기 등 민원 서비스' },
        { emoji: '💡', name: '한국전력 사이버지점', url: 'https://cyber.kepco.co.kr', note: '전기 사용 신청, 요금 확인, 이사 정산' },
        { emoji: '🚰', name: '제주특별자치도청', url: 'https://www.jeju.go.kr', note: '수도 요금·하수도 안내 (사이트에서 ‘상하수도’ 검색)' },
        { emoji: '🏢', name: '공공기관 모아보기', url: '/links/public', note: '주민센터·제주시·서귀포시 사이트' },
      ]} />
    </section>
  )
}

export function Parcel() {
  return (
    <section className="kit-block">
      <Tip tone="maybe" icon="box-seam" title="제주는 택배비가 더 붙는 곳이 많아요">
        온라인 쇼핑몰은 제주와 섬 지역에 추가 배송비를 받는 경우가 많아요. 값은 가게마다 달라서 결제 전에 상품 페이지의 배송 안내를 꼭 보세요.
      </Tip>
      <div className="tips">
        <Tip icon="calendar-check" title="배송은 육지보다 하루쯤 더 걸려요">배가 못 뜨는 날(태풍·풍랑)에는 더 늦어질 수 있어요.</Tip>
        <Tip icon="truck" title="큰 짐은 배 운송 일정부터 알아보세요">가구·차량은 배로 보내서 예약이 필요하고 비용도 따로 들어요.</Tip>
      </div>
      <LinkCards items={[
        { emoji: '📮', name: '우체국 택배 조회·접수', url: 'https://service.epost.go.kr', note: '택배 조회, 방문 접수 (공식)' },
        { emoji: '🚚', name: '제주 이사·화물 선적 검색', url: naver('제주 이사 화물 선적 비용'), note: '배로 보내는 이삿짐·차량 업체 알아보기' },
      ]} />
    </section>
  )
}

export function Town() {
  return (
    <section className="kit-block">
      <h3 className="sub-title">🏘️ 이웃들의 동네 이야기</h3>
      <LinkCards items={[
        { emoji: '🥕', name: '당근 · 동네생활', url: 'https://www.daangn.com/kr/community/', note: '우리 동네 이웃들의 질문·모임·가게 소식 (동네는 당근 앱에서 설정해요)' },
        { emoji: '☕', name: '다음 카페 · 제주맘', url: 'https://cafe.daum.net/jejumam', note: '제주 지역 맘카페 (다음 카페)' },
        { emoji: '🟢', name: '네이버 카페 · 제주맘', url: 'https://cafe.naver.com/jejumam', note: '제주 지역 맘카페 (네이버 카페)' },
      ]} />
      <p className="muted small">맘카페는 가입해야 글을 볼 수 있는 경우가 많아요. 가입 조건은 카페 안내를 확인하세요.</p>
      <h3 className="sub-title">📣 공고·뉴스</h3>
      <LinkCards items={[
        { emoji: '🏛️', name: '제주특별자치도청', url: 'https://www.jeju.go.kr', note: '도 전체 공고·모집·행사' },
        { emoji: '🏙️', name: '제주시청', url: 'https://www.jejusi.go.kr', note: '제주시 공고와 행사 안내' },
        { emoji: '🍊', name: '서귀포시청', url: 'https://www.seogwipo.go.kr', note: '서귀포시 공고와 행사 안내' },
        { emoji: '📰', name: '제주언론사 모아보기', url: '/links/press', note: '우리 동네 뉴스를 한곳에서' },
        { emoji: '💬', name: '제주커뮤니티 모아보기', url: '/links/community', note: '이웃들의 생활 이야기와 정착 정보' },
        { emoji: '💰', name: '청년정책', url: '/discover/policy', note: '놓치기 쉬운 청년 지원 정책' },
      ]} />
    </section>
  )
}
