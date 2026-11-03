// 제주섬 3D 지형: 실제 해안선(Natural Earth) + 한라산을 높이 함수 하나로 만들고, 높이로 색을 칠합니다.
import * as THREE from 'three'
import { toXZ } from './geo.js'
import { COAST } from '../data/jejuCoast.js'

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const gauss = (x, z, cx, cz, s) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s))

export const HALLA = toXZ(33.3617, 126.5292) // 한라산 정상(백록담)

// 실제 해안선(위경도) → 장면 좌표 폴리곤. 우도는 작은 타원으로 따로 추가.
const ring = (pts) => pts.map(([la, ln]) => toXZ(la, ln))
const UDO = Array.from({ length: 24 }, (_, i) => {
  const t = (i / 24) * Math.PI * 2
  return [33.5015 + 0.0125 * Math.sin(t) * (1 + 0.15 * Math.cos(2 * t)), 126.9535 + 0.0135 * Math.cos(t)]
})
export const LANDS = [ring(COAST), ring(UDO)]

function inside(x, z, poly) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j]
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c
  }
  return c
}
function edgeDist(x, z, poly) {
  let m = Infinity
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j], [bx, bz] = poly[i]
    const dx = bx - ax, dz = bz - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)))
    m = Math.min(m, Math.hypot(x - (ax + t * dx), z - (az + t * dz)))
  }
  return m
}
// 해안선까지의 부호 있는 거리: 육지 +, 바다 −
function coastDist(x, z) {
  let best = -Infinity
  for (const poly of LANDS) {
    const d = edgeDist(x, z, poly)
    best = Math.max(best, inside(x, z, poly) ? d : -d)
  }
  return best
}
export const onLand = (x, z) => LANDS.some((p) => inside(x, z, p))

// (x, z) 에서의 지면 높이. 0 이하는 바다 속.
export function heightAt(x, z) {
  const d = coastDist(x, z)
  if (d < 0) return -0.9 * smooth(0, 0.5, -d) - 0.02
  const inland = smooth(0, 1.0, d)
  const ex = (x - HALLA[0]) / 1.9, ez = (z - HALLA[1]) / 1.0
  let h = 0.04 * smooth(0, 0.12, d) + 0.42 * inland // 해안 → 완만한 중산간
  h += Math.exp(-(ex * ex + ez * ez) / 2) * 0.95 * inland // 한라산
  h -= gauss(x, z, HALLA[0], HALLA[1], 0.2) * 0.2 //        백록담
  h += (0.04 * Math.sin(x * 4.1 + z * 3.3) + 0.03 * Math.sin(x * 7.3 - z * 5.1)) * inland
  return h
}

const STOPS = [
  [-0.9, '#5fc2bc'], [-0.12, '#9fe3d2'], [0.01, '#f6e2b0'], [0.12, '#f6e2b0'], // 깊은 바다 → 얕은 바다 → 모래
  [0.24, '#a8d56f'], [0.8, '#85c466'], //                    초원·숲
  [1.5, '#c9a888'], [2.3, '#e3cdb6'], //                     현무암 산정
].map(([h, c]) => [h, new THREE.Color(c)])

function colorAt(h, out) {
  if (h <= STOPS[0][0]) return out.copy(STOPS[0][1])
  for (let i = 1; i < STOPS.length; i++) {
    if (h <= STOPS[i][0]) {
      const [h0, c0] = STOPS[i - 1], [h1, c1] = STOPS[i]
      return out.lerpColors(c0, c1, (h - h0) / (h1 - h0))
    }
  }
  return out.copy(STOPS[STOPS.length - 1][1])
}

export function buildTerrain() {
  const geo = new THREE.PlaneGeometry(20, 12, 170, 100)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const h = heightAt(pos.getX(i), pos.getZ(i))
    pos.setY(i, h)
    colorAt(h, c)
    colors.set([c.r, c.g, c.b], i * 3)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

// 해안에 걸친 핀은 해안선 안쪽으로 살짝 당겨 육지 위에 놓습니다.
export function snapToLand(x, z, margin = 0.08) {
  if (coastDist(x, z) >= margin) return [x, z]
  let [px, pz] = [x, z]
  const dx = HALLA[0] - x, dz = HALLA[1] - z, len = Math.hypot(dx, dz) || 1
  for (let i = 0; i < 200 && coastDist(px, pz) < margin; i++) { px += (dx / len) * 0.02; pz += (dz / len) * 0.02 }
  return [px, pz]
}

// 두 지점 사이를 해안선을 따라(짧은 쪽 호) 이은 경로. 올레길처럼 해안을 도는 선에 사용.
const MAIN = LANDS[0]
const nearestIdx = (x, z) => { let bi = 0, bd = Infinity; MAIN.forEach(([px, pz], i) => { const d = Math.hypot(px - x, pz - z); if (d < bd) { bd = d; bi = i } }); return bi }
export function coastPath(a, b, inset = 0.09) {
  const n = MAIN.length, i = nearestIdx(...a), j = nearestIdx(...b)
  const fwd = (j - i + n) % n, back = (i - j + n) % n
  const step = fwd <= back ? 1 : -1, cnt = Math.min(fwd, back)
  const pts = [snapToLand(a[0], a[1], inset)]
  for (let k = 0; k <= cnt; k++) {
    const [x, z] = MAIN[(i + step * k + n) % n]
    pts.push(snapToLand(x, z, inset))
  }
  pts.push(snapToLand(b[0], b[1], inset))
  return pts
}
