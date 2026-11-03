// 사진이 없는 장소 카드에 보여 주는 "위치 지도": OpenStreetMap 타일 3×3 장을 이어 붙이고 가운데에 핀을 꽂아요.
const Z = 14 // 확대 단계 (오름·해변의 모양이 보이는 정도)
const TILE = 256

export default function MiniMap({ lat, lng }) {
  const n = 2 ** Z
  const rad = (Number(lat) * Math.PI) / 180
  const xt = ((Number(lng) + 180) / 360) * n
  const yt = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n
  const x0 = Math.floor(xt) - 1
  const y0 = Math.floor(yt) - 1
  const tiles = [0, 1, 2].flatMap((dy) => [0, 1, 2].map((dx) => ({ x: x0 + dx, y: y0 + dy, dx, dy })))
  return (
    <div className="minimap" role="img" aria-label="위치 지도">
      <div className="minimap-grid" style={{ marginLeft: -(xt - x0) * TILE, marginTop: -(yt - y0) * TILE }}>
        {tiles.map((t) => (
          <img key={`${t.x}-${t.y}`} src={`https://tile.openstreetmap.org/${Z}/${t.x}/${t.y}.png`} alt="" loading="lazy" draggable="false"
            style={{ left: t.dx * TILE, top: t.dy * TILE }} />
        ))}
      </div>
      <span className="minimap-pin" aria-hidden="true">📍</span>
      <small className="minimap-credit">© OpenStreetMap</small>
    </div>
  )
}
