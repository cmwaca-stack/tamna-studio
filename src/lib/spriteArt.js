// 제주 상징 일러스트(돌하르방·귤·유채꽃·초가집·동백·조랑말·해녀·테왁·돌고래)를 캔버스에 직접 그립니다.
// 둥글고 단순한 도형 + 볼터치·주근깨 같은 귀여운 표정으로 그리는 납작한(flat) 스티커 스타일이에요.
import * as THREE from 'three'

const S = 512
const circ = (c, x, y, r, f) => { c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() }
const ell = (c, x, y, rx, ry, f, rot = 0) => { c.fillStyle = f; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fill() }
const rrect = (c, x, y, w, h, r, f) => { c.fillStyle = f; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill() }
const line = (c, pts, w, s) => { c.strokeStyle = s; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke() }
const shadow = (c) => ell(c, 256, 482, 150, 20, 'rgba(40,70,40,.22)')
const face = (c, x, y, k = 1) => { // 점 눈 + 볼터치 + 미소
  circ(c, x - 34 * k, y, 7 * k, '#3a2f2a'); circ(c, x + 34 * k, y, 7 * k, '#3a2f2a')
  ell(c, x - 56 * k, y + 20 * k, 15 * k, 9 * k, 'rgba(255,120,120,.55)'); ell(c, x + 56 * k, y + 20 * k, 15 * k, 9 * k, 'rgba(255,120,120,.55)')
  c.strokeStyle = '#3a2f2a'; c.lineWidth = 5 * k; c.lineCap = 'round'; c.beginPath(); c.arc(x, y + 8 * k, 14 * k, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke()
}

const ART = {
  // 돌하르방: 둥근 벙거지 + 주근깨 + 배 위의 두 손
  hare(c) {
    shadow(c)
    rrect(c, 166, 250, 180, 225, 70, '#8f9094')
    ell(c, 256, 300, 78, 44, '#9c9da1') // 배
    circ(c, 214, 330, 22, '#8f9094'); circ(c, 298, 330, 22, '#8f9094') // 손
    circ(c, 256, 196, 92, '#9d9ea2') // 얼굴
    ell(c, 256, 128, 118, 26, '#707277') // 모자챙
    rrect(c, 188, 70, 136, 72, 40, '#7a7c81'); rrect(c, 218, 48, 76, 40, 22, '#7a7c81') // 모자
    circ(c, 214, 196, 8, '#2b2b2e'); circ(c, 298, 196, 8, '#2b2b2e')
    ell(c, 256, 220, 18, 12, '#8a8b90')
    ;[[222, 238], [236, 246], [276, 246], [290, 238], [192, 214], [320, 214]].forEach(([x, y]) => circ(c, x, y, 3.5, '#6f7075'))
    c.strokeStyle = '#2b2b2e'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(256, 238, 20, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke()
    ell(c, 188, 232, 16, 9, 'rgba(255,140,140,.5)'); ell(c, 324, 232, 16, 9, 'rgba(255,140,140,.5)')
  },
  // 귤 캐릭터: 웃는 얼굴 + 잎
  tangerine(c) {
    shadow(c)
    circ(c, 256, 292, 150, '#ff9d1c'); ell(c, 210, 230, 52, 34, '#ffb94f', -0.5) // 몸 + 하이라이트
    circ(c, 256, 148, 12, '#6b4a2b')
    ell(c, 300, 136, 54, 24, '#4caf50', -0.35); line(c, [[262, 146], [336, 124]], 4, '#2e7d32')
    face(c, 256, 300, 1.45)
  },
  // 귤나무: 동글동글 수관 + 주황 열매
  orange(c) {
    shadow(c)
    rrect(c, 236, 330, 40, 150, 12, '#8d5a2b')
    ;[[256, 230, 130], [170, 280, 84], [342, 282, 84], [256, 150, 82]].forEach(([x, y, r]) => circ(c, x, y, r, '#3f9d3a'))
    ;[[210, 190, 60], [300, 226, 70], [190, 300, 48]].forEach(([x, y, r]) => ell(c, x, y, r, r * 0.6, '#58b44c', -0.4))
    ;[[196, 232], [280, 190], [320, 280], [236, 300], [160, 292], [350, 220], [250, 118]].forEach(([x, y]) => { circ(c, x, y, 21, '#ff9a1f'); circ(c, x - 6, y - 7, 6, '#ffc26b') })
  },
  // 유채꽃: 휘어진 줄기에 노란 꽃송이가 모여 핌
  rape(c) {
    shadow(c)
    line(c, [[256, 480], [250, 380], [262, 280], [250, 190]], 12, '#58a64a')
    line(c, [[255, 400], [190, 330], [170, 270]], 8, '#58a64a'); line(c, [[258, 330], [330, 270], [346, 206]], 8, '#58a64a')
    ell(c, 214, 420, 52, 22, '#4caf50', -0.5); ell(c, 304, 440, 52, 22, '#4caf50', 0.5)
    const fl = (x, y, r) => { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; ell(c, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.6, r * 0.42, '#ffd93b', a) } circ(c, x, y, r * 0.3, '#f4a300') }
    ;[[250, 190, 24], [226, 160, 20], [276, 156, 20], [250, 126, 18], [262, 228, 22], [232, 250, 18], [170, 270, 22], [186, 236, 18], [346, 206, 22], [330, 172, 18], [364, 238, 18], [160, 300, 16], [340, 270, 16]].forEach((a) => fl(...a))
  },
  // 초가집: 두툼한 갈색 초가지붕 + 나무 기둥·창
  hut(c) {
    shadow(c)
    rrect(c, 110, 280, 292, 195, 10, '#f3e6c6')
    rrect(c, 110, 280, 22, 195, 4, '#8a5a30'); rrect(c, 380, 280, 22, 195, 4, '#8a5a30'); rrect(c, 110, 280, 292, 18, 4, '#8a5a30')
    rrect(c, 164, 330, 78, 70, 6, '#8a5a30'); rrect(c, 172, 338, 62, 54, 4, '#ffe9a8'); line(c, [[203, 338], [203, 392]], 5, '#8a5a30'); line(c, [[172, 365], [234, 365]], 5, '#8a5a30')
    rrect(c, 292, 340, 66, 135, 6, '#7a4c27'); circ(c, 346, 410, 5, '#ffd24d')
    c.fillStyle = '#d9a441'; c.beginPath(); c.moveTo(56, 296); c.quadraticCurveTo(256, 40, 456, 296); c.quadraticCurveTo(256, 268, 56, 296); c.fill() // 지붕
    c.fillStyle = '#c28b2e'; c.beginPath(); c.moveTo(56, 296); c.quadraticCurveTo(256, 130, 456, 296); c.quadraticCurveTo(256, 272, 56, 296); c.fill()
    ;[0.34, 0.5, 0.66].forEach((t) => { const y = 296 - 150 * (1 - Math.abs(t - 0.5) * 0.3) * 0.7 * (1 - t) ; line(c, [[96 + t * 60, 292 - t * 30], [256, 140 + t * 70], [416 - t * 60, 292 - t * 30]], 4, 'rgba(110,70,20,.45)'); void y })
    line(c, [[256, 80], [256, 240]], 5, 'rgba(110,70,20,.4)')
  },
  // 제주 조랑말: 오른쪽을 보는 옆모습. 밤색 몸 + 짙은 갈기·꼬리
  pony(c) {
    shadow(c)
    c.fillStyle = '#4a3222'; c.beginPath(); c.moveTo(150, 280); c.quadraticCurveTo(70, 300, 84, 410); c.quadraticCurveTo(120, 350, 168, 330); c.fill() // 꼬리
    ;[[176, '#a5622a'], [214, '#a5622a'], [300, '#b87333'], [338, '#b87333']].forEach(([x, f]) => { rrect(c, x, 340, 32, 122, 14, f); rrect(c, x - 2, 440, 36, 24, 8, '#3a2a20') }) // 다리 + 발굽
    rrect(c, 138, 240, 232, 140, 66, '#c27a38') // 몸
    ell(c, 256, 350, 100, 22, 'rgba(255,225,170,.45)') // 배 하이라이트
    ell(c, 352, 238, 44, 82, '#c27a38', 0.55) // 목
    ell(c, 396, 176, 56, 42, '#c27a38', 0.25) // 머리
    ell(c, 436, 196, 30, 24, '#e0b07a', 0.25) // 주둥이
    circ(c, 446, 192, 4, '#5a3a22'); circ(c, 430, 204, 4, '#5a3a22') // 콧구멍
    c.fillStyle = '#c27a38'; c.beginPath(); c.moveTo(364, 146); c.lineTo(376, 100); c.lineTo(398, 140); c.fill() // 귀
    c.fillStyle = '#e8a46a'; c.beginPath(); c.moveTo(374, 140); c.lineTo(378, 114); c.lineTo(390, 138); c.fill()
    ;[[330, 196, 24], [318, 224, 25], [304, 254, 25], [372, 142, 20]].forEach(([x, y, r]) => circ(c, x, y, r, '#4a3222')) // 갈기
    circ(c, 400, 176, 10, '#2b1f19'); circ(c, 403, 172, 3.5, '#fff') // 눈
    ell(c, 420, 214, 14, 8, 'rgba(255,120,120,.55)')
    c.strokeStyle = '#5a3a22'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(436, 202, 9, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke()
  },
  // 해녀: 물안경 쓴 수건 머리 + 검은 해녀복 + 주황 테왁(둥근 부표)
  haenyeo(c) {
    shadow(c)
    ell(c, 372, 408, 74, 74, '#ff8a1c'); ell(c, 350, 380, 28, 18, '#ffb35a', -0.5) // 테왁
    ;[[372, 408, 74]].forEach(([x, y, r]) => { c.strokeStyle = 'rgba(190,70,0,.55)'; c.lineWidth = 4; for (let k = -2; k <= 2; k++) { c.beginPath(); c.ellipse(x, y, r * 0.35, r, k * 0.5, 0, 7); c.stroke() } })
    c.strokeStyle = '#c0392b'; c.lineWidth = 3; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(335 + k * 18, 470); c.quadraticCurveTo(340 + k * 18, 500, 345 + k * 18, 492); c.stroke() } // 망사리
    rrect(c, 156, 286, 150, 190, 62, '#2b3a4a') // 해녀복
    rrect(c, 186, 300, 90, 26, 12, '#3a4c60')
    circ(c, 160, 360, 24, '#ffd9b3'); circ(c, 304, 372, 24, '#ffd9b3') // 손
    circ(c, 232, 214, 84, '#ffd9b3') // 얼굴
    c.fillStyle = '#fff'; c.beginPath(); c.arc(232, 206, 90, Math.PI * 1.02, Math.PI * 1.98); c.fill() // 하얀 수건
    rrect(c, 140, 188, 184, 22, 10, '#ffffff')
    circ(c, 200, 176, 24, '#9ad7f2'); circ(c, 264, 176, 24, '#9ad7f2'); circ(c, 200, 176, 14, '#d9f1fb'); circ(c, 264, 176, 14, '#d9f1fb') // 물안경
    rrect(c, 222, 172, 20, 8, 4, '#2b3a4a')
    face(c, 232, 238, 0.95)
  },
  // 테왁: 바다에 떠 있는 주황 부표 + 물결
  taewak(c) {
    ell(c, 256, 440, 170, 30, 'rgba(255,255,255,.75)'); ell(c, 256, 440, 120, 18, 'rgba(120,200,240,.55)')
    circ(c, 256, 316, 120, '#ff8a1c'); ell(c, 214, 262, 46, 28, '#ffb35a', -0.5)
    c.strokeStyle = 'rgba(190,70,0,.5)'; c.lineWidth = 5; for (let k = -2; k <= 2; k++) { c.beginPath(); c.ellipse(256, 316, 42, 120, k * 0.55, 0, 7); c.stroke() }
    rrect(c, 246, 160, 10, 50, 4, '#6b4a2b'); c.fillStyle = '#ff5c5c'; c.beginPath(); c.moveTo(256, 160); c.lineTo(310, 178); c.lineTo(256, 196); c.fill() // 작은 깃발
    face(c, 256, 330, 1.2)
  },
  // 남방큰돌고래: 제주 앞바다의 상징. 물 위로 폴짝
  dolphin(c) {
    ell(c, 256, 440, 170, 28, 'rgba(255,255,255,.8)'); ell(c, 256, 440, 118, 16, 'rgba(120,200,240,.55)')
    c.save(); c.translate(256, 290); c.rotate(-0.28)
    ell(c, 0, 0, 150, 78, '#78a6d0'); ell(c, 10, 38, 124, 38, '#e3f0f8') // 몸통 + 배
    ell(c, 140, -6, 54, 22, '#78a6d0') // 주둥이
    c.fillStyle = '#78a6d0'; c.beginPath(); c.moveTo(-20, -66); c.quadraticCurveTo(10, -140, 56, -70); c.fill() // 등지느러미
    c.fillStyle = '#6595c0'; c.beginPath(); c.moveTo(-136, 8); c.quadraticCurveTo(-190, 8, -200, -34); c.quadraticCurveTo(-160, -28, -130, -22); c.quadraticCurveTo(-176, 46, -204, 46); c.quadraticCurveTo(-176, 20, -126, 14); c.fill() // 꼬리
    circ(c, 96, -22, 10, '#26323a'); circ(c, 99, -26, 3.5, '#fff')
    ell(c, 82, 6, 14, 8, 'rgba(255,130,130,.6)')
    c.strokeStyle = '#26323a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(138, -2, 12, 0.15 * Math.PI, 0.8 * Math.PI); c.stroke()
    c.restore()
    ;[[120, 380, 9], [160, 400, 7], [350, 390, 8], [392, 372, 6]].forEach(([x, y, r]) => circ(c, x, y, r, 'rgba(190,230,250,.9)')) // 물방울
  },
  // 동백: 붉은 겹꽃잎 + 노란 수술 + 윤기 나는 잎
  camellia(c) {
    shadow(c)
    ell(c, 150, 330, 78, 34, '#2f8f4a', -0.5); ell(c, 362, 330, 78, 34, '#2f8f4a', 0.5); ell(c, 256, 410, 70, 30, '#3aa055', 1.57)
    line(c, [[100, 360], [200, 320]], 4, '#1f6b35'); line(c, [[412, 360], [312, 320]], 4, '#1f6b35')
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - 1.57; circ(c, 256 + Math.cos(a) * 82, 230 + Math.sin(a) * 82, 70, '#e03131') }
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - 1.2; circ(c, 256 + Math.cos(a) * 44, 230 + Math.sin(a) * 44, 46, '#f05252') }
    circ(c, 256, 230, 48, '#c92a2a')
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const x = 256 + Math.cos(a) * 24, y = 230 + Math.sin(a) * 24; line(c, [[256, 230], [x, y]], 4, '#f59f00'); circ(c, x, y, 7, '#ffd43b') }
    circ(c, 256, 230, 10, '#ffd43b')
  },
}

const cache = {}
export function spriteTexture(kind) {
  if (cache[kind]) return cache[kind]
  const cv = document.createElement('canvas')
  cv.width = S; cv.height = S
  ART[kind](cv.getContext('2d'))
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return (cache[kind] = t)
}
