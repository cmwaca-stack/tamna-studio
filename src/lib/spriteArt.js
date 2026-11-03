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
    // 테왁(바다에 떠 있는 것과 같은 모양): 주황 부표 + 아래로 늘어진 초록 그물주머니(망사리)
    c.save(); c.beginPath(); c.moveTo(318, 418); c.quadraticCurveTo(298, 484, 376, 500); c.quadraticCurveTo(452, 484, 430, 418); c.closePath(); c.clip()
    c.fillStyle = 'rgba(30,140,112,.32)'; c.fillRect(290, 410, 170, 100)
    c.strokeStyle = '#1f8a70'; c.lineWidth = 3
    for (let k = -4; k <= 8; k++) { c.beginPath(); c.moveTo(290 + k * 16, 410); c.lineTo(290 + k * 16 + 90, 510); c.stroke(); c.beginPath(); c.moveTo(460 - k * 16, 410); c.lineTo(460 - k * 16 - 90, 510); c.stroke() }
    c.restore()
    ;[[352, 478, 9], [388, 486, 8], [416, 466, 8]].forEach(([x, y, r]) => circ(c, x, y, r, '#f4a35c'))
    ell(c, 372, 392, 78, 66, '#ff7a1a'); ell(c, 396, 410, 56, 42, 'rgba(160,50,0,.22)'); ell(c, 342, 366, 32, 18, '#ffb066', -0.5)
    c.strokeStyle = 'rgba(170,60,0,.55)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.ellipse(372, 392, 77, 25, 0, 0.12 * Math.PI, 0.88 * Math.PI); c.stroke()
    c.strokeStyle = '#6b4a2b'; c.lineWidth = 5; c.beginPath(); c.moveTo(376, 330); c.bezierCurveTo(396, 300, 440, 308, 430, 346); c.stroke()
    rrect(c, 362, 326, 22, 12, 6, '#ff9a3c')
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
  // 테왁: 해녀가 바다에서 붙잡고 쉬는 주황색 둥근 부표 + 아래로 늘어진 초록 그물주머니(망사리)
  taewak(c) {
    ell(c, 256, 450, 180, 26, 'rgba(255,255,255,.75)'); ell(c, 256, 450, 126, 16, 'rgba(120,200,240,.55)')
    // 망사리(그물주머니): 부표 아래로 늘어진 초록 그물
    c.save(); c.beginPath(); c.moveTo(140, 318); c.quadraticCurveTo(88, 440, 256, 476); c.quadraticCurveTo(424, 440, 372, 318); c.closePath(); c.clip()
    c.fillStyle = 'rgba(30,140,112,.32)'; c.fillRect(100, 320, 320, 160)
    c.strokeStyle = '#1f8a70'; c.lineWidth = 4
    for (let k = -8; k <= 12; k++) { c.beginPath(); c.moveTo(100 + k * 24, 320); c.lineTo(100 + k * 24 + 160, 480); c.stroke(); c.beginPath(); c.moveTo(420 - k * 24, 320); c.lineTo(420 - k * 24 - 160, 480); c.stroke() }
    c.restore()
    ;[[190, 418, 15], [262, 446, 13], [326, 416, 14]].forEach(([x, y, r]) => { circ(c, x, y, r, '#f4a35c'); circ(c, x - 4, y - 4, r * 0.35, 'rgba(255,255,255,.55)') }) // 그물 속 수확물
    // 부표 본체: 살짝 납작한 주황 공 + 그늘 + 빛
    ell(c, 256, 268, 126, 104, '#ff7a1a'); ell(c, 300, 298, 92, 68, 'rgba(160,50,0,.22)'); ell(c, 206, 226, 52, 30, '#ffb066', -0.5)
    c.strokeStyle = 'rgba(170,60,0,.55)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.ellipse(256, 268, 124, 40, 0, 0.12 * Math.PI, 0.88 * Math.PI); c.stroke() // 이음선
    // 꼭지 고리(밧줄)
    c.strokeStyle = '#6b4a2b'; c.lineWidth = 7; c.beginPath(); c.moveTo(262, 168); c.bezierCurveTo(300, 120, 372, 130, 356, 196); c.stroke()
    rrect(c, 240, 160, 32, 18, 8, '#ff9a3c')
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
  // 낚시배: 둥근 선체 + 작은 선실 + 깃발 + 낚싯대
  boat(c) {
    ell(c, 256, 446, 190, 30, 'rgba(255,255,255,.8)'); ell(c, 256, 446, 130, 18, 'rgba(120,200,240,.55)')
    line(c, [[330, 250], [446, 150]], 6, '#6b4a2b'); line(c, [[446, 150], [452, 270]], 3, 'rgba(60,60,60,.6)'); circ(c, 452, 276, 8, '#ff5c5c') // 낚싯대 + 찌
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(70, 300); c.lineTo(442, 300); c.quadraticCurveTo(410, 420, 330, 428); c.lineTo(160, 428); c.quadraticCurveTo(96, 410, 70, 300); c.fill() // 선체
    c.fillStyle = '#e8590c'; c.beginPath(); c.moveTo(78, 322); c.lineTo(436, 322); c.lineTo(428, 352); c.lineTo(92, 352); c.fill() // 주황 띠
    rrect(c, 190, 190, 130, 110, 22, '#fff4e0'); rrect(c, 176, 176, 158, 28, 14, '#4dabf7') // 선실 + 지붕
    rrect(c, 266, 138, 32, 46, 6, '#ff8a3c'); rrect(c, 260, 130, 44, 14, 6, '#3a3a40') // 굴뚝
    rrect(c, 208, 214, 36, 34, 8, '#9ad7f2'); rrect(c, 262, 214, 36, 34, 8, '#9ad7f2') // 창
    line(c, [[150, 300], [150, 150]], 6, '#6b4a2b'); c.fillStyle = '#ffd43b'; c.beginPath(); c.moveTo(150, 150); c.lineTo(214, 166); c.lineTo(150, 184); c.fill() // 깃발
    circ(c, 124, 366, 10, '#fff'); circ(c, 124, 366, 5, '#9ad7f2')
    face(c, 256, 380, 0.7)
  },
  // 산방산: 종처럼 솟은 용암 돔 + 세로 주름 + 꼭대기 풀
  sanbang(c) {
    shadow(c)
    c.fillStyle = '#7d7468'; c.beginPath(); c.moveTo(60, 478); c.quadraticCurveTo(70, 190, 180, 120); c.quadraticCurveTo(256, 70, 332, 120); c.quadraticCurveTo(442, 190, 452, 478); c.closePath(); c.fill() // 바위 몸통
    c.fillStyle = '#948b7d'; c.beginPath(); c.moveTo(120, 478); c.quadraticCurveTo(130, 220, 200, 150); c.quadraticCurveTo(256, 110, 300, 150); c.quadraticCurveTo(372, 220, 392, 478); c.closePath(); c.fill() // 밝은 면
    ;[[150, 250, 400], [196, 200, 440], [256, 150, 460], [316, 200, 440], [362, 250, 400]].forEach(([x, y, y2]) => line(c, [[x, y + 40], [x - 6, (y + y2) / 2], [x - 2, y2 - 6]], 5, 'rgba(70,62,52,.35)')) // 세로 주름
    c.fillStyle = '#5fae4e'; c.beginPath(); c.moveTo(150, 152); c.quadraticCurveTo(256, 56, 362, 152); c.quadraticCurveTo(256, 118, 150, 152); c.fill() // 꼭대기 풀
    ;[[200, 110, 22], [256, 92, 26], [312, 112, 22]].forEach(([x, y, r]) => circ(c, x, y, r, '#4f9a40')) // 작은 나무
    face(c, 256, 330, 1.25)
  },
  // 성산일출봉: 바다에 솟은 왕관 모양 분화구(톱니 능선) + 초록 분화구 + 깎아지른 절벽, 뒤로 떠오르는 해
  seongsan(c) {
    circ(c, 256, 176, 130, 'rgba(255,214,120,.38)'); circ(c, 256, 184, 84, '#ffc65c') // 일출
    ;[-70, -35, 0, 35, 70].forEach((d) => { const ang = -Math.PI / 2 + (d * Math.PI) / 180; line(c, [[256 + Math.cos(ang) * 96, 184 + Math.sin(ang) * 96], [256 + Math.cos(ang) * 124, 184 + Math.sin(ang) * 124]], 6, 'rgba(255,198,92,.8)') })
    ell(c, 256, 474, 230, 24, 'rgba(255,255,255,.55)')
    c.fillStyle = '#6c7468'; c.beginPath(); c.moveTo(24, 478); c.lineTo(58, 304); c.lineTo(92, 268); c.lineTo(120, 240); c.lineTo(150, 198); c.lineTo(184, 216); c.lineTo(214, 170); c.lineTo(256, 198); c.lineTo(298, 162); c.lineTo(332, 214); c.lineTo(368, 192); c.lineTo(398, 240); c.lineTo(426, 266); c.lineTo(456, 304); c.lineTo(488, 478); c.closePath(); c.fill() // 톱니 능선
    c.fillStyle = '#818a75'; c.beginPath(); c.moveTo(104, 478); c.lineTo(124, 300); c.lineTo(176, 240); c.lineTo(256, 262); c.lineTo(336, 240); c.lineTo(388, 300); c.lineTo(408, 478); c.closePath(); c.fill() // 밝은 면
    for (let k = 0; k < 9; k++) { const x = 60 + k * 49; line(c, [[x, 300 + Math.abs(k - 4) * 8], [x + (k < 4 ? -6 : 6), 470]], 4, 'rgba(46,52,42,.4)') } // 절벽 결
    c.fillStyle = '#5fae4e'; c.beginPath(); c.moveTo(150, 202); c.lineTo(184, 220); c.lineTo(214, 174); c.lineTo(256, 202); c.lineTo(298, 166); c.lineTo(332, 218); c.lineTo(368, 196); c.quadraticCurveTo(256, 276, 150, 202); c.fill() // 분화구 풀
    ell(c, 256, 220, 82, 24, '#4f9a40'); ell(c, 240, 214, 40, 9, '#7ec36a') // 분화구 속
    ;[[96, 292], [440, 292], [70, 330]].forEach(([x, y]) => ell(c, x, y, 20, 7, 'rgba(95,174,78,.85)')) // 절벽 위 풀
  },
  // 우도봉(소머리오름): 우도 동쪽 끝의 초록 언덕 + 깎아지른 절벽 + 흰 등대
  udobong(c) {
    shadow(c)
    c.fillStyle = '#7d8a73'; c.beginPath(); c.moveTo(40, 478); c.quadraticCurveTo(52, 300, 150, 250); c.quadraticCurveTo(256, 190, 362, 250); c.quadraticCurveTo(460, 300, 472, 478); c.closePath(); c.fill() // 절벽 몸통
    c.fillStyle = '#5fb04e'; c.beginPath(); c.moveTo(48, 400); c.quadraticCurveTo(54, 290, 150, 242); c.quadraticCurveTo(256, 184, 362, 242); c.quadraticCurveTo(458, 290, 464, 400); c.quadraticCurveTo(256, 330, 48, 400); c.fill() // 초록 풀언덕
    ;[[120, 360, 52, 18], [380, 372, 56, 18], [250, 320, 70, 20]].forEach(([x, y, rx, ry]) => ell(c, x, y, rx, ry, '#78c35f'))
    line(c, [[90, 410], [96, 474]], 5, 'rgba(60,70,50,.4)'); line(c, [[420, 408], [414, 474]], 5, 'rgba(60,70,50,.4)'); line(c, [[250, 396], [248, 474]], 4, 'rgba(60,70,50,.3)') // 절벽 결
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(232, 246); c.lineTo(244, 128); c.lineTo(270, 128); c.lineTo(282, 246); c.closePath(); c.fill() // 등대
    c.fillStyle = '#ff6b6b'; c.beginPath(); c.moveTo(238, 200); c.lineTo(276, 200); c.lineTo(278, 222); c.lineTo(236, 222); c.fill()
    rrect(c, 240, 98, 34, 32, 8, '#ffe066'); rrect(c, 232, 84, 50, 18, 9, '#ff6b6b')
    face(c, 256, 380, 1.05)
  },
  // 소: 우도(소가 누운 모양의 섬)에서 풀 뜯는 소
  cow(c) {
    shadow(c)
    ell(c, 256, 340, 140, 92, '#fffaf0'); ell(c, 200, 316, 46, 38, '#7a5230'); ell(c, 318, 366, 50, 34, '#7a5230') // 몸통 + 얼룩
    ;[[152, 424], [210, 430], [310, 430], [364, 424]].forEach(([x, y]) => rrect(c, x - 18, y - 70, 36, 90, 14, '#fffaf0'))
    ;[[152, 424], [210, 430], [310, 430], [364, 424]].forEach(([x, y]) => ell(c, x, y + 18, 20, 9, '#4a3a30')) // 발굽
    ell(c, 392, 262, 64, 56, '#fffaf0'); ell(c, 408, 296, 36, 24, '#f4b6b6') // 머리 + 주둥이
    line(c, [[364, 214], [350, 176]], 10, '#d9c9a0'); line(c, [[420, 214], [436, 176]], 10, '#d9c9a0') // 뿔
    ell(c, 346, 236, 22, 12, '#7a5230', 0.6); ell(c, 440, 232, 22, 12, '#7a5230', -0.6) // 귀
    circ(c, 376, 262, 8, '#3a2f2a'); circ(c, 420, 262, 8, '#3a2f2a'); circ(c, 400, 304, 4, '#c97a7a'); circ(c, 418, 304, 4, '#c97a7a')
    ell(c, 370, 280, 14, 8, 'rgba(255,140,140,.5)')
    line(c, [[120, 320], [96, 380]], 8, '#fffaf0'); ell(c, 94, 388, 14, 12, '#7a5230') // 꼬리
  },
  // 비양봉(비양도): 한림 앞바다의 둥근 화산섬 — 붉은 화산재 봉우리 + 등대
  biyang(c) {
    shadow(c)
    c.fillStyle = '#8a5a44'; c.beginPath(); c.moveTo(70, 478); c.quadraticCurveTo(110, 300, 210, 190); c.quadraticCurveTo(256, 150, 302, 190); c.quadraticCurveTo(402, 300, 442, 478); c.closePath(); c.fill() // 화산 원뿔 (붉은 화산재)
    c.fillStyle = '#a56f55'; c.beginPath(); c.moveTo(150, 478); c.quadraticCurveTo(170, 320, 230, 210); c.quadraticCurveTo(210, 340, 230, 478); c.fill() // 밝은 면
    c.fillStyle = '#6a8f4a'; c.beginPath(); c.moveTo(214, 192); c.quadraticCurveTo(256, 150, 298, 192); c.quadraticCurveTo(256, 176, 214, 192); c.fill() // 꼭대기 풀
    ell(c, 256, 196, 36, 10, '#46372f') // 분화구
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(366, 478); c.lineTo(374, 372); c.lineTo(396, 372); c.lineTo(404, 478); c.closePath(); c.fill() // 작은 등대
    rrect(c, 372, 344, 26, 30, 6, '#ffe066'); rrect(c, 366, 332, 38, 14, 7, '#ff6b6b')
    ;[[100, 470, 40, 16], [430, 472, 36, 14]].forEach(([x, y, rx, ry]) => ell(c, x, y, rx, ry, '#3b3431')) // 검은 현무암 바위
    face(c, 230, 380, 1.1)
  },
  // 용두암(제주시 용담동): 울퉁불퉁한 검은 바닷가 바위 위에 회색 현무암 바위가 용 머리처럼 솟아, 바다(왼쪽)를 향해 입을 벌린 모양.
  // 참고 사진·일러스트처럼: 위로 솟은 이마와 뿔, 부리처럼 튀어나온 주둥이와 그 아래 벌어진 입, 들쭉날쭉한 등.
  yongdu(c) {
    // 바다
    ell(c, 256, 468, 236, 30, 'rgba(120,200,240,.55)')
    // 해안 바위(검은 현무암 암초)
    c.fillStyle = '#35363b'; c.beginPath(); c.moveTo(6, 482)
    ;[[22, 440], [58, 420], [84, 398], [112, 402], [140, 378], [176, 372], [214, 352], [256, 364], [296, 346], [338, 354], [372, 330], [416, 338], [452, 306], [492, 318], [506, 482]].forEach(([x, y]) => c.lineTo(x, y))
    c.closePath(); c.fill()
    ;[[110, 442, 70, 22], [250, 422, 90, 26], [380, 412, 80, 24], [450, 384, 50, 18]].forEach(([x, y, rx, ry]) => ell(c, x, y, rx, ry, 'rgba(112,114,124,.5)'))
    ;[[40, 464, 38, 16], [92, 472, 30, 12]].forEach(([x, y, rx, ry]) => ell(c, x, y, rx, ry, '#26272b'))
    // 머리 앞(왼쪽)의 낮은 바위
    c.fillStyle = '#44464c'; c.beginPath(); c.moveTo(70, 390); c.lineTo(84, 350); c.lineTo(118, 336); c.lineTo(150, 344); c.lineTo(160, 380); c.closePath(); c.fill()
    // 용 머리 (따로 그려서 무늬가 바위 밖으로 번지지 않게)
    const P = [
      [228, 372], [224, 332], [200, 314], [150, 322], [132, 312], [134, 294], [198, 286], [200, 268], [128, 258], [100, 250], [90, 238], // 목 → 아래턱 → 벌어진 입 → 윗턱 끝(부리)
      [98, 214], [128, 200], [166, 178], [204, 160], [246, 128], [292, 108], // 주둥이 → 이마 → 뿔
      [322, 140], [312, 166], [352, 152], [346, 188], [386, 202], [374, 238], [406, 264], [382, 298], [394, 342], [368, 374], // 들쭉날쭉한 등 → 목 밑동
    ]
    const h = document.createElement('canvas'); h.width = S; h.height = S
    const g = h.getContext('2d')
    const gr = g.createLinearGradient(90, 0, 410, 0); gr.addColorStop(0, '#a9abb3'); gr.addColorStop(0.5, '#6c6e76'); gr.addColorStop(1, '#3f4046')
    g.fillStyle = gr; g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill()
    g.globalCompositeOperation = 'source-atop' // 여기부터는 머리 바위 안쪽에만 칠해요
    g.fillStyle = 'rgba(18,19,24,.42)'; g.beginPath(); g.moveTo(322, 140); g.lineTo(406, 264); g.lineTo(382, 298); g.lineTo(394, 342); g.lineTo(300, 372); g.lineTo(318, 230); g.closePath(); g.fill() // 오른쪽 그늘
    g.fillStyle = 'rgba(20,21,26,.45)'; g.beginPath(); g.moveTo(150, 322); g.lineTo(200, 314); g.lineTo(224, 332); g.lineTo(226, 372); g.lineTo(190, 372); g.closePath(); g.fill() // 아래턱 그늘
    // 깎인 결: 주둥이에서 목으로 굽이치는 줄
    ;[[[110, 232], [170, 212], [230, 176], [290, 140]], [[120, 246], [190, 236], [260, 206], [330, 176]], [[196, 288], [250, 270], [310, 240], [372, 214]], [[210, 320], [262, 304], [322, 280], [384, 250]]].forEach((pts) => {
      line(g, pts, 5, 'rgba(34,36,42,.55)'); line(g, pts.map(([x, y]) => [x + 4, y + 9]), 3, 'rgba(225,230,242,.38)')
    })
    ;[[170, 214], [220, 188], [270, 156], [226, 252], [286, 232], [318, 206], [250, 298]].forEach(([x, y]) => ell(g, x, y, 9, 5, 'rgba(20,21,26,.6)', -0.4)) // 움푹 팬 구멍
    ell(g, 206, 178, 30, 8, 'rgba(235,240,250,.42)', -0.55) // 이마 빛
    ell(g, 210, 214, 13, 9, '#15161a', -0.3); ell(g, 213, 211, 4, 3, 'rgba(240,244,252,.7)') // 눈구멍
    ell(g, 106, 224, 5, 3.5, '#15161a', 0.5) // 콧구멍
    c.drawImage(h, 0, 0)
    // 윤곽선
    c.strokeStyle = 'rgba(24,25,30,.75)'; c.lineWidth = 4; c.lineJoin = 'round'; c.beginPath()
    P.slice(1, -1).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke()
    // 이끼
    ;[[296, 112, 12, 5], [318, 146, 12, 5], [402, 330, 18, 6], [460, 304, 16, 6]].forEach(([x, y, rx, ry]) => ell(c, x, y, rx, ry, 'rgba(112,160,86,.85)'))
    // 부서지는 파도
    ;[[60, 464, 40], [150, 476, 34], [420, 472, 38]].forEach(([x, y, r]) => ell(c, x, y, r, r * 0.4, 'rgba(255,255,255,.95)'))
    ;[[30, 442, 7], [118, 454, 6], [458, 450, 7], [488, 468, 5]].forEach(([x, y, r]) => circ(c, x, y, r, 'rgba(230,246,255,.95)'))
  },
  // 주상절리: 육각 기둥이 빽빽한 절벽
  jusang(c) {
    shadow(c)
    for (let k = 0; k < 7; k++) {
      const x = 60 + k * 62, top = 150 + (k % 3) * 40 + Math.abs(k - 3) * 22
      rrect(c, x, top, 58, 478 - top, 6, k % 2 ? '#6c6c74' : '#7b7b84')
      c.fillStyle = k % 2 ? '#80808a' : '#92929c'; c.beginPath(); c.moveTo(x, top); c.lineTo(x + 29, top - 22); c.lineTo(x + 58, top); c.lineTo(x + 29, top + 18); c.fill() // 기둥 윗면
    }
    c.fillStyle = '#6fb257'; c.beginPath(); c.moveTo(56, 205); c.quadraticCurveTo(256, 90, 456, 205); c.lineTo(456, 215); c.quadraticCurveTo(256, 140, 56, 215); c.fill()
    ell(c, 256, 470, 200, 20, 'rgba(255,255,255,.7)')
    face(c, 256, 340, 1.2)
  },
  // 정방폭포: 절벽에서 바다로 바로 떨어지는 폭포
  jeongbang(c) {
    shadow(c)
    c.fillStyle = '#6d6a62'; c.beginPath(); c.moveTo(40, 478); c.lineTo(60, 170); c.quadraticCurveTo(256, 100, 452, 170); c.lineTo(472, 478); c.closePath(); c.fill()
    c.fillStyle = '#5fae4e'; c.beginPath(); c.moveTo(60, 176); c.quadraticCurveTo(256, 90, 452, 176); c.quadraticCurveTo(256, 150, 60, 176); c.fill() // 위 풀
    rrect(c, 216, 160, 80, 290, 30, '#e8f6ff'); rrect(c, 236, 160, 40, 290, 20, '#ffffff') // 폭포
    for (let k = 0; k < 4; k++) line(c, [[230 + k * 18, 190], [226 + k * 18, 420]], 4, 'rgba(120,190,230,.5)')
    ell(c, 256, 456, 120, 24, 'rgba(255,255,255,.95)'); ell(c, 256, 468, 168, 18, 'rgba(120,200,240,.55)') // 물보라
    ;[[170, 420, 9], [350, 426, 8], [140, 446, 6], [380, 446, 7]].forEach(([x, y, r]) => circ(c, x, y, r, 'rgba(210,240,255,.95)'))
  },
  // 마라도 최남단 기념비
  marado(c) {
    shadow(c)
    rrect(c, 146, 150, 220, 320, 50, '#8c8c92'); rrect(c, 170, 170, 172, 290, 40, '#a5a5ab')
    rrect(c, 196, 214, 120, 150, 16, '#f6f1e6')
    c.fillStyle = '#d6336c'; c.font = 'bold 54px sans-serif'; c.textAlign = 'center'; c.fillText('최남단', 256, 276)
    c.fillStyle = '#495057'; c.font = 'bold 34px sans-serif'; c.fillText('마라도', 256, 330)
    ;[[116, 464], [396, 462]].forEach(([x, y]) => { ell(c, x, y, 38, 22, '#7bbf5a') })
    circ(c, 256, 126, 14, '#ff6b6b'); line(c, [[256, 126], [256, 150]], 6, '#6b4a2b')
  },
  // 흑돼지: 새까만 털 + 분홍 코 + 뾰족 귀 + 말린 꼬리 (오른쪽을 보고 서 있어요)
  pig(c) {
    shadow(c)
    ;[[170, 420], [222, 430], [318, 430], [372, 420]].forEach(([x, y]) => rrect(c, x - 20, y - 80, 40, 100, 16, '#26262b')) // 다리
    ;[[170, 420], [222, 430], [318, 430], [372, 420]].forEach(([x, y]) => ell(c, x, y + 20, 22, 10, '#5a5a62')) // 발굽
    ell(c, 250, 330, 150, 100, '#2f2f35'); ell(c, 230, 300, 90, 40, '#44444c') // 몸통 + 등 빛
    for (let k = 0; k < 9; k++) line(c, [[130 + k * 28, 252 + Math.abs(k - 4) * 3], [126 + k * 28, 238 + Math.abs(k - 4) * 3]], 5, '#1b1b1f') // 등 위 뻣뻣한 털
    line(c, [[102, 330], [70, 318], [64, 288], [88, 280]], 9, '#2f2f35') // 말린 꼬리
    ell(c, 372, 306, 76, 68, '#34343a') // 머리
    ell(c, 340, 238, 30, 40, '#26262b', -0.4); ell(c, 396, 236, 30, 40, '#26262b', 0.4) // 귀
    ell(c, 340, 242, 14, 24, '#f4a6b4', -0.4)
    ell(c, 436, 330, 40, 32, '#f4a6b4'); circ(c, 424, 330, 7, '#c9707f'); circ(c, 448, 330, 7, '#c9707f') // 분홍 코
    circ(c, 392, 292, 11, '#ffffff'); circ(c, 394, 294, 6, '#15151a'); circ(c, 391, 291, 2.5, '#fff') // 눈
    ell(c, 372, 336, 18, 10, 'rgba(255,140,160,.55)') // 볼터치
  },
  // 오징어: 뾰족한 원뿔 몸통 + 마름모 지느러미 + 큰 눈 + 길게 늘어진 다리 (오른쪽으로 헤엄)
  squid(c) {
    ell(c, 256, 444, 150, 20, 'rgba(255,255,255,.5)')
    // 다리: 짧은 8개 + 긴 촉완 2개
    ;[[0, 214], [1, 232], [2, 250], [3, 268], [4, 286], [5, 304]].forEach(([k, y]) => { line(c, [[176, y + 6], [130, y + 14 + k * 4], [74, y + 6 + k * 14], [30, y + 26 + k * 12]], 11, '#f0a69a'); circ(c, 30, y + 26 + k * 12, 8, '#d9776a') })
    line(c, [[176, 236], [110, 190], [44, 160]], 9, '#f0a69a'); circ(c, 44, 160, 11, '#d9776a')
    line(c, [[176, 292], [110, 340], [44, 372]], 9, '#f0a69a'); circ(c, 44, 372, 11, '#d9776a')
    // 마름모 지느러미(몸통 끝)
    c.fillStyle = '#f6c9bf'; c.beginPath(); c.moveTo(370, 256); c.lineTo(440, 176); c.lineTo(490, 256); c.lineTo(440, 336); c.closePath(); c.fill()
    // 원뿔 몸통(외투막)
    c.fillStyle = '#fbe3da'; c.beginPath(); c.moveTo(150, 200); c.quadraticCurveTo(300, 190, 462, 256); c.quadraticCurveTo(300, 322, 150, 312); c.quadraticCurveTo(116, 256, 150, 200); c.fill()
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(190, 214); c.quadraticCurveTo(300, 208, 400, 244); c.quadraticCurveTo(300, 232, 190, 232); c.fill() // 윗면 빛
    // 갈색 반점(색소포)
    for (let k = 0; k < 16; k++) { const x = 190 + k * 17, y = 256 + Math.sin(k * 1.7) * 30; circ(c, x, y, 4 + (k % 3), 'rgba(196,96,84,.7)') }
    // 큰 눈
    circ(c, 188, 252, 26, '#ffffff'); circ(c, 194, 254, 16, '#26262c'); circ(c, 188, 246, 6, '#ffffff')
    ell(c, 214, 292, 16, 8, 'rgba(255,120,140,.5)') // 볼터치
    ;[[70, 120, 8], [112, 96, 6], [150, 112, 5]].forEach(([x, y, r]) => circ(c, x, y, r, 'rgba(190,230,250,.9)')) // 물방울
  },
  // 갈치: 은빛으로 반짝이는 길쭉한 리본 모양 물고기 (오른쪽으로 헤엄)
  cutlass(c) {
    const gr = c.createLinearGradient(0, 200, 0, 310); gr.addColorStop(0, '#f4f8fb'); gr.addColorStop(1, '#a9b6c3')
    c.fillStyle = gr; c.beginPath(); c.moveTo(24, 276); c.quadraticCurveTo(200, 196, 440, 212); c.quadraticCurveTo(488, 218, 490, 246); c.quadraticCurveTo(480, 270, 440, 272); c.quadraticCurveTo(220, 304, 24, 284); c.closePath(); c.fill() // 몸통
    c.fillStyle = '#c9d6e2'; c.beginPath(); c.moveTo(24, 276); c.lineTo(0, 246); c.lineTo(34, 262); c.lineTo(2, 300); c.lineTo(24, 284); c.closePath(); c.fill() // 꼬리
    c.strokeStyle = '#b7d6ec'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(96, 250); c.quadraticCurveTo(250, 196, 430, 206); c.stroke() // 등지느러미
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 7; c.beginPath(); c.moveTo(70, 266); c.quadraticCurveTo(220, 226, 400, 232); c.stroke() // 은빛 반짝임
    circ(c, 444, 238, 12, '#ffffff'); circ(c, 447, 240, 7, '#26323a'); circ(c, 444, 235, 2.5, '#fff') // 눈
    c.strokeStyle = '#8a98a6'; c.lineWidth = 4; c.beginPath(); c.arc(410, 244, 22, -0.9, 0.9); c.stroke() // 아가미
    ell(c, 424, 258, 12, 6, 'rgba(255,130,150,.5)') // 볼터치
    ;[[120, 330, 7], [260, 340, 6], [380, 330, 5]].forEach(([x, y, r]) => circ(c, x, y, r, 'rgba(190,230,250,.9)')) // 물방울
  },
  // 비행기: 옆에서 본 귀여운 여객기 (오른쪽으로 날아요). 제주 하늘길 느낌의 주황 꼬리날개 + 꼬리구름
  plane(c) {
    ;[[120, 300, 60, 11], [60, 302, 46, 8], [10, 303, 30, 6]].forEach(([x, y, rx, ry], k) => ell(c, x, y, rx, ry, `rgba(255,255,255,${0.55 - k * 0.14})`)) // 꼬리구름
    c.fillStyle = '#ff8a1c'; c.beginPath(); c.moveTo(150, 290); c.lineTo(120, 188); c.lineTo(188, 188); c.lineTo(228, 290); c.closePath(); c.fill() // 꼬리날개
    c.fillStyle = '#ffb35a'; c.beginPath(); c.moveTo(168, 270); c.lineTo(146, 204); c.lineTo(172, 204); c.lineTo(198, 270); c.closePath(); c.fill()
    c.fillStyle = '#dbe4ec'; c.beginPath(); c.moveTo(236, 306); c.lineTo(190, 372); c.lineTo(250, 372); c.lineTo(332, 316); c.closePath(); c.fill() // 뒤쪽 날개
    ell(c, 290, 296, 200, 54, '#ffffff'); ell(c, 300, 276, 150, 14, 'rgba(255,255,255,.9)') // 동체
    c.fillStyle = '#4dabf7'; c.beginPath(); c.moveTo(120, 308); c.quadraticCurveTo(290, 330, 484, 304); c.lineTo(484, 322); c.quadraticCurveTo(290, 350, 124, 326); c.closePath(); c.fill() // 파란 줄무늬
    ;[0, 1, 2, 3, 4, 5, 6].forEach((k) => rrect(c, 188 + k * 36, 276, 18, 18, 8, '#9ad7f2')) // 창문
    c.fillStyle = '#3b93e6'; c.beginPath(); c.moveTo(430, 280); c.quadraticCurveTo(470, 276, 492, 292); c.lineTo(440, 294); c.closePath(); c.fill() // 조종석 창
    c.fillStyle = '#c4d2de'; c.beginPath(); c.moveTo(262, 318); c.lineTo(200, 406); c.lineTo(270, 406); c.lineTo(356, 326); c.closePath(); c.fill() // 앞쪽 날개
    rrect(c, 286, 346, 70, 26, 13, '#8fa2b3') // 엔진
    ell(c, 468, 306, 10, 6, 'rgba(255,130,150,.6)') // 볼터치
  },
  // 연기: 몽글몽글한 흰 연기 한 덩이 (낚시배 굴뚝에서 피어올라요)
  puff(c) {
    ;[[256, 280, 120, 0.5], [190, 300, 84, 0.55], [326, 296, 90, 0.55], [226, 220, 84, 0.6], [300, 226, 76, 0.6], [258, 172, 66, 0.65]].forEach(([x, y, r, a]) => {
      const g = c.createRadialGradient(x, y, r * 0.15, x, y, r)
      g.addColorStop(0, `rgba(255,255,255,${a + 0.3})`); g.addColorStop(0.7, `rgba(235,240,246,${a})`); g.addColorStop(1, 'rgba(235,240,246,0)')
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill()
    })
  },
  // 연기고리: 비행기가 뒤에 남기는 도넛 모양의 하얀 연기
  ring(c) {
    const g = c.createRadialGradient(256, 256, 96, 256, 256, 220)
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.35, 'rgba(255,255,255,.55)'); g.addColorStop(0.55, 'rgba(255,255,255,.95)'); g.addColorStop(0.8, 'rgba(240,245,250,.5)'); g.addColorStop(1, 'rgba(240,245,250,0)')
    c.fillStyle = g; c.beginPath(); c.arc(256, 256, 220, 0, 7); c.fill()
  },
  // 뿔소라: 뿔(가시)이 돋은 갈색 나선 껍데기 + 입구 안쪽의 크림색 소용돌이 (제주 해녀가 따는 바다 소라)
  whelk(c) {
    ell(c, 256, 468, 180, 22, 'rgba(40,70,40,.22)')
    const OUT = '#4a2a18', BODY = '#a8672f', LIGHT = '#c98542'
    // 가시: 껍데기 둘레에서 바깥으로 뾰족하게 솟은 뿔
    const spikes = (cx, cy, rx, ry, angs, len) => angs.forEach((a) => {
      const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry
      const nx = Math.cos(a), ny = Math.sin(a), tx = -ny, ty = nx
      c.fillStyle = BODY; c.strokeStyle = OUT; c.lineWidth = 5; c.lineJoin = 'round'
      c.beginPath(); c.moveTo(x + tx * 20 - nx * 8, y + ty * 20 - ny * 8); c.lineTo(x + nx * len, y + ny * len); c.lineTo(x - tx * 20 - nx * 8, y - ty * 20 - ny * 8); c.closePath(); c.fill(); c.stroke()
    })
    const whorl = (cx, cy, rx, ry, fill) => { c.fillStyle = fill; c.strokeStyle = OUT; c.lineWidth = 6; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fill(); c.stroke() }
    // 아래 큰 고리부터 위 작은 고리 순서로 (위쪽이 아래쪽 위에 겹쳐요)
    spikes(256, 340, 150, 118, [Math.PI * 1.05, Math.PI * 1.3, Math.PI * 1.7, Math.PI * 1.95, Math.PI * 0.05, Math.PI * 0.3], 44)
    whorl(256, 340, 150, 118, BODY)
    spikes(274, 226, 102, 72, [Math.PI * 1.0, Math.PI * 1.25, Math.PI * 1.75, Math.PI * 2.0], 38)
    whorl(274, 226, 102, 72, BODY)
    spikes(288, 148, 66, 48, [Math.PI * 1.0, Math.PI * 1.35, Math.PI * 1.7, Math.PI * 2.0], 30)
    whorl(288, 148, 66, 48, BODY)
    spikes(296, 96, 36, 28, [Math.PI * 1.15, Math.PI * 1.85], 22)
    whorl(296, 96, 36, 28, LIGHT)
    // 입구(앞쪽 아래): 크림색 + 소용돌이
    c.save(); c.translate(222, 352); c.rotate(-0.35)
    c.fillStyle = OUT; c.beginPath(); c.ellipse(0, 0, 86, 68, 0, 0, 7); c.fill()
    c.fillStyle = '#f6e6d2'; c.beginPath(); c.ellipse(0, 0, 78, 60, 0, 0, 7); c.fill()
    c.strokeStyle = '#b98a62'; c.lineWidth = 4; c.lineCap = 'round'
    for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(8 + k * 2, 4, 62 - k * 15, 46 - k * 11, 0.1, Math.PI * 0.2, Math.PI * 1.65); c.stroke() }
    c.fillStyle = '#d9b48c'; c.beginPath(); c.ellipse(20, 6, 14, 10, 0, 0, 7); c.fill()
    c.restore()
    // 껍데기 무늬: 주황 점 + 짧은 결
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    ;[[256, 340, 150, 118], [274, 226, 102, 72], [288, 148, 66, 48]].forEach(([cx, cy, rx, ry]) => {
      for (let k = 0; k < 26; k++) {
        const a = rnd() * Math.PI * 2, r = 0.25 + rnd() * 0.7
        const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r
        if (x > 150 && x < 300 && y > 290 && y < 420) continue // 입구 자리는 비워요
        ell(c, x, y, 3 + rnd() * 4, 2.5 + rnd() * 3, rnd() > 0.4 ? '#e08a3c' : 'rgba(74,42,24,.55)')
      }
    })
    ;[[330, 300], [370, 360], [318, 400], [392, 316]].forEach(([x, y]) => line(c, [[x - 12, y + 6], [x + 12, y - 6]], 3, 'rgba(74,42,24,.5)'))
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
