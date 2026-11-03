// 예보 한 줄 → 사람이 읽는 표현·답사 판정
export const SKY_ICON = { 맑음: 'sun', 구름많음: 'cloud-sun', 흐림: 'clouds' }
export const weatherIcon = (w) => (w.rain !== '없음' ? 'cloud-rain' : SKY_ICON[w.sky] ?? 'cloud')

// "20261102 1400" → "14시"
export const hourLabel = (time) => `${Number(time.split(' ')[1].slice(0, 2))}시`

// 앞으로 몇 시간 예보를 보고 날씨에 맞는 한 줄 안내를 만들어요 (우산·옷차림·바람 등)
export function fieldVerdict(slots = []) {
  if (!slots.length) return null
  const maxPop = Math.max(...slots.map((s) => s.pop))
  const maxWind = Math.max(...slots.map((s) => s.wind ?? 0))
  const maxTemp = Math.max(...slots.map((s) => s.temp))
  const minTemp = Math.min(...slots.map((s) => s.temp))
  const raining = slots.some((s) => s.rain !== '없음')
  if (raining || maxPop >= 60) return { tone: 'rain', icon: 'umbrella', text: '비 예보가 있어요 — 우산을 꼭 챙기세요' }
  if (maxPop >= 30) return { tone: 'maybe', icon: 'umbrella', text: '비가 올 수도 있어요 — 우산을 챙기세요' }
  if (maxWind >= 10) return { tone: 'maybe', icon: 'wind', text: '바람이 강해요 — 외출할 때 조심하세요' }
  if (minTemp <= 5) return { tone: 'maybe', icon: 'thermometer-snow', text: '쌀쌀해요 — 따뜻하게 입고 나가세요' }
  if (maxTemp >= 28) return { tone: 'maybe', icon: 'thermometer-sun', text: '더워요 — 물을 챙기고 자외선을 조심하세요' }
  return { tone: 'good', icon: 'sun', text: '날씨가 좋아요 — 나들이하기 좋은 날이에요' }
}
