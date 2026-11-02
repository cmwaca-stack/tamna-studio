// 기상청 예보 한 줄(slot) → 3D 장면이 쓰는 날씨 값.
//  sky: clear | partly | overcast   precip: none | rain | shower | sleet | snow   wind: 풍속(m/s)   dir: 바람이 불어 오는 방향(도, 북=0)
const CLEAR = { sky: 'clear', precip: 'none', wind: 2, dir: 300, label: '맑음' }

const PRESETS = { // 주소 뒤에 ?w=rain 처럼 붙여 효과를 미리 볼 수 있어요
  clear: CLEAR,
  cloudy: { sky: 'overcast', precip: 'none', wind: 3, dir: 300 },
  rain: { sky: 'overcast', precip: 'rain', wind: 5, dir: 300 },
  shower: { sky: 'overcast', precip: 'shower', wind: 7, dir: 270 },
  sleet: { sky: 'overcast', precip: 'sleet', wind: 5, dir: 320 },
  snow: { sky: 'overcast', precip: 'snow', wind: 3, dir: 320 },
  wind: { sky: 'partly', precip: 'none', wind: 11, dir: 300 },
}

const DIRS = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서']
const dirName = (d) => `${DIRS[Math.round((((d % 360) + 360) % 360) / 22.5) % 16]}풍`
const SKY_TEXT = { clear: '맑음', partly: '구름많음', overcast: '흐림' }
const PRECIP_TEXT = { rain: '비', shower: '소나기', sleet: '진눈깨비', snow: '눈' }

const describe = (w) => ({ ...w, label: [PRECIP_TEXT[w.precip] ?? SKY_TEXT[w.sky], `${dirName(w.dir)} ${w.wind}m/s`].join(' · ') })

export function sceneWeather(slot, override) {
  if (override && PRESETS[override]) return describe(PRESETS[override])
  if (!slot) return describe(CLEAR)
  const sky = slot.sky === '맑음' ? 'clear' : slot.sky === '구름많음' ? 'partly' : 'overcast'
  let precip = { 비: 'rain', 소나기: 'shower', 눈: 'snow', '비/눈': 'sleet' }[slot.rain] ?? 'none'
  if (precip === 'none' && slot.pop >= 60) precip = 'rain' // 강수확률이 높으면 비로 표현
  return describe({ sky, precip, wind: Math.round((slot.wind ?? 2) * 10) / 10, dir: slot.windDir ?? 300 })
}

export const isWet = (w) => w.precip !== 'none'
// 바람이 부는 쪽 단위벡터 (장면 x: 동, z: 남). 풍향은 "불어 오는" 방향이라 반대로.
export const windVec = (w) => { const r = (w.dir * Math.PI) / 180; return [-Math.sin(r), Math.cos(r)] }
