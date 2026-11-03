import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { toXZ } from '../lib/geo'
import { buildTerrain, heightAt, snapToLand, coastPath } from '../lib/terrain'
import { makeCartoonTexture } from '../lib/cartoonTexture'
import Props from './Props'
import { WeatherClouds, Precip, WindStreaks } from './WeatherFx'
import { isWet } from '../lib/sceneWeather'
import { setAzimuth } from '../lib/azimuth'

const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const PIN_COLOR = { tour: '#f08c00', heritage: '#1c7ed6' } // 장소(주황) · 국가유산(파랑)

function Terrain({ rain }) {
  const geometry = useMemo(buildTerrain, [])
  const map = useMemo(() => makeCartoonTexture(rain), [rain]) // 일러스트풍 지도 그림을 지형에 입힘
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial map={map} roughness={1} />
    </mesh>
  )
}

function Ocean({ rain, wind = 2 }) {
  const geometry = useMemo(() => { const g = new THREE.PlaneGeometry(120, 80, 110, 70); g.rotateX(-Math.PI / 2); return g }, [])
  useFrame(({ clock }) => {
    if (still) return
    const p = geometry.attributes.position, t = clock.elapsedTime, k = 1 + wind * 0.18 // 바람이 셀수록 물결이 커져요
    for (let i = 0; i < p.count; i++) p.setY(i, k * (0.035 * Math.sin(p.getX(i) * 0.9 + t * 0.9) + 0.025 * Math.cos(p.getZ(i) * 1.3 + t * 1.2)))
    p.needsUpdate = true
  })
  return (
    <>
    <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[120, 80]} />
      <meshStandardMaterial color={rain ? '#6a7f86' : '#8fd9cf'} />
    </mesh>
    <mesh geometry={geometry} position={[0, -0.32, 0]}>
      <meshStandardMaterial color={rain ? '#8aa3ad' : '#8fd9cf'} roughness={0.25} metalness={0.1} transparent opacity={0.45} />
    </mesh>
    </>
  )
}

function Pin({ item, selected, phase, onPick, onHover }) {
  const [hover, setHover] = useState(false)
  const ring = useRef()
  const [x, z] = useMemo(() => snapToLand(...toXZ(item.lat, item.lng)), [item.lat, item.lng])
  const y = Math.max(0, heightAt(x, z))
  const color = item.color ?? PIN_COLOR[item.source]
  const active = selected || hover

  useFrame(({ clock }) => {
    if (!ring.current) return
    const f = still ? 0.4 : ((clock.elapsedTime * 0.6 + phase) % 1)
    ring.current.scale.setScalar(1 + f * 2.2)
    ring.current.material.opacity = (1 - f) * 0.7
  })

  return (
    <group position={[x, y, z]} scale={active ? 1.35 : 1}>
      <mesh ref={ring} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.14, 32]} />
        <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.42, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh
        position={[0, 0.45, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); onHover?.(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); onHover?.(false); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onPick?.(item) }}
      >
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.6 : 0.9} />
      </mesh>
      {/* 눌러야 할 영역을 보이는 구슬보다 크게 (투명) */}
      <mesh
        position={[0, 0.45, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); onHover?.(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); onHover?.(false); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onPick?.(item) }}
      >
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {active && (
        <Html position={[0, 0.78, 0]} center zIndexRange={[10, 0]}>
          <div className="pin-label">{item.title}</div>
        </Html>
      )}
    </group>
  )
}

// 코스 선: 시·종점 사이를 실제 해안선을 따라 이어 지형 높이에 맞춰 그립니다
function RouteLine({ route }) {
  const points = useMemo(() => {
    const [a, b] = route.points.map(([la, ln]) => toXZ(la, ln))
    return coastPath(a, b).map(([x, z]) => new THREE.Vector3(x, Math.max(0, heightAt(x, z)) + 0.07, z))
  }, [route])
  return <Line points={points} color={route.color} lineWidth={3.5} />
}

// 카메라가 도는 각도를 바람 나침반에 알려 줘요 (동서남북이 화면에 맞춰 돌아가도록)
function AzimuthSync() {
  useFrame(({ camera }) => setAzimuth((Math.atan2(camera.position.x, camera.position.z) * 180) / Math.PI))
  return null
}

// items: { key, source('tour'|'heritage'), title, lat, lng }[]  (lib/pins.js 로 변환)
export default function Scene3D({ items = [], routes = [], rain = false, weather, onPick, selectedKey, autoRotate = false }) {
  // weather 가 없으면 예전처럼 rain(true/false)만으로 표현
  const w = weather ?? { sky: rain ? 'overcast' : 'clear', precip: rain ? 'rain' : 'none', wind: 2, dir: 300 }
  const wet = isWet(w), gloomy = wet || w.sky === 'overcast'
  const bg = w.precip === 'snow' ? '#dbe3e8' : wet ? '#b4c3cc' : w.sky === 'overcast' ? '#bfcdd6' : w.sky === 'partly' ? '#ffe9d9' : '#ffeedd'
  const [hovering, setHovering] = useState(false) // 핀 위에 마우스가 있으면 회전을 멈춰 누르기 쉽게
  return (
    <Canvas camera={{ position: [0, 7.5, 12.5], fov: 45 }} dpr={[1, 2]}>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, wet ? 12 : 16, wet ? 40 : 70]} />
      <ambientLight intensity={gloomy ? 0.88 : 1.0} color="#ffffff" />
      <directionalLight position={[8, 11, 6]} intensity={wet ? 1.0 : w.sky === 'overcast' ? 1.3 : w.sky === 'partly' ? 2.0 : 2.4} color={gloomy ? '#e3edf3' : '#ffe6bd'} />
      <hemisphereLight args={['#ffe9d6', '#a3b86f', 0.7]} />

      {!gloomy && (
        <mesh position={[14, 12, -20]}>
          <sphereGeometry args={[1.8, 24, 24]} />
          <meshBasicMaterial color="#fff6c8" fog={false} />
        </mesh>
      )}
      <AzimuthSync />
      <WeatherClouds weather={w} />

      <Ocean rain={gloomy} wind={w.wind} />
      <Terrain rain={gloomy} />
      <Props wind={w.wind} />
      {items.map((it, i) => (
        <Pin key={it.key} item={it} phase={(i * 0.37) % 1} selected={it.key === selectedKey} onPick={onPick} onHover={setHovering} />
      ))}
      {routes.map((r) => <RouteLine key={r.key} route={r} />)}
      <Precip weather={w} />
      <WindStreaks weather={w} />

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2.15}
        autoRotate={autoRotate && !still && !hovering && !selectedKey}
        autoRotateSpeed={0.12}
      />
    </Canvas>
  )
}
