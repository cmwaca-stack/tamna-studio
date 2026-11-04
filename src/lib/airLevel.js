// 환경부 대기환경 기준 등급 (미세먼지 ㎍/㎥). 0 좋음 · 1 보통 · 2 나쁨 · 3 매우나쁨
export const grade = (v, cuts) => { if (v == null) return null; const i = cuts.findIndex((c) => v <= c); return i < 0 ? 3 : i }
export const PM25 = [15, 35, 75]
export const PM10 = [30, 80, 150]
export const LV = [
  { text: '좋음', tone: 'good', emoji: '😊', tip: '환기하고 바깥 활동하기 좋아요' },
  { text: '보통', tone: 'ok', emoji: '🙂', tip: '민감한 분은 오래 야외 활동은 줄여요' },
  { text: '나쁨', tone: 'bad', emoji: '😷', tip: '마스크를 쓰고, 환기는 짧게 해요' },
  { text: '매우나쁨', tone: 'worse', emoji: '🚫', tip: '야외 활동은 피하고 창문을 닫아요' },
]
