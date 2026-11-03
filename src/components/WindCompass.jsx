import { useAzimuth } from '../lib/azimuth'
import { blowAngle, windName } from '../lib/windDir'

// 바람이 불어 가는 쪽을 가리키는 작은 화살표
export function WindArrow({ dir, size = 14, extra = 0 }) {
  if (!Number.isFinite(dir)) return null
  return (
    <svg className="wind-arrow" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${blowAngle(dir) + extra}deg)` }}>
      <path d="M12 2 L19 20 L12 16 L5 20 Z" fill="currentColor" />
    </svg>
  )
}

// 지도 왼쪽 아래: 지금 바람이 어느 방향에서 얼마나 세게 부는지 (방위 눈금 + 화살표)
const R = 22 // 글자가 놓이는 반지름(px)
export default function WindCompass({ dir, speed, place = '제주시' }) {
  const az = useAzimuth() // 지도 카메라가 돈 만큼 동서남북도 같이 돌려요
  if (!Number.isFinite(dir)) return null
  const from = windName(dir)
  return (
    <div className="wind-compass" title={`${place} 지금 바람: ${from}, 초속 ${speed}m`}>
      <span className="wc-dial" aria-hidden="true">
        {[['북', 0, true], ['동', 90], ['남', 180], ['서', 270]].map(([t, bearing, north]) => {
          const a = ((bearing + az) * Math.PI) / 180 // 화면에서 그 방위가 가리키는 쪽
          return <b key={t} className={north ? 'wc-n' : ''} style={{ transform: `translate(-50%, -50%) translate(${Math.sin(a) * R}px, ${-Math.cos(a) * R}px)` }}>{t}</b>
        })}
        <WindArrow dir={dir} size={30} extra={az} />
      </span>
      <span className="wc-text"><strong>{from}</strong> {speed}m/s<small>{place} · 이 방향으로 불어 가요</small></span>
    </div>
  )
}
