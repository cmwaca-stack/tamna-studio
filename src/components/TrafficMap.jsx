import { useEffect, useRef, useState } from 'react'

// 실시간 교통 지도: 카카오맵의 교통정보 레이어(빨강=정체, 주황=서행, 초록=원활)를 제주 지도 위에 보여줘요.
// 카카오 개발자 사이트의 "JavaScript 키"(.env.local 의 VITE_KAKAO_JS_KEY)와 사이트 주소 등록(플랫폼 > Web)이 필요해요.
const KEY = import.meta.env.VITE_KAKAO_JS_KEY
const PLACES = [
  { name: '제주 전체', lat: 33.38, lng: 126.55, level: 10 },
  { name: '제주시내', lat: 33.5, lng: 126.53, level: 7 },
  { name: '제주공항', lat: 33.511, lng: 126.493, level: 5 },
  { name: '서귀포', lat: 33.253, lng: 126.56, level: 7 },
  { name: '성산·구좌', lat: 33.46, lng: 126.85, level: 8 },
  { name: '애월·한림', lat: 33.42, lng: 126.3, level: 8 },
]

let loader = null
function loadKakao() {
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    if (window.kakao?.maps?.load) { window.kakao.maps.load(() => resolve(window.kakao)); return }
    const s = document.createElement('script')
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`
    s.async = true
    s.referrerPolicy = 'no-referrer' // 이 사이트 화면에서 보내는 Referer 때문에 카카오가 스크립트를 거절하는 경우가 있어 보내지 않아요
    s.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    s.onerror = () => { loader = null; reject(new Error('카카오 지도 프로그램(sdk.js)을 받지 못했어요 — 키·사이트 주소 등록 또는 광고 차단 확인')) }
    document.head.appendChild(s)
  })
  return loader
}

export default function TrafficMap() {
  const box = useRef(null)
  const map = useRef(null)
  const [state, setState] = useState(KEY ? 'loading' : 'nokey') // loading | ready | fail | nokey
  const [why, setWhy] = useState('')
  const [on, setOn] = useState(true)
  const [place, setPlace] = useState(0)

  useEffect(() => {
    if (!KEY || !box.current) return undefined
    let alive = true
    loadKakao().then((kakao) => {
      if (!alive || !box.current) return
      const p = PLACES[0]
      map.current = new kakao.maps.Map(box.current, { center: new kakao.maps.LatLng(p.lat, p.lng), level: p.level })
      map.current.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC)
      map.current.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT)
      setState('ready')
    }).catch((e) => {
      console.error('[교통 지도]', e)
      if (!alive) return
      setWhy(e?.message ?? String(e))
      setState('fail')
    })
    return () => { alive = false; map.current = null }
  }, [])

  const go = (i) => {
    setPlace(i)
    const kakao = window.kakao
    if (!kakao || !map.current) return
    const p = PLACES[i]
    map.current.setLevel(p.level)
    map.current.panTo(new kakao.maps.LatLng(p.lat, p.lng))
  }
  const toggle = () => {
    const kakao = window.kakao
    if (!kakao || !map.current) return
    if (on) map.current.removeOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC)
    else map.current.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC)
    setOn(!on)
  }

  if (state === 'nokey') {
    return (
      <div className="notice" style={{ display: 'block' }}>
        <strong>실시간 교통 지도를 쓰려면 카카오 지도 키가 필요해요.</strong>
        <p className="muted">카카오 개발자 사이트(developers.kakao.com)의 내 앱 → 플랫폼 키에서 <b>JavaScript 키</b>를 복사해 <code>.env.local</code> 에 <code>VITE_KAKAO_JS_KEY=키값</code> 으로 넣고 서버를 다시 켜세요. 같은 앱의 플랫폼 &gt; Web 에 이 사이트 주소(http://localhost:5173 과 배포 주소)도 등록해야 해요.</p>
      </div>
    )
  }
  return (
    <div className="tmap">
      <div className="tmap-bar">
        <div className="chips">
          {PLACES.map((p, i) => <button key={p.name} type="button" className={`chip${place === i ? ' on' : ''}`} onClick={() => go(i)}>{p.name}</button>)}
        </div>
        <div className="tmap-legend" aria-label="교통 상태 색">
          <span><i style={{ background: '#e03131' }} />정체</span><span><i style={{ background: '#f59f00' }} />서행</span><span><i style={{ background: '#2f9e44' }} />원활</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={toggle} disabled={state !== 'ready'}>{on ? '교통 색 끄기' : '교통 색 켜기'}</button>
        </div>
      </div>
      <div className="tmap-box">
        <div ref={box} className="tmap-canvas" />
        {state === 'loading' && <p className="tmap-msg muted">지도를 불러오는 중…</p>}
        {state === 'fail' && <p className="tmap-msg">지도를 불러오지 못했어요.<br />이유: {why || '알 수 없음'}</p>}
      </div>
      <p className="muted small">교통 정보는 카카오맵이 실시간으로 보여줘요. 도로 위 선 색으로 막히는 곳을 확인하세요.</p>
    </div>
  )
}
