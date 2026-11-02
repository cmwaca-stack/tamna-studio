import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { windVec } from '../lib/sceneWeather'

const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const BX = 12, BZ = 8 // 효과가 퍼지는 범위 (섬 주변 사방)
const wrap = (v, lim) => (v > lim ? v - 2 * lim : v < -lim ? v + 2 * lim : v)

// ── 구름: 하늘 상태에 따라 개수·색이 달라지고, 바람 방향·세기대로 흘러갑니다 ──
function Cloud({ x, y, z, s, color, glow, vx, vz, speed }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (still || !ref.current) return
    const p = ref.current.position
    p.x = wrap(p.x + vx * speed * dt, 24); p.z = wrap(p.z + vz * speed * dt, 18)
  })
  return (
    <group ref={ref} position={[x, y, z]} scale={s}>
      {[[0, 0, 0, 1], [1.1, -0.1, 0.2, 0.75], [-1.1, -0.15, -0.1, 0.7], [0.4, 0.45, 0, 0.7]].map(([cx, cy, cz, r], i) => (
        <mesh key={i} position={[cx, cy, cz]} scale={[1.4, 0.8, 1]}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function WeatherClouds({ weather }) {
  const n = weather.sky === 'clear' ? 4 : weather.sky === 'partly' ? 8 : 13
  const dark = weather.sky === 'overcast'
  const wet = weather.precip !== 'none'
  const color = wet ? '#aeb9c0' : dark ? '#cbd3d8' : '#ffffff'
  const [vx, vz] = windVec(weather)
  const speed = 0.2 + weather.wind * 0.14
  const list = useMemo(() => Array.from({ length: n }, (_, i) => {
    const a = i * 2.399, r = 9 + (i % 4) * 3
    return [Math.cos(a) * r, 8.5 + (i % 3) * 1.3, Math.sin(a) * r * 0.75, 1 + (i % 5) * 0.14]
  }), [n])
  return list.map(([x, y, z, s], i) => (
    <Cloud key={`${n}-${i}`} x={x} y={y} z={z} s={s} color={color} glow={wet ? 0.25 : 0.55} vx={vx} vz={vz} speed={speed} />
  ))
}

// 눈송이용 동그란 점 무늬
let dot
const dotTexture = () => {
  if (dot) return dot
  const c = document.createElement('canvas'); c.width = c.height = 32
  const g = c.getContext('2d'); const grd = g.createRadialGradient(16, 16, 0, 16, 16, 15)
  grd.addColorStop(0, '#fff'); grd.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = grd; g.fillRect(0, 0, 32, 32)
  return (dot = new THREE.CanvasTexture(c))
}

// ── 비: 바람에 비스듬히 기운 빗줄기 ──
function RainDrops({ weather }) {
  const count = weather.precip === 'shower' ? 1100 : 650
  const fall = weather.precip === 'shower' ? 13 : 9.5
  const [vx, vz] = windVec(weather)
  const lean = weather.wind * 0.35
  const ref = useRef()
  const pos = useMemo(() => {
    const a = new Float32Array(count * 6)
    for (let i = 0; i < count; i++) {
      const x = (Math.random() * 2 - 1) * BX, y = Math.random() * 9, z = (Math.random() * 2 - 1) * BZ
      a.set([x, y, z, x, y, z], i * 6)
    }
    return a
  }, [count])
  useFrame((_, dt) => {
    if (still || !ref.current) return
    const arr = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      const o = i * 6
      let x = arr[o] + vx * lean * dt, y = arr[o + 1] - fall * dt, z = arr[o + 2] + vz * lean * dt
      if (y < 0) { y = 9; x = (Math.random() * 2 - 1) * BX; z = (Math.random() * 2 - 1) * BZ }
      x = wrap(x, BX); z = wrap(z, BZ)
      arr[o] = x; arr[o + 1] = y; arr[o + 2] = z
      arr[o + 3] = x - vx * lean * 0.04; arr[o + 4] = y + 0.34; arr[o + 5] = z - vz * lean * 0.04
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <lineSegments ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <lineBasicMaterial color="#dff1fb" transparent opacity={0.55} />
    </lineSegments>
  )
}

// ── 눈: 천천히 흔들리며 내리는 눈송이 ──
function Snowflakes({ weather, count = 520 }) {
  const [vx, vz] = windVec(weather)
  const drift = weather.wind * 0.3
  const ref = useRef()
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) a.set([(Math.random() * 2 - 1) * BX, Math.random() * 9, (Math.random() * 2 - 1) * BZ], i * 3)
    return a
  }, [count])
  useFrame(({ clock }, dt) => {
    if (still || !ref.current) return
    const arr = ref.current.geometry.attributes.position.array, t = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const o = i * 3
      let y = arr[o + 1] - dt * (1 + (i % 5) * 0.18)
      if (y < 0) y = 9
      arr[o] = wrap(arr[o] + (vx * drift + Math.sin(t * 0.8 + i) * 0.25) * dt, BX)
      arr[o + 1] = y
      arr[o + 2] = wrap(arr[o + 2] + (vz * drift + Math.cos(t * 0.7 + i) * 0.2) * dt, BZ)
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial map={dotTexture()} color="#ffffff" size={0.2} transparent opacity={0.95} depthWrite={false} sizeAttenuation />
    </points>
  )
}

export function Precip({ weather }) {
  const p = weather.precip
  return (
    <>
      {(p === 'rain' || p === 'shower' || p === 'sleet') && <RainDrops weather={weather} />}
      {(p === 'snow' || p === 'sleet') && <Snowflakes weather={weather} count={p === 'sleet' ? 260 : 520} />}
    </>
  )
}

// ── 바람: 불어 가는 쪽으로 흐르는 하얀 바람줄 (풍속 4m/s 이상일 때) ──
export function WindStreaks({ weather }) {
  const [vx, vz] = windVec(weather)
  const n = weather.wind >= 4 ? Math.min(46, Math.round(weather.wind * 3.5)) : 0
  const len = 0.8 + weather.wind * 0.12
  const ref = useRef()
  const seeds = useMemo(() => Array.from({ length: 46 }, () => [(Math.random() * 2 - 1) * BX, 0.6 + Math.random() * 3, (Math.random() * 2 - 1) * BZ, Math.random() * 6]), [])
  const pos = useMemo(() => new Float32Array(46 * 6), [])
  useFrame(({ clock }, dt) => {
    if (still || !ref.current || !n) return
    const t = clock.elapsedTime, sp = weather.wind * 0.7
    for (let i = 0; i < n; i++) {
      const s = seeds[i]
      s[0] = wrap(s[0] + vx * sp * dt, BX); s[2] = wrap(s[2] + vz * sp * dt, BZ)
      const y = s[1] + Math.sin(t * 1.2 + s[3]) * 0.12, o = i * 6
      pos.set([s[0], y, s[2], s[0] - vx * len, y, s[2] - vz * len], o)
    }
    ref.current.geometry.setDrawRange(0, n * 2)
    ref.current.geometry.attributes.position.needsUpdate = true
  })
  if (!n) return null
  return (
    <lineSegments ref={ref} frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </lineSegments>
  )
}
