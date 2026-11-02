// 장소·유산·노트 등 "목록의 한 칸"을 모두 이 카드 하나로 표시합니다 (재사용 컴포넌트)
export default function ItemCard({ title, subtitle, image, badge, tone = 'tour', onSave, children }) {
  return (
    <article className="card">
      {image
        ? <img className="card-img" src={image} alt={title} loading="lazy" />
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
