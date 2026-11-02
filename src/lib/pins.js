import { isOnJeju } from './geo'

// 공공 API 결과를 3D 핀 모양으로 통일합니다. (좌표가 없거나 제주 밖이면 제외)
export const tourToPins = (list = []) =>
  list
    .map((p) => ({
      key: `tour-${p.id}`, source: 'tour', id: String(p.id), title: p.title, sub: p.addr, image: p.image,
      lat: Number(p.lat), lng: Number(p.lng),
    }))
    .filter((p) => isOnJeju(p.lat, p.lng))

export const heritageToPins = (list = []) =>
  list
    .map((h) => ({
      key: `heritage-${h.id}`, source: 'heritage', id: String(h.id), title: h.name,
      sub: [h.kind, h.city].filter(Boolean).join(' · '),
      lat: Number(h.lat), lng: Number(h.lng),
    }))
    .filter((p) => isOnJeju(p.lat, p.lng))

// 비가 오거나 강수확률 60% 이상이면 3D 장면에 비를 내립니다.
export const isRainy = (w) => Boolean(w) && (w.rain !== '없음' || w.pop >= 60)

// 테마 고정 핀(오름·4·3 희생지): 테마 색으로 구분해 표시
export const spotToPins = (list = [], color, label) =>
  list.map((s) => ({ key: `spot-${s.id}`, source: 'spot', id: s.id, title: s.title, sub: s.sub, lat: s.lat, lng: s.lng, color, label }))
