import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchEvStations, fetchPlacesIn } from '../api/client'
import { KAKAO_KEY, loadKakao, NO_KEY_HELP } from '../lib/kakaoMaps'

// 카카오 장소 검색(서버)으로 지도에 보이는 범위 안의 장소를 찾아 핀과 목록으로 보여줘요 (최대 45곳)
const AREAS = [
  { name: '제주 전체', lat: 33.38, lng: 126.55, level: 10 },
  { name: '제주시내', lat: 33.5, lng: 126.53, level: 7 },
  { name: '서귀포', lat: 33.253, lng: 126.56, level: 7 },
  { name: '성산·구좌', lat: 33.46, lng: 126.85, level: 8 },
  { name: '애월·한림', lat: 33.42, lng: 126.3, level: 8 },
]

export default function PlaceMap({ options }) {
  const box = useRef(null)
  const map = useRef(null)
  const marks = useRef([])
  const info = useRef(null)
  const [state, setState] = useState(KAKAO_KEY ? 'loading' : 'nokey')
  const [why, setWhy] = useState('')
  const [opt, setOpt] = useState(0)
  const [area, setArea] = useState(0)
  const [busy, setBusy] = useState(false)
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')

  const open = (p, m) => {
    const kakao = window.kakao
    info.current?.close()
    info.current = new kakao.maps.InfoWindow({ content: `<div style="padding:6px 10px;font-size:12px;font-weight:700;white-space:nowrap">${p.name.replace(/</g, '&lt;')}</div>`, removable: true })
    info.current.open(map.current, m)
  }
  const search = useCallback(async (keyword, ev) => {
    const kakao = window.kakao
    if (!kakao || !map.current) return
    setBusy(true)
    const b = map.current.getBounds()
    const sw = b.getSouthWest(), ne = b.getNorthEast()
    try {
      const found = ev
        ? (await fetchEvStations()).filter((p) => p.lat >= sw.getLat() && p.lat <= ne.getLat() && p.lng >= sw.getLng() && p.lng <= ne.getLng()).slice(0, 45)
        : await fetchPlacesIn(keyword, [sw.getLng(), sw.getLat(), ne.getLng(), ne.getLat()].map((v) => v.toFixed(5)).join(','))
      marks.current.forEach((m) => m.setMap(null))
      marks.current = found.map((p) => {
        const m = new kakao.maps.Marker({ position: new kakao.maps.LatLng(p.lat, p.lng), map: map.current, title: p.name })
        kakao.maps.event.addListener(m, 'click', () => open(p, m))
        return m
      })
      setErr('')
      setRows(found)
    } catch (e) {
      setErr(e?.message ?? '장소를 찾지 못했어요')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (!KAKAO_KEY || !box.current) return undefined
    let alive = true
    loadKakao().then((kakao) => {
      if (!alive || !box.current) return
      const a = AREAS[0]
      map.current = new kakao.maps.Map(box.current, { center: new kakao.maps.LatLng(a.lat, a.lng), level: a.level })
      map.current.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT)
      setState('ready')
      kakao.maps.event.addListener(map.current, 'tilesloaded', function once() {
        kakao.maps.event.removeListener(map.current, 'tilesloaded', once)
        search(options[0].keyword, options[0].ev)
      })
    }).catch((e) => { if (alive) { setWhy(e?.message ?? String(e)); setState('fail') } })
    return () => { alive = false; marks.current.forEach((m) => m.setMap(null)); map.current = null }
  }, [])

  const pickOpt = (i) => { setOpt(i); search(options[i].keyword, options[i].ev) }
  const pickArea = (i) => {
    setArea(i)
    const kakao = window.kakao
    if (!kakao || !map.current) return
    const a = AREAS[i]
    map.current.setLevel(a.level)
    map.current.setCenter(new kakao.maps.LatLng(a.lat, a.lng))
    setTimeout(() => search(options[opt].keyword, options[opt].ev), 350)
  }
  const flyTo = (p) => {
    const kakao = window.kakao
    if (!kakao || !map.current) return
    map.current.setLevel(3)
    map.current.panTo(new kakao.maps.LatLng(p.lat, p.lng))
    box.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (state === 'nokey') {
    return <div className="notice" style={{ display: 'block' }}><strong>지도를 쓰려면 카카오 지도 키가 필요해요.</strong><p className="muted">{NO_KEY_HELP}</p></div>
  }
  return (
    <div className="tmap">
      <div className="chips">
        {options.map((o, i) => <button key={o.label} type="button" className={`chip${opt === i ? ' on' : ''}`} onClick={() => pickOpt(i)}>{o.label}</button>)}
      </div>
      <div className="chips">
        {AREAS.map((a, i) => <button key={a.name} type="button" className={`chip${area === i ? ' on' : ''}`} onClick={() => pickArea(i)}>{a.name}</button>)}
        <button type="button" className="btn btn-ghost btn-sm" disabled={state !== 'ready' || busy} onClick={() => search(options[opt].keyword, options[opt].ev)}><i className="bi bi-arrow-repeat" />이 지도에서 다시 찾기</button>
      </div>
      <div className="tmap-box">
        <div ref={box} className="tmap-canvas" />
        {state === 'loading' && <p className="tmap-msg muted">지도를 불러오는 중…</p>}
        {state === 'fail' && <p className="tmap-msg">지도를 불러오지 못했어요.<br />이유: {why || '알 수 없음'}</p>}
      </div>
      {err && <p className="notice" style={{ display: 'block' }}>{err}</p>}
      {rows && (
        <>
          <p className="muted small">{busy ? '찾는 중…' : rows.length ? `지도에 보이는 범위에서 ${rows.length}곳을 찾았어요 (최대 45곳). 지도를 옮기거나 확대한 뒤 "다시 찾기"를 눌러 보세요.` : '이 범위에서는 찾지 못했어요. 지도를 옮기거나 다른 지역을 눌러 보세요.'}</p>
          <div className="place-list">
            {rows.map((p) => (
              <div key={p.id} className="place-row">
                <button type="button" className="place-name" onClick={() => flyTo(p)} title="지도에서 위치 보기">{p.name}</button>
                <span className="muted small">{p.addr}</span>
                {p.hours && <span className="muted small">🕘 이용 {p.hours}</span>}
                <span className="place-acts">
                  {p.phone && <a href={`tel:${p.phone.replace(/[^0-9+]/g, '')}`}>📞 {p.phone}</a>}
                  <a href={p.url} target="_blank" rel="noreferrer">카카오맵 ↗</a>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
