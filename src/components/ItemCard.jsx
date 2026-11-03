import { useEffect, useState } from 'react'
import MiniMap from './MiniMap'
import { wikiImage } from '../lib/wikiImage'

// 장소·유산 등 "목록의 한 칸"을 모두 이 카드 하나로 표시합니다 (재사용 컴포넌트)
// autoImage: 사진 주소(image)가 없을 때 이름으로 위키백과에서 사진을 찾아 붙여요 (장소·유산 카드용)
export default function ItemCard({ title, subtitle, image, badge, tone = 'tour', autoImage = false, lat, lng, emoji, children }) {
  const [found, setFound] = useState(null)
  useEffect(() => {
    if (image || !autoImage) return undefined
    let alive = true
    wikiImage(title).then((r) => alive && setFound(r))
    return () => { alive = false }
  }, [title, image, autoImage])
  const src = image || found?.src
  // 좌표가 있으면 그 위치를, 없으면 이름(앞에 '제주')으로 다음지도에서 찾아요
  const mapUrl = lat && lng
    ? `https://map.kakao.com/link/map/${encodeURIComponent(title)},${lat},${lng}`
    : `https://map.kakao.com/?q=${encodeURIComponent(/제주|서귀포/.test(title) ? title : `제주 ${title}`)}`
  const reference = !image && found && !found.exact // 같은 종류의 대표 사진이면 "참고 이미지"로 표시
  return (
    <article className="card">
      {src
        ? (
          <div className="card-photo">
            <img className="card-img" src={src} alt={title} loading="lazy" onError={() => setFound(null)} />
            {reference && <span className="img-note">참고 이미지</span>}
          </div>
        )
        : lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
          ? (
            <div className="card-photo">
              <MiniMap lat={lat} lng={lng} />
              <span className="img-note">위치 지도</span>
            </div>
          )
          : <div className="card-img empty"><span aria-hidden="true">{emoji ?? (tone === 'heritage' ? '🏯' : '📍')}</span></div>}
      <div className="card-body">
        {badge && <span className={`tag ${tone}`}>{badge}</span>}
        <h3><a className="card-link" href={mapUrl} target="_blank" rel="noreferrer" title="다음지도에서 위치 보기">{title}</a></h3>
        {subtitle && <p className="muted">{subtitle}</p>}
        <span className="map-hint">📍 다음지도에서 위치 보기</span>
        {children}
      </div>
    </article>
  )
}
