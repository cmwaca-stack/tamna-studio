// 일러스트 느낌의 제주 지도 그림을 캔버스로 그려 지형 표면에 입힙니다 (이미지 파일 없이 코드로 생성).
// 캔버스 좌표 ↔ 장면 좌표: x∈[-10,10], z∈[-6,6] 이 캔버스 전체에 대응합니다 (PlaneGeometry 기본 UV).
import * as THREE from 'three'
import { HALLA, LANDS } from './terrain'

const W = 2400, H = 1440
const X = (x) => ((x + 10) / 20) * W
const Z = (z) => ((z + 6) / 12) * H

// 시드 고정 난수 (매번 같은 그림)
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646 }

function path(ctx, poly) {
  ctx.beginPath()
  poly.forEach(([x, z], i) => (i ? ctx.lineTo(X(x), Z(z)) : ctx.moveTo(X(x), Z(z))))
  ctx.closePath()
}

export function makeCartoonTexture(rain = false) {
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')
  const r = rng(7)

  // 바다
  ctx.fillStyle = rain ? '#8fb7c8' : '#aee9de'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = rain ? '#9ec3d2' : '#c4f0e6'
  for (let i = 0; i < 26; i++) { // 물빛 얼룩
    ctx.beginPath(); ctx.ellipse(r() * W, r() * H, 60 + r() * 120, 22 + r() * 40, r() * 0.6 - 0.3, 0, 7); ctx.fill()
  }
  // 얕은 바다 테두리 (해안선에서 바깥으로 점점 연하게)
  ctx.lineJoin = 'round'
  for (const [w, c] of [[150, '#bdeee3'], [100, '#d3f4ec'], [56, '#e8faf4']]) {
    ctx.strokeStyle = rain ? '#b9d4de' : c; ctx.lineWidth = w
    LANDS.forEach((p) => { path(ctx, p); ctx.stroke() })
  }
  // 물결 무늬
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 5; ctx.lineCap = 'round'
  for (let i = 0; i < 150; i++) {
    const x = r() * W, y = r() * H
    ctx.beginPath(); ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + 14, y - 12, x + 28, y); ctx.quadraticCurveTo(x + 42, y + 12, x + 56, y); ctx.stroke()
  }

  // 섬 본체
  ctx.fillStyle = '#8fc965'
  LANDS.forEach((p) => { path(ctx, p); ctx.fill() })
  ctx.strokeStyle = '#fdeebd'; ctx.lineWidth = 12
  LANDS.forEach((p) => { path(ctx, p); ctx.stroke() }) // 모래 해안선

  // 섬 안쪽만 칠하기
  ctx.save()
  LANDS.forEach((p) => path(ctx, p))
  ctx.beginPath(); LANDS.forEach((p) => p.forEach(([x, z], i) => (i ? ctx.lineTo(X(x), Z(z)) : ctx.moveTo(X(x), Z(z)))))
  ctx.clip()
  // 중산간 밝은 초원 → 한라산 갈색 → 정상 분화구
  const hx = X(HALLA[0]), hz = Z(HALLA[1])
  const blob = (rx, rz, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(hx, hz, rx, rz, -0.04, 0, 7); ctx.fill() }
  blob(560, 250, '#a6d86f'); blob(400, 175, '#92cb63'); blob(270, 118, '#c9a07c'); blob(170, 76, '#dbb895')
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(hx - 20, hz - 6, 40, 22, 0, 0, 7); ctx.fill() // 정상 눈
  ctx.fillStyle = '#6fd0ea'; ctx.beginPath(); ctx.ellipse(hx - 20, hz - 4, 26, 13, 0, 0, 7); ctx.fill() // 백록담

  // 나무 덤불 (원 두 겹으로 귀엽게)
  for (let i = 0; i < 700; i++) {
    const x = r() * W, y = r() * H
    if (!ctx.isPointInPath(x, y)) continue
    if (((x - hx) / 300) ** 2 + ((y - hz) / 130) ** 2 < 1) continue // 한라산 정상부는 비움
    const s = 12 + r() * 11
    ctx.fillStyle = '#6fb35a'; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill()
    ctx.fillStyle = '#93d072'; ctx.beginPath(); ctx.arc(x - s * 0.28, y - s * 0.3, s * 0.6, 0, 7); ctx.fill()
  }
  // 작은 꽃 점
  for (let i = 0; i < 260; i++) {
    const x = r() * W, y = r() * H
    if (!ctx.isPointInPath(x, y)) continue
    ctx.fillStyle = ['#ffd43b', '#ff8fab', '#ffffff'][i % 3]; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill()
  }
  ctx.restore()

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}
