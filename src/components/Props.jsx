import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toXZ } from '../lib/geo'
import { spriteTexture } from '../lib/spriteArt'
import { heightAt, snapToLand } from '../lib/terrain'

// 제주를 상징하는 귀여운 일러스트 스티커: 돌하르방 · 귤 · 귤나무 · 유채꽃 · 초가집 · 동백 · 조랑말 · 해녀 · 테왁 · 돌고래
// 카메라를 향해 항상 서 있고, 핀 클릭을 막지 않도록 레이캐스트를 끕니다.
const NR = () => null

// 어느 방향에서 봐도 앞면이 보이도록, 매 프레임 카메라 쪽으로 (세로축만) 돌려 세웁니다.
function Sprite({ kind, x, y, z, s, wind, i, bob }) {
  const ref = useRef()
  useFrame(({ camera, clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.atan2(camera.position.x - x, camera.position.z - z)
    ref.current.rotation.z = Math.sin(clock.elapsedTime * (1.5 + wind * 0.15) + i) * Math.min(0.14, wind * 0.012) // 바람에 살랑살랑
    if (bob) ref.current.position.y = y + s * 0.46 + Math.sin(clock.elapsedTime * 1.6 + i * 2) * 0.035 * (1 + wind * 0.15) // 바다 위에서 둥실둥실
  })
  return (
    <group ref={ref} position={[x, y + s * 0.46, z]}>
      <mesh raycast={NR}>
        <planeGeometry args={[s, s]} />
        <meshBasicMaterial map={spriteTexture(kind)} transparent alphaTest={0.08} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// [종류, 위도, 경도, 크기]
const PROPS = [
  ['orange', 33.268, 126.58, 0.62], ['orange', 33.285, 126.50, 0.58], ['orange', 33.292, 126.64, 0.58], ['orange', 33.30, 126.40, 0.55], ['tangerine', 33.262, 126.68, 0.4], ['tangerine', 33.275, 126.45, 0.38],
  ['camellia', 33.285, 126.665, 0.5], ['camellia', 33.45, 126.67, 0.5], ['camellia', 33.30, 126.37, 0.46], ['camellia', 33.40, 126.28, 0.46],
  ['rape', 33.372, 126.705, 0.55], ['rape', 33.43, 126.90, 0.5], ['rape', 33.47, 126.76, 0.45], ['rape', 33.30, 126.30, 0.45], ['rape', 33.40, 126.74, 0.45],
  ['hut', 33.388, 126.80, 0.62], ['hut', 33.33, 126.24, 0.52], ['hut', 33.36, 126.62, 0.52], ['hut', 33.48, 126.85, 0.5],
  ['hare', 33.508, 126.54, 0.62], ['hare', 33.235, 126.50, 0.62], ['hare', 33.43, 126.93, 0.5],
  // 조랑말: 중산간 초원
  ['pony', 33.395, 126.44, 0.62], ['pony', 33.375, 126.76, 0.6], ['pony', 33.43, 126.33, 0.55], ['pony', 33.41, 126.60, 0.5],
  // 해녀: 바닷가 (마지막 숫자 = 해안에서 안쪽으로 들어오는 거리)
  ['haenyeo', 33.552, 126.82, 0.6, 0.12], ['haenyeo', 33.462, 126.93, 0.58, 0.1], ['haenyeo', 33.205, 126.30, 0.56, 0.1], ['haenyeo', 33.50, 126.30, 0.55, 0.1],
]
// 바다 위 소품 [종류, 위도, 경도, 크기]: 좌표를 해안에 맞추지 않고 물 위에 둥실 띄움
const SEA = [
  ['taewak', 33.585, 126.80, 0.42], ['taewak', 33.47, 126.99, 0.4], ['taewak', 33.18, 126.28, 0.4], ['taewak', 33.54, 126.28, 0.4],
  ['dolphin', 33.60, 126.70, 0.62], ['dolphin', 33.16, 126.20, 0.6], ['dolphin', 33.20, 126.78, 0.58],
]

export default function Props({ wind = 2 }) {
  const placed = useMemo(() => [
    ...PROPS.map(([k, la, ln, s, margin = 0.25], i) => {
      const [x, z] = snapToLand(...toXZ(la, ln), margin)
      return { k, x, z, y: Math.max(0, heightAt(x, z)), s: s * 1.35, i }
    }),
    ...SEA.map(([k, la, ln, s], j) => {
      const [x, z] = toXZ(la, ln)
      return { k, x, z, y: -0.3, s: s * 1.35, i: PROPS.length + j, bob: true }
    }),
  ], [])
  return placed.map(({ k, x, z, y, s, i, bob }) => <Sprite key={i} kind={k} x={x} y={y} z={z} s={s} wind={wind} i={i} bob={bob} />)
}
