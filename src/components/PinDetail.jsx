// 3D 핀·목록에서 고른 소재의 상세 + 저장 버튼
export default function PinDetail({ pin, onSave, onClose }) {
  if (!pin) return null
  const isTour = pin.source === 'tour'
  return (
    <div className="pin-detail glass">
      {pin.image && <img src={pin.image} alt="" />}
      <div className="pin-detail-text">
        <span className={`tag ${pin.source}`} style={pin.color ? { background: pin.color, color: '#fff' } : undefined}>{pin.label ?? (isTour ? '장소·전시' : '국가유산')}</span>
        <strong>{pin.title}</strong>
        {pin.sub && <span className="muted">{pin.sub}</span>}
      </div>
      <div className="pin-detail-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onSave(pin)}>
          <i className="bi bi-bookmark-plus" />노트에 저장
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="닫기"><i className="bi bi-x-lg" /></button>
      </div>
    </div>
  )
}
