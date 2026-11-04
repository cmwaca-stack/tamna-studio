import { ApiError } from '../Status'
import { Loading } from '../Status'
import { useAsync } from '../../hooks/useAsync'

// 제주 바다 4방향의 지금 파도 높이 (오픈메테오 해양 예측 모델, 키 없이 사용). 해안 가까이는 값이 다를 수 있어요.
const SEAS = [
  { name: '제주 북쪽 바다', note: '제주항·함덕 쪽', lat: 33.6, lng: 126.55 },
  { name: '제주 남쪽 바다', note: '서귀포·중문 쪽', lat: 33.15, lng: 126.55 },
  { name: '제주 동쪽 바다', note: '성산·우도 쪽', lat: 33.45, lng: 127.0 },
  { name: '제주 서쪽 바다', note: '한림·협재 쪽', lat: 33.4, lng: 126.1 },
]
const LV = [
  { max: 0.5, text: '잔잔해요', tone: 'good', emoji: '😊', tip: '바다 활동하기 좋아요' },
  { max: 1.5, text: '보통이에요', tone: 'ok', emoji: '🙂', tip: '물놀이·낚시는 조심하세요' },
  { max: 2.5, text: '높아요', tone: 'bad', emoji: '🌊', tip: '방파제·갯바위 근처는 위험해요. 배편은 꼭 확인하세요' },
  { max: Infinity, text: '매우 높아요', tone: 'worse', emoji: '🚫', tip: '바닷가에 가지 마세요. 배가 안 뜰 수 있어요' },
]
const levelOf = (h) => LV.find((l) => h <= l.max)

async function load() {
  const q = new URLSearchParams({ latitude: SEAS.map((s) => s.lat).join(','), longitude: SEAS.map((s) => s.lng).join(','), current: 'wave_height,wave_period', timezone: 'Asia/Seoul' })
  const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?${q}`)
  if (!res.ok) throw new Error('바다 날씨를 불러오지 못했어요')
  const j = await res.json()
  return (Array.isArray(j) ? j : [j]).map((d, i) => ({ ...SEAS[i], h: d.current?.wave_height, p: d.current?.wave_period, t: d.current?.time }))
}

export default function SeaWaves() {
  const st = useAsync(load, [])
  if (st.loading) return <Loading />
  if (st.error) return <ApiError error={st.error} onRetry={st.reload} />
  return (
    <>
      <div className="air-grid">
        {st.data.map((s) => {
          if (s.h == null) return <article key={s.name} className="air-card"><h3>{s.name}</h3><p className="muted small">값이 없어요</p></article>
          const lv = levelOf(s.h)
          return (
            <article key={s.name} className={`air-card tone-${lv.tone}`}>
              <h3>{s.name} <span aria-hidden="true">{lv.emoji}</span></h3>
              <p className="muted small">{s.note}</p>
              <p className="air-main">{s.h.toFixed(1)}m <small>{lv.text}</small></p>
              <p className="muted small">{lv.tip}</p>
              <p className="muted small">파도 간격 {s.p?.toFixed(1) ?? '-'}초 · {s.t?.slice(11, 16)} 기준</p>
            </article>
          )
        })}
      </div>
      <p className="muted small">먼 바다를 계산한 예측값이에요. 항구와 해안은 값이 다를 수 있어요. 배가 뜨는지는 아래 배편 안내에서 꼭 확인하세요.</p>
    </>
  )
}
