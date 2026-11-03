// 3D 지도 카메라가 섬을 어느 쪽에서 보고 있는지(방위각, 도). 0 = 남쪽에서 북쪽을 보는 기본 화면, 양수 = 카메라가 동쪽으로 돈 정도.
// 지도(Scene3D)가 값을 알려 주고, 바람 나침반이 구독해서 동서남북을 화면에 맞춰 돌려요.
import { useSyncExternalStore } from 'react'

let az = 0
const listeners = new Set()
export function setAzimuth(deg) {
  if (Math.abs(deg - az) < 0.4) return
  az = deg
  listeners.forEach((l) => l())
}
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }
export const useAzimuth = () => useSyncExternalStore(subscribe, () => az, () => 0)
