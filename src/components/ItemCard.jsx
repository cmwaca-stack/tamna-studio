import { useEffect, useState } from 'react'
import { wikiImage } from '../lib/wikiImage'

// 장소·유산·노트 등 "목록의 한 칸"을 모두 이 카드 하나로 표시합니다 (재사용 컴포넌트)
// autoImage: 사진 주소(image)가 없을 때 이름으로 위키백과에서 사진을 찾아 붙여요 (장소·유산 카드용)
export default function ItemCard({ title, subtitle, image, badge, tone = 'tour', autoImage = false, onSave, children }) {
  const [found, setFound] = useState(null)
  useEffect(() => {
    if (image || !autoImage) return undefined
    let alive = true
    wikiImage(title).then((r) => alive && setFound(r))
    return () => { alive = false }
  }, [title, image, autoImage])
  const src = image || found?.src
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
        : <div className="card-img empty"><i className={`bi bi-${tone === 'heritage' ? 'bank2' : 'image'}`} /></div>}
      <div className="card-body">
        {badge && <span className={`tag ${tone}`}>{badge}</span>}
        <h3>{title}</h3>
        {subtitle && <p className="muted">{subtitle}</p>}
        {children}
        {onSave && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onSave}>
            <i className="bi bi-bookmark-plus" />노트에 저장
          </button>
        )}
      </div>
    </article>
  )
}
