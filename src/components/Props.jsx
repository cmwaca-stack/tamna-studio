import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { toXZ } from '../lib/geo'
import { spriteTexture } from '../lib/spriteArt'
import { heightAt, onLand, snapToLand } from '../lib/terrain'

// 제주를 상징하는 귀여운 일러스트 스티커: 돌하르방 · 귤 · 귤나무 · 유채꽃 · 초가집 · 동백 · 조랑말 · 해녀 · 테왁 · 돌고래 · 비행기 · 오징어 · 갈치 · 흑돼지 · 낚시배 · 산방산 · 성산일출봉 · 우도봉·소 · 비양도 · 용두암 · 주상절리 · 정방폭포 · 마라도
// 카메라를 향해 항상 서 있고, 핀 클릭을 막지 않도록 레이캐스트를 끕니다.
const NR = () => null

// 마우스를 올리면 이름을 알려 주는 작은 글씨: 제주를 대표하는 지형지물만 (동물·꽃·집 등은 설명 없음)
const LABELS = {
  sanbang: '산방산', seongsan: '성산일출봉', udobong: '우도봉', biyang: '비양도', yongdu: '용두암',
  jusang: '주상절리', jeongbang: '정방폭포', marado: '마라도 (최남단)',
}
const HOVER = new Set() // 지금 화면에 있는 일러스트들
function useHover(ref, kind, s) {
  useEffect(() => {
    if (!LABELS[kind]) return undefined
    const it = { ref, kind, s }
    HOVER.add(it)
    return () => HOVER.delete(it)
  }, [ref, kind, s])
}

// 포인터가 일러스트 위에 있는지 화면 좌표로 직접 계산해요 (핀 클릭을 가로막지 않도록 3D 클릭 판정은 그대로 꺼 둠)
function HoverLabels() {
  const { gl, camera } = useThree()
  useEffect(() => {
    const el = gl.domElement
    const host = el.parentElement
    if (!host || !camera.isPerspectiveCamera) return undefined
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative'
    const tip = document.createElement('div')
    tip.className = 'prop-tip'
    host.appendChild(tip)
    const v = new THREE.Vector3()
    const hide = () => { tip.style.display = 'none' }
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left, py = e.clientY - rect.top
      let best = null, bd = Infinity
      for (const it of HOVER) {
        const o = it.ref.current
        if (!o) continue
        o.getWorldPosition(v)
        const dist = v.distanceTo(camera.position)
        v.project(camera)
        if (v.z > 1) continue
        const half = it.s * 0.4 * (rect.height / (2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)))
        const cx = (v.x * 0.5 + 0.5) * rect.width, cy = (-v.y * 0.5 + 0.5) * rect.height
        if (Math.abs(px - cx) < half && Math.abs(py - cy) < half && dist < bd) { bd = dist; best = it }
      }
      const text = best && LABELS[best.kind]
      if (!text) { hide(); return }
      tip.textContent = text
      tip.style.left = `${px + 12}px`
      tip.style.top = `${py + 16}px`
      tip.style.display = 'block'
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', hide)
    el.addEventListener('pointerdown', hide)
    return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', hide); el.removeEventListener('pointerdown', hide); tip.remove() }
  }, [gl, camera])
  return null
}

// 어느 방향에서 봐도 앞면이 보이도록, 매 프레임 카메라 쪽으로 (세로축만) 돌려 세웁니다.
function Sprite({ kind, x, y, z, s, wind, i, bob }) {
  const ref = useRef()
  useHover(ref, kind, s)
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
function Pony({ x: hx, z: hz, s, i, wind, kind = 'pony' }) {
  const ref = useRef()
  useHover(ref, kind, s)
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
        <meshBasicMaterial map={spriteTexture(kind)} transparent alphaTest={0.08} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// 돌고래: 바다를 이리저리 헤엄치다가, 가끔 물 위로 부드럽게 뛰어올랐다 들어갑니다. 육지에 가까워지거나 너무 멀어지면 천천히 방향을 틉니다.
function Dolphin({ x: hx, z: hz, s, i }) {
  const ref = useRef()
  useHover(ref, 'dolphin', s)
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

// 낚시배: 돌고래처럼 바다 위를 천천히 오가요. 육지에 다가가면 방향을 틀고, 둥실둥실 흔들려요.
function Boat({ x: hx, z: hz, s, i }) {
  const ref = useRef()
  useHover(ref, 'boat', s)
  const st = useRef({ x: hx + rand(-0.4, 0.4), z: hz + rand(-0.4, 0.4), h: rand(0, Math.PI * 2), turn: 0, turnTarget: 0, tTimer: rand(2, 5), speed: rand(0.14, 0.24), flip: 1, fx: 1, phase: rand(0, 6) })
  const still = useMemo(calm, [])
  useFrame(({ camera, clock }, dt) => {
    const g = ref.current
    if (!g) return
    const a = st.current
    dt = Math.min(dt, 0.05)
    const R = 1.8
    if (!still) {
      a.tTimer -= dt
      if (a.tTimer <= 0) { a.turnTarget = rand(-0.35, 0.35); a.tTimer = rand(3, 6) }
      a.turn += (a.turnTarget - a.turn) * Math.min(1, dt * 0.8)
      a.h += a.turn * dt
      const ax = a.x + Math.cos(a.h) * 0.9, az = a.z + Math.sin(a.h) * 0.9
      if (Math.hypot(a.x - hx, a.z - hz) > R || onLand(ax, az)) a.h += clamp(angleDiff(Math.atan2(hz - a.z, hx - a.x), a.h), -0.9 * dt, 0.9 * dt)
      const nx = a.x + Math.cos(a.h) * a.speed * dt, nz = a.z + Math.sin(a.h) * a.speed * dt
      if (!onLand(nx, nz)) { a.x = nx; a.z = nz } else a.h += Math.PI * 0.5 * dt
      a.phase += dt * 1.4
    }
    const rotY = Math.atan2(camera.position.x - a.x, camera.position.z - a.z)
    const side = screenSide(Math.cos(a.h), Math.sin(a.h), rotY)
    if (Math.abs(side) > 0.08) a.flip = side > 0 ? 1 : -1
    a.fx += (a.flip - a.fx) * Math.min(1, dt * 2.5)
    g.position.set(a.x, -0.3 + s * 0.46 + Math.sin(a.phase) * 0.035, a.z)
    g.rotation.y = rotY
    g.scale.x = a.fx
    g.rotation.z = Math.sin(clock.elapsedTime * 1.1 + i) * 0.05
  })
  return (
    <group ref={ref} position={[hx, -0.3, hz]}>
      <mesh raycast={NR}>
        <planeGeometry args={[s, s]} />
        <meshBasicMaterial map={spriteTexture('boat')} transparent alphaTest={0.08} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// 오징어·갈치: 바다를 헤엄쳐 다녀요. 육지가 가까워지면 방향을 틀고, 꼬리를 흔들듯 몸을 살랑여요.
function Fish({ kind, x: hx, z: hz, s, i }) {
  const ref = useRef()
  useHover(ref, kind, s)
  const st = useRef({ x: hx + rand(-0.4, 0.4), z: hz + rand(-0.4, 0.4), h: rand(0, Math.PI * 2), turn: 0, turnTarget: 0, tTimer: rand(1, 3), speed: rand(0.3, 0.46), flip: 1, fx: 1, phase: rand(0, 6) })
  const still = useMemo(calm, [])
  useFrame(({ camera, clock }, dt) => {
    const g = ref.current
    if (!g) return
    const a = st.current
    dt = Math.min(dt, 0.05)
    const R = 1.9
    if (!still) {
      a.tTimer -= dt
      if (a.tTimer <= 0) { a.turnTarget = rand(-0.7, 0.7); a.tTimer = rand(1.5, 4) }
      a.turn += (a.turnTarget - a.turn) * Math.min(1, dt * 1.4)
      a.h += a.turn * dt
      const ax = a.x + Math.cos(a.h) * 0.8, az = a.z + Math.sin(a.h) * 0.8
      if (Math.hypot(a.x - hx, a.z - hz) > R || onLand(ax, az)) a.h += clamp(angleDiff(Math.atan2(hz - a.z, hx - a.x), a.h), -1.2 * dt, 1.2 * dt)
      const nx = a.x + Math.cos(a.h) * a.speed * dt, nz = a.z + Math.sin(a.h) * a.speed * dt
      if (!onLand(nx, nz)) { a.x = nx; a.z = nz } else a.h += Math.PI * 0.7 * dt
      a.phase += dt * 4
    }
    const rotY = Math.atan2(camera.position.x - a.x, camera.position.z - a.z)
    const side = screenSide(Math.cos(a.h), Math.sin(a.h), rotY)
    if (Math.abs(side) > 0.08) a.flip = side > 0 ? 1 : -1
    a.fx += (a.flip - a.fx) * Math.min(1, dt * 4)
    g.position.set(a.x, -0.3 + s * 0.46 + Math.sin(a.phase * 0.6) * 0.03, a.z)
    g.rotation.y = rotY
    g.scale.x = a.fx
    g.rotation.z = Math.sin(a.phase + i) * 0.09 * a.fx // 꼬리 흔들듯 살랑
  })
  return (
    <group ref={ref} position={[hx, -0.3, hz]}>
      <mesh raycast={NR}>
        <planeGeometry args={[s, s]} />
        <meshBasicMaterial map={spriteTexture(kind)} transparent alphaTest={0.08} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// 비행기 ① 직선 왕복: 제주공항에서 떠서 북·동·남쪽으로 곧게 날아갔다가 같은 길로 돌아와 내려앉기를 되풀이해요. 멀어질수록 높이 올라가고 서서히 흐려져요.
const smooth01 = (t) => t * t * (3 - 2 * t)
function Plane({ from, to, s, i, offset, period }) {
  const ref = useRef()
  const mat = useRef()
  const still = useMemo(calm, [])
  useFrame(({ camera, clock }) => {
    const g = ref.current
    if (!g) return
    const t = still ? offset * period : clock.elapsedTime
    const ph = (t / period + offset) % 1
    const out = ph < 0.5 // 앞쪽 절반: 육지로 가는 길, 뒤쪽 절반: 돌아오는 길
    const u = out ? ph * 2 : (1 - ph) * 2
    const x = from[0] + (to[0] - from[0]) * u, z = from[1] + (to[1] - from[1]) * u
    const y = 0.6 + 1.0 * smooth01(Math.min(1, u / 0.12)) + 1.0 * smooth01(u) // 활주로 근처는 낮게, 섬 위를 지날 땐 산보다 높게
    g.position.set(x, y, z)
    const rotY = Math.atan2(camera.position.x - x, camera.position.z - z)
    const vx = (to[0] - from[0]) * (out ? 1 : -1), vz = (to[1] - from[1]) * (out ? 1 : -1)
    const side = screenSide(vx, vz, rotY)
    g.rotation.y = rotY
    g.scale.x = side >= 0 ? 1 : -1
    g.rotation.z = (out ? 0.1 : -0.1) * g.scale.x // 올라갈 땐 코를 들고 내려올 땐 숙여요
    if (mat.current) mat.current.opacity = 1 - smooth01(clamp((u - 0.88) / 0.12, 0, 1)) // 멀어지면 흐려짐
  })
  return (
    <group ref={ref}>
      <mesh raycast={NR}>
        <planeGeometry args={[s, s]} />
        <meshBasicMaterial ref={mat} map={spriteTexture('plane')} transparent alphaTest={0.02} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

// 비행기 ② 선회: 제주도 상공을 큰 타원으로 빙글빙글 돌아요 (한 대는 시계 방향, 한 대는 반대 방향)
function CirclePlane({ rx, rz, alt, s, i, dir, period, phase }) {
  const ref = useRef()
  const still = useMemo(calm, [])
  useFrame(({ camera, clock }) => {
    const g = ref.current
    if (!g) return
    const th = (still ? phase : clock.elapsedTime * ((Math.PI * 2) / period) * dir + phase)
    const x = Math.cos(th) * rx, z = Math.sin(th) * rz
    const vx = -Math.sin(th) * rx * dir, vz = Math.cos(th) * rz * dir // 진행 방향
    g.position.set(x, alt + Math.sin(th * 2 + i) * 0.12, z)
    const rotY = Math.atan2(camera.position.x - x, camera.position.z - z)
    const side = screenSide(vx, vz, rotY)
    g.rotation.y = rotY
    g.scale.x = side >= 0 ? 1 : -1
    g.rotation.z = -0.1 * g.scale.x * dir // 도는 쪽으로 살짝 기울여요
  })
  return (
    <group ref={ref}>
      <mesh raycast={NR}>
        <planeGeometry args={[s, s]} />
        <meshBasicMaterial map={spriteTexture('plane')} transparent alphaTest={0.02} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
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
const PONIES = [[33.395, 126.44, 0.62], [33.375, 126.76, 0.6], [33.43, 126.33, 0.55], [33.34, 126.70, 0.55]]
// 돌고래(바다에서 헤엄침) [위도, 경도, 크기]
const DOLPHINS = [[33.60, 126.70, 0.62], [33.16, 126.20, 0.6], [33.31, 127.08, 0.58], [33.20, 126.78, 0.58], [33.62, 126.40, 0.56]]
// 오징어(바다) · 갈치(바다) [위도, 경도, 크기]
const SQUIDS = [[33.64, 126.55, 0.5], [33.17, 126.66, 0.48], [33.50, 127.06, 0.5], [33.46, 126.08, 0.48]]
const CUTLASS = [[33.12, 126.56, 0.62], [33.58, 126.86, 0.6], [33.30, 126.04, 0.6], [33.66, 126.26, 0.6]]
// 흑돼지(중산간·초원, 걸어 다님) [위도, 경도, 크기]
const PIGS = [[33.46, 126.80, 0.45], [33.33, 126.58, 0.42], [33.37, 126.40, 0.44], [33.31, 126.46, 0.42], [33.39, 126.68, 0.44]]
// 비행기: 제주공항(33.511, 126.493)에서 육지 쪽(북·북동·북서)으로 오가는 길 [도착점 x, z]
const AIRPORT = toXZ(33.511, 126.493)
const PLANES = [
  { to: [AIRPORT[0], -7.4], offset: 0.0, period: 24 }, // 북쪽(육지 방향)으로 곧게
  { to: [8.8, AIRPORT[1]], offset: 0.36, period: 28 }, // 동쪽으로 곧게
]
// 낚시배(바다) [위도, 경도, 크기]
const BOATS = [[33.57, 126.62, 0.6], [33.13, 126.45, 0.6], [33.60, 127.00, 0.56], [33.36, 126.08, 0.55]]
// 제주 하면 떠오르는 지형지물 [종류, 위도, 경도, 크기, 해안에서 안쪽으로 들어오는 거리]
const LANDMARKS = [
  ['sanbang', 33.2395, 126.3135, 1.25, 0.12], // 산방산
  ['seongsan', 33.4560, 126.9330, 1.15, 0.06], // 성산일출봉
  ['udobong', 33.5030, 126.9770, 0.95, 0], // 우도봉(소머리오름)과 등대
  ['cow', 33.4990, 126.9540, 0.5, 0], // 우도의 소
  ['biyang', 33.4260, 126.2150, 0.9, 0], // 비양도(한림 앞바다)
  ['yongdu', 33.5185, 126.5105, 1.15, 0], // 용두암 (제주시 용담 해안, 바다쪽으로 입을 벌림)
  ['jusang', 33.2370, 126.4250, 0.8, 0.02], // 주상절리(대포 해안)
  ['jeongbang', 33.2440, 126.5720, 0.8, 0.02], // 정방폭포
  ['marado', 33.1128, 126.2670, 0.75, 0], // 마라도 최남단 기념비
]
const SEA = [
  ['taewak', 33.585, 126.80, 0.42], ['taewak', 33.47, 126.99, 0.4], ['taewak', 33.18, 126.28, 0.4], ['taewak', 33.54, 126.28, 0.4],
]

export default function Props({ wind = 2 }) {
  const placed = useMemo(() => [
    ...PROPS.map(([k, la, ln, s, margin = 0.25], i) => {
      const [x, z] = snapToLand(...toXZ(la, ln), margin)
      return { k, x, z, y: Math.max(0, heightAt(x, z)), s: s * 1.35, i }
    }),
    ...LANDMARKS.map(([k, la, ln, s, margin], j) => {
      const [x, z] = snapToLand(...toXZ(la, ln), margin)
      return { k, x, z, y: Math.max(0, heightAt(x, z)), s: s * 1.35, i: 300 + j, land: true }
    }),
    ...SEA.map(([k, la, ln, s], j) => {
      const [x, z] = toXZ(la, ln)
      return { k, x, z, y: -0.3, s: s * 1.35, i: PROPS.length + j, bob: true }
    }),
  ], [])
  const ponies = useMemo(() => PONIES.map(([la, ln, s], j) => { const [x, z] = snapToLand(...toXZ(la, ln), 0.35); return { x, z, s: s * 1.35, i: 100 + j } }), [])
  const dolphins = useMemo(() => DOLPHINS.map(([la, ln, s], j) => { const [x, z] = toXZ(la, ln); return { x, z, s: s * 1.35, i: 200 + j } }), [])
  const squids = useMemo(() => SQUIDS.map(([la, ln, s], j) => { const [x, z] = toXZ(la, ln); return { kind: 'squid', x, z, s: s * 1.35, i: 500 + j } }), [])
  const cutlass = useMemo(() => CUTLASS.map(([la, ln, s], j) => { const [x, z] = toXZ(la, ln); return { kind: 'cutlass', x, z, s: s * 1.35, i: 520 + j } }), [])
  const pigs = useMemo(() => PIGS.map(([la, ln, s], j) => { const [x, z] = snapToLand(...toXZ(la, ln), 0.35); return { kind: 'pig', x, z, s: s * 1.35, i: 600 + j } }), [])
  const boats = useMemo(() => BOATS.map(([la, ln, s], j) => { const [x, z] = toXZ(la, ln); return { x, z, s: s * 1.35, i: 400 + j } }), [])
  return (
    <>
      {placed.map(({ k, x, z, y, s, i, bob, land }) => <Sprite key={i} kind={k} x={x} y={y} z={z} s={s} wind={land ? 0 : wind} i={i} bob={bob} />)}
      <HoverLabels />
      <CirclePlane rx={7.2} rz={4.7} alt={3.1} s={0.85 * 1.35} i={720} dir={1} period={44} phase={0.8} />
      {PLANES.map((p, j) => <Plane key={j} from={AIRPORT} to={p.to} s={0.85 * 1.35} i={700 + j} offset={p.offset} period={p.period} />)}
      {boats.map((b) => <Boat key={b.i} {...b} />)}
      {squids.map((f) => <Fish key={f.i} {...f} />)}
      {cutlass.map((f) => <Fish key={f.i} {...f} />)}
      {pigs.map((p) => <Pony key={p.i} {...p} wind={wind} />)}
      {ponies.map((p) => <Pony key={p.i} {...p} wind={wind} />)}
      {dolphins.map((d) => <Dolphin key={d.i} {...d} />)}
    </>
  )
}
