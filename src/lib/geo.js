// 위도·경도 → 3D 장면 좌표 (제주섬 중심 북위 33.38°, 동경 126.565° 기준, 경도 1° ≈ 17 단위)
export const toXZ = (lat, lng) => [(lng - 126.565) * 17, (33.38 - lat) * 20]
export const isOnJeju = (lat, lng) => lat > 33.1 && lat < 33.6 && lng > 126.1 && lng < 127.0
