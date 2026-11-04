import { fetchAlerts } from '../../api/client'
import { useAsync } from '../../hooks/useAsync'
import { Loading } from '../Status'

// 지금 제주에 기상특보·재난문자가 있는지.
//  ① 기상특보(기상청)·재난문자(행정안전부): 서버(/api/olle?kind=alerts)가 공공데이터로 가져와요. 최근 24시간(재난문자는 48시간) 기준이에요.
//  ② 하늘 상태: 오픈메테오 예보로 지금 바람·비·눈을 보고 위험 신호를 자동으로 알려 줘요 (공식 특보가 아니라 추정).
const POINTS = [
  { name: '제주시', lat: 33.5, lng: 126.53 },
  { name: '서귀포', lat: 33.253, lng: 126.56 },
  { name: '성산', lat: 33.46, lng: 126.93 },
  { name: '한림', lat: 33.41, lng: 126.26 },
]
const SNOW = [71, 73, 75, 77, 85, 86]

async function loadSky() {
  const q = new URLSearchParams({ latitude: POINTS.map((p) => p.lat).join(','), longitude: POINTS.map((p) => p.lng).join(','), current: 'wind_gusts_10m,weather_code,snowfall', wind_speed_unit: 'ms', timezone: 'Asia/Seoul' })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`)
  if (!res.ok) throw new Error('하늘 상태를 불러오지 못했어요')
  const j = await res.json()
  return (Array.isArray(j) ? j : [j]).map((d, i) => ({ ...POINTS[i], gust: d.current?.wind_gusts_10m ?? 0, code: d.current?.weather_code ?? 0, snow: (d.current?.snowfall ?? 0) > 0 || SNOW.includes(d.current?.weather_code) }))
}

function Sky() {
  const st = useAsync(loadSky, [])
  if (st.loading) return <p className="muted small">하늘 상태를 보는 중…</p>
  if (st.error) return <p className="muted small">하늘 상태를 불러오지 못했어요. <button type="button" className="link-btn" onClick={st.reload}>다시 시도</button></p>
  const signs = []
  const gusty = st.data.filter((p) => p.gust >= 14).sort((a, b) => b.gust - a.gust)
  if (gusty.length) signs.push(`💨 돌풍이 강해요: ${gusty.map((p) => `${p.name} ${p.gust.toFixed(0)}m/s`).join(', ')}${gusty[0].gust >= 20 ? ' (강풍 특보 수준)' : ''}`)
  const rainy = st.data.filter((p) => p.code === 65 || p.code === 82 || p.code >= 95)
  if (rainy.length) signs.push(`🌧️ 강한 비·천둥번개 신호: ${rainy.map((p) => p.name).join(', ')}`)
  const snowy = st.data.filter((p) => p.snow)
  if (snowy.length) signs.push(`❄️ 눈이 오고 있어요: ${snowy.map((p) => p.name).join(', ')}`)
  return (
    <p className={`notice${signs.length ? '' : ' calm'}`} style={{ display: 'block' }}>
      {signs.length ? signs.map((s) => <span key={s} style={{ display: 'block' }}>{s}</span>) : <>✅ 지금 하늘에는 강풍·폭우·눈 신호가 없어요.</>}
      <small className="muted" style={{ display: 'block' }}>예보 모델로 본 추정이라 공식 특보와 다를 수 있어요.</small>
    </p>
  )
}

// 읽은 범위를 같이 알려 줘요 (전국 최근 몇 건, 몇 시간 전 것까지)
const msgEmpty = (m) => (m.scanned ? `최근 ${m.hours}시간 동안 제주에 온 재난문자가 없어요. (전국 최근 ${m.scanned}건 확인)` : '조회된 재난문자가 없어요.')

function Block({ title, res, empty, children }) {
  return (
    <div className="alert-block">
      <h3 className="sub-title">{title}</h3>
      {!res.ok ? (
        <p className="notice" style={{ display: 'block' }}>
          자동으로 불러오지 못했어요. {res.keyProblem ? '이 서비스의 공공데이터 활용신청이나 키 설정이 필요해요. ' : ''}아래 공식 사이트에서 확인하세요.
          <small className="muted" style={{ display: 'block' }}>{res.error}</small>
        </p>
      ) : res.items.length ? children : <p className="notice calm" style={{ display: 'block' }}>✅ {empty}</p>}
    </div>
  )
}

export default function LiveAlerts() {
  const st = useAsync(fetchAlerts, [])
  return (
    <>
      <Sky />
      {st.loading ? <Loading /> : st.error ? (
        <p className="notice" style={{ display: 'block' }}>특보·재난문자를 불러오지 못했어요. 아래 공식 사이트에서 확인하세요. <button type="button" className="link-btn" onClick={st.reload}>다시 시도</button></p>
      ) : (
        <>
          <Block title="📢 기상특보 (최근 24시간, 기상청)" res={st.data.warnings} empty="최근 24시간 동안 제주에 발표된 기상특보가 없어요.">
            <ul className="alert-list">{st.data.warnings.items.map((w) => <li key={w.at + w.title}><b>{w.time}</b> {w.title}</li>)}</ul>
            <p className="muted small">발표된 기록이에요. 지금도 유효한지(해제됐는지)는 기상청 사이트에서 확인하세요.</p>
          </Block>
          <Block title="📱 재난문자 (행정안전부)" res={st.data.messages} empty={msgEmpty(st.data.messages)}>
            <ul className="alert-list">{st.data.messages.items.map((m) => <li key={m.time + m.msg}><b>{m.time.slice(5, 16).replace('/', '월 ').replace(' ', '일 ')}</b> <span className="muted">{m.where}</span><br />{m.msg}</li>)}</ul>
          </Block>
        </>
      )}
    </>
  )
}
