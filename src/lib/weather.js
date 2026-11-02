// 예보 한 줄 → 사람이 읽는 표현·답사 판정
export const SKY_ICON = { 맑음: 'sun', 구름많음: 'cloud-sun', 흐림: 'clouds' }
export const weatherIcon = (w) => (w.rain !== '없음' ? 'cloud-rain' : SKY_ICON[w.sky] ?? 'cloud')

// "20261102 1400" → "14시"
export const hourLabel = (time) => `${Number(time.split(' ')[1].slice(0, 2))}시`

// 앞으로 몇 시간 예보를 보고 답사·촬영 가능 여부를 한 줄로 판정
export function fieldVerdict(slots = []) {
  if (!slots.length) return null
  const maxPop = Math.max(...slots.map((s) => s.pop))
  const raining = slots.some((s) => s.rain !== '없음')
  if (raining || maxPop >= 60) return { tone: 'rain', icon: 'building', text: '비 예보 — 실내 전시·문화시설을 추천해요' }
  if (maxPop >= 30) return { tone: 'maybe', icon: 'umbrella', text: '구름이 많아요 — 우산 챙기고 가볍게 답사해요' }
  return { tone: 'good', icon: 'camera', text: '야외 답사·촬영하기 좋은 날씨예요' }
}
