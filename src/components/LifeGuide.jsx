import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Chips from './Chips'
import { useAppStore } from '../store/useAppStore'
import AirQuality from './AirQuality'
import FiveDayMarkets from './FiveDayMarkets'
import PlaceMap from './PlaceMap'

const TABS = [
  { key: 'trash', label: '쓰레기·분리배출', emoji: '♻️' },
  { key: 'fuel', label: '주유소·충전소', emoji: '⛽' },
  { key: 'air', label: '대기질', emoji: '😷' },
  { key: 'market', label: '오일장', emoji: '🛒' },
]

function Trash() {
  return (
    <section className="kit-block">
      <div className="tips">
        <div className="tip good"><i className="bi bi-info-circle" /><div><strong>클린하우스란?</strong><p className="muted">제주 마을마다 있는 공동 배출 장소예요. 일반쓰레기·재활용품·음식물을 정해진 방법으로 나눠서 내놓아요.</p></div></div>
        <div className="tip maybe"><i className="bi bi-clock" /><div><strong>요일·시간은 동네마다 달라요</strong><p className="muted">클린하우스에 붙은 안내판을 꼭 확인하세요. 음식물 쓰레기는 일반쓰레기와 따로 배출해요.</p></div></div>
        <div className="tip maybe"><i className="bi bi-box-seam" /><div><strong>가구·가전은 신청 후 배출</strong><p className="muted">큰 물건(대형폐기물)은 그냥 내놓지 말고, 사는 동네 주민센터에 문의하거나 신청한 뒤 내놓아요.</p></div></div>
      </div>
      <h2><i className="bi bi-geo-alt" /> 가까운 곳 찾기</h2>
      <PlaceMap options={[{ label: '재활용도움센터', keyword: '재활용도움센터' }, { label: '클린하우스', keyword: '클린하우스' }]} />
      <p className="muted small">클린하우스는 지도에 등록된 곳이 일부예요(다 나오지 않을 수 있어요). 재활용도움센터는 대부분 나와요. 일반적인 안내이고, 지역별 규정은 주민센터에서 확인하세요.</p>
      <div className="links">
        <a href="https://www.jeju.go.kr" target="_blank" rel="noreferrer" className="link-card"><strong>제주특별자치도청<i className="bi bi-box-arrow-up-right" /></strong><span className="muted">폐기물·환경 공고와 안내 (사이트에서 '쓰레기' 검색)</span></a>
        <Link to="/links/public" className="link-card"><strong>공공기관 모아보기</strong><span className="muted">주민센터·제주시·서귀포시 사이트로 이동</span></Link>
      </div>
    </section>
  )
}

function Fuel() {
  return (
    <section className="kit-block">
      <PlaceMap options={[{ label: '주유소', keyword: '주유소' }, { label: '전기차 충전소 (한국전력)', keyword: '', ev: true }, { label: '전기차 충전소 (전체·더 많이)', keyword: '전기차충전소' }, { label: 'LPG 충전소', keyword: 'LPG충전소' }]} />
      <p className="muted small">주유소는 위치·전화번호를 보여줘요. "전기차 충전소 (한국전력)"는 한국전력공사 자료(2025년 12월 말 기준) 제주 204곳의 위치·이용 시간·연락처예요. 기름값과 충전기 사용 가능 여부(충전 중인지)는 아래 공식 사이트에서 확인하세요.</p>
      <div className="links">
        <a href="https://www.opinet.co.kr" target="_blank" rel="noreferrer" className="link-card"><strong>오피넷<i className="bi bi-box-arrow-up-right" /></strong><span className="muted">지역별 주유소 최저가·가격 비교 (한국석유공사)</span></a>
        <a href="https://ev.or.kr" target="_blank" rel="noreferrer" className="link-card"><strong>무공해차 통합누리집<i className="bi bi-box-arrow-up-right" /></strong><span className="muted">전기차 충전소 찾기·보조금 안내</span></a>
      </div>
    </section>
  )
}

// 생활정보: 제주에 사는 사람에게 필요한 일상 정보 모음
export default function LifeGuide({ cat }) {
  const [tab, setTab] = useState('trash')
  const navigate = useNavigate()
  const setThemeKey = useAppStore((st) => st.setThemeKey)
  return (
    <div className="page">
      <header className="page-head" style={{ '--c': cat.color }}>
        <Link to="/" className="back"><i className="bi bi-arrow-left" />홈</Link>
        <h1><i className={`bi bi-${cat.icon}`} style={{ color: cat.color }} />{cat.title}</h1>
        <p className="muted">{cat.desc}</p>
        <Chips value="life" onChange={(k) => { setThemeKey(k); navigate('/kit') }} />
      </header>
      <div className="seg life-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
            <span aria-hidden="true">{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>
      {tab === 'trash' && <Trash />}
      {tab === 'fuel' && <Fuel />}
      {tab === 'air' && <AirQuality />}
      {tab === 'market' && <FiveDayMarkets />}
    </div>
  )
}
