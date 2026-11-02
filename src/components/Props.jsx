import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toXZ } from '../lib/geo'
import { spriteTexture } from '../lib/spriteArt'
import { heightAt, onLand, snapToLand } from '../lib/terrain'

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


// ── 움직임 도우미 ─────────────────────────────────────────────
const rand = (a, b) => a + Math.random() * (b - a)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b)) // a 를 향해 돌려야 하는 각도(−π~π)
const calm = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches // 움직임 줄이기 설정이면 가만히

// 화면 기준 좌우 방향: 스프라이트는 카메라를 향해 돌아서 있으니, 이동 방향이 화면에서 오른쪽인지 왼쪽인지 계산
const screenSide = (vx, vz, rotY) => vx * Math.cos(rotY) - vz * Math.sin(rotY)

// 조랑말: 집(초원) 근처를 천천히 걷다가, 쉬다가, 가끔 가볍게 속보로 뜁니다. 해안 밖으로는 나가지 않아요.
function Pony({ x: hx, z: hz, s, i, wind }) {
  const ref = useRef()
  const st = useRef({ x: hx, z: hz, tx: hx, tz: hz, mode: 'rest', timer: rand(0.5, 4), speed: 0, gait: 0.2, phase: rand(0, 6), flip: 1, fx: 1 })
  const still = useMemo(calm, [])
  const pickTarget = (a) => {
    for (let k = 0; k < 10; k++) {
      const ang = rand(0, Math.PI * 2), d = rand(0.3, 0.95)
      const [tx, tz] = snapToLand(hx + Math.cos(ang) * d, hz + Math.sin(ang) * d, 0.3)
      if (Math.hypot(tx - hx, tz - hz) < 1.3 && Math.hypot(tx - a.x, tz - a.z) > 0.25) { a.tx = tx; a.tz = tz; return true }
    }
    return false
  }
  useFrame(({ camera, clock }, dt) => {
    const g = ref.current
    if (!g) return
    const a = st.current
    dt = Math.min(dt, 0.05)
    if (!still) {
      if (a.mode === 'rest') {
        a.timer -= dt
        a.speed += (0 - a.speed) * Math.min(1, dt * 3)
        if (a.timer <= 0 && pickTarget(a)) { a.mode = 'walk'; a.gait = Math.random() < 0.22 ? 0.5 : 0.22 } // 가끔만 속보
        else if (a.timer <= 0) a.timer = rand(1, 3)
      } else {
        const dx = a.tx - a.x, dz = a.tz - a.z, dist = Math.hypot(dx, dz)
        if (dist < 0.06) { a.mode = 'rest'; a.timer = rand(3, 8) }
        else {
          a.speed += (a.gait - a.speed) * Math.min(1, dt * 1.6) // 서서히 빨라지고 서서히 멈춤
          const slow = clamp(dist / 0.35, 0.25, 1) // 도착 직전에는 감속
          const step = a.speed * slow * dt
          const nx = a.x + (dx / dist) * step, nz = a.z + (dz / dist) * step
          if (onLand(nx, nz)) { a.x = nx; a.z = nz; a.dirx = dx / dist; a.dirz = dz / dist } else { a.mode = 'rest'; a.timer = rand(1, 3) }
          a.phase += dt * (3 + a.speed * 14)
        }
      }
    }
    const rotY = Math.atan2(camera.position.x - a.x, camera.position.z - a.z)
    if (a.dirx !== undefined && a.speed > 0.03) { const side = screenSide(a.dirx, a.dirz, rotY); if (Math.abs(side) > 0.05) a.flip = side > 0 ? 1 : -1 }
    a.fx += (a.flip - a.fx) * Math.min(1, dt * 7) // 방향을 바꿀 때 부드럽게 뒤집힘
    const move = clamp(a.speed / 0.5, 0, 1)
    const hop = Math.abs(Math.sin(a.phase)) * (0.012 + 0.05 * move) * (a.speed > 0.03 ? 1 : 0) // 걸음 따라 살짝 통통
    const y = Math.max(0, heightAt(a.x, a.z))
    g.position.set(a.x, y + s * 0.46 + hop, a.z)
    g.rotation.y = rotY
    g.scale.x = a.fx
    g.rotation.z = a.speed > 0.03 ? Math.sin(a.phase) * 0.035 * a.fx : Math.sin(clock.elapsedTime * (1.5 + wind * 0.15) + i) * Math.min(0.14, wind * 0.012)
  })
  return (
    <group ref={ref} position={[hx, 0, hz]}>
      <mesh raycast={NR}>
        <planeGeometry args={[s, s]} />
        <meshBasicMaterial map={spriteTexture('pony')} transparent alphaTest={0.08} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// 돌고래: 바다를 이리저리 헤엄치다가, 가끔 물 위로 부드럽게 뛰어올랐다 들어갑니다. 육지에 가까워지거나 너무 멀어지면 천천히 방향을 틉니다.
function Dolphin({ x: hx, z: hz, s, i }) {
  const ref = useRef()
  const st = useRef({ x: hx + rand(-0.6, 0.6), z: hz + rand(-0.6, 0.6), h: rand(0, Math.PI * 2), turn: 0, turnTarget: 0, tTimer: rand(1, 3), speed: rand(0.45, 0.65), jump: -1, jTimer: rand(2, 8), flip: 1, fx: 1, phase: rand(0, 6) })
  const still = useMemo(calm, [])
  useFrame(({ camera, clock }, dt) => {
    const g = ref.current
    if (!g) return
    const a = st.current
    dt = Math.min(dt, 0.05)
    const R = 2.3 // 이 안에서만 돌아다님
    if (!still) {
      a.tTimer -= dt
      if (a.tTimer <= 0) { a.turnTarget = rand(-0.55, 0.55); a.tTimer = rand(2, 4.5); if (Math.random() < 0.3) a.speed = rand(0.4, 0.7) }
      a.turn += (a.turnTarget - a.turn) * Math.min(1, dt * 1.2) // 부드러운 방향 변화
      a.h += a.turn * dt
      const ax = a.x + Math.cos(a.h) * 1.0, az = a.z + Math.sin(a.h) * 1.0
      const far = Math.hypot(a.x - hx, a.z - hz) > R
      if (far || onLand(ax, az)) { // 육지가 앞에 있거나 너무 멀면 바다 쪽(집)으로 천천히 선회
        const want = Math.atan2(hz - a.z, hx - a.x)
        a.h += clamp(angleDiff(want, a.h), -1.1 * dt, 1.1 * dt)
      }
      const nx = a.x + Math.cos(a.h) * a.speed * dt, nz = a.z + Math.sin(a.h) * a.speed * dt
      if (!onLand(nx, nz)) { a.x = nx; a.z = nz } else a.h += Math.PI * 0.6 * dt
      a.phase += dt * 2.2
      a.jTimer -= dt
      if (a.jump < 0 && a.jTimer <= 0) { a.jump = 0; a.jTimer = rand(7, 14) }
      if (a.jump >= 0) { a.jump += dt / 1.5; if (a.jump >= 1) a.jump = -1 } // 한 번 뛰는 데 1.5초
    }
    const rotY = Math.atan2(camera.position.x - a.x, camera.position.z - a.z)
    const side = screenSide(Math.cos(a.h), Math.sin(a.h), rotY)
    if (Math.abs(side) > 0.08) a.flip = side > 0 ? 1 : -1
    a.fx += (a.flip - a.fx) * Math.min(1, dt * 4)
    const u = a.jump >= 0 ? a.jump : 0
    const lift = a.jump >= 0 ? 4 * 0.5 * u * (1 - u) : 0 // 포물선(최고 높이 0.5)
    const slope = a.jump >= 0 ? 4 * 0.5 * (1 - 2 * u) : 0 // 오를 땐 코가 위로, 내려갈 땐 아래로
    g.position.set(a.x, -0.3 + s * 0.46 + Math.sin(a.phase) * 0.03 + lift, a.z)
    g.rotation.y = rotY
    g.scale.x = a.fx
    g.rotation.z = (Math.atan(slope) * 0.55 + Math.sin(clock.elapsedTime * 1.3 + i) * 0.04) * a.fx
  })
  return (
    <group ref={ref} position={[hx, -0.3, hz]}>
      <mesh raycast={NR}>
        <planeGeometry args={[s, s]} />
        <meshBasicMaterial map={spriteTexture('dolphin')} transparent alphaTest={0.08} toneMapped={false} side={THREE.DoubleSide} />
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
  // 해녀: 바닷가 (마지막 숫자 = 해안에서 안쪽으로 들어오는 거리)
  ['haenyeo', 33.552, 126.82, 0.6, 0.12], ['haenyeo', 33.462, 126.93, 0.58, 0.1], ['haenyeo', 33.205, 126.30, 0.56, 0.1], ['haenyeo', 33.50, 126.30, 0.55, 0.1],
]
// 바다 위 소품 [종류, 위도, 경도, 크기]: 좌표를 해안에 맞추지 않고 물 위에 둥실 띄움
// 조랑말(중산간 초원, 걸어 다님) [위도, 경도, 크기]
const PONIES = [[33.395, 126.44, 0.62], [33.375, 126.76, 0.6], [33.43, 126.33, 0.55], [33.41, 126.60, 0.5], [33.34, 126.70, 0.55], [33.45, 126.50, 0.52]]
// 돌고래(바다에서 헤엄침) [위도, 경도, 크기]
const DOLPHINS = [[33.60, 126.70, 0.62], [33.16, 126.20, 0.6], [33.20, 126.78, 0.58], [33.62, 126.40, 0.56], [33.31, 127.08, 0.58]]
const SEA = [
  ['taewak', 33.585, 126.80, 0.42], ['taewak', 33.47, 126.99, 0.4], ['taewak', 33.18, 126.28, 0.4], ['taewak', 33.54, 126.28, 0.4],
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
  const ponies = useMemo(() => PONIES.map(([la, ln, s], j) => { const [x, z] = snapToLand(...toXZ(la, ln), 0.35); return { x, z, s: s * 1.35, i: 100 + j } }), [])
  const dolphins = useMemo(() => DOLPHINS.map(([la, ln, s], j) => { const [x, z] = toXZ(la, ln); return { x, z, s: s * 1.35, i: 200 + j } }), [])
  return (
    <>
      {placed.map(({ k, x, z, y, s, i, bob }) => <Sprite key={i} kind={k} x={x} y={y} z={z} s={s} wind={wind} i={i} bob={bob} />)}
      {ponies.map((p) => <Pony key={p.i} {...p} wind={wind} />)}
      {dolphins.map((d) => <Dolphin key={d.i} {...d} />)}
    </>
  )
}
