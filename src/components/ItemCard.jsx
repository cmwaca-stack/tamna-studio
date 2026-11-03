import { useEffect, useState } from 'react'
import MiniMap from './MiniMap'
import { spotExtra } from '../lib/spotExtra'
import { wikiImage } from '../lib/wikiImage'

// 장소·유산 등 "목록의 한 칸"을 모두 이 카드 하나로 표시합니다 (재사용 컴포넌트)
// autoImage: 사진 주소(image)가 없을 때 이름으로 사진을 찾아 붙여요 (장소·유산 카드용)
//   1) 위키백과에서 이름이 정확히 맞는 사진  2) 카카오 이미지 검색으로 미리 찾아 둔 사진("검색 이미지")  3) 위키백과의 같은 종류 대표 사진("참고 이미지")  4) 위치 지도
export default function ItemCard({ title, subtitle, image, badge, tone = 'tour', autoImage = false, lat, lng, emoji, imgNote, children }) {
  const [found, setFound] = useState(null)
  const [broken, setBroken] = useState(false) // 사진 주소가 깨지면 위치 지도로 바꿔요
  const [extra, setExtra] = useState(null) // 미리 찾아 둔 검색 이미지
  useEffect(() => {
    if (image || !autoImage) return undefined
    let alive = true
    wikiImage(title).then((r) => alive && setFound(r))
    spotExtra(title).then((r) => alive && setExtra(r))
    return () => { alive = false }
  }, [title, image, autoImage])
  const own = !broken && image
  const wikiOk = found?.exact ? found.src : null
  const src = own || wikiOk || extra || found?.src
  const searched = !own && !wikiOk && !!extra
  // 좌표가 있으면 그 위치를, 없으면 이름(앞에 '제주')으로 다음지도에서 찾아요
  const mapUrl = lat && lng
    ? `https://map.kakao.com/link/map/${encodeURIComponent(title)},${lat},${lng}`
    : `https://map.kakao.com/?q=${encodeURIComponent(/제주|서귀포/.test(title) ? title : `제주 ${title}`)}`
  const reference = !own && !wikiOk && !extra && found && !found.exact // 같은 종류의 대표 사진이면 "참고 이미지"로 표시
  return (
    <article className="card">
      {src
        ? (
          <div className="card-photo">
            <img className="card-img" src={src} alt={title} loading="lazy" onError={() => { if (src === extra) setExtra(null); else { setFound(null); setBroken(true) } }} />
            {(imgNote || searched || reference) && <span className="img-note">{imgNote || (searched ? '검색 이미지' : '참고 이미지')}</span>}
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
