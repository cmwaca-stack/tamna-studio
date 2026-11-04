// 우도 도항선 정기 시간표 — 우도가는배(udoboat.smart9.net) 안내 이미지를 옮겨 적은 값이에요. (실시간 운항 여부가 아니라 정해진 시간표)
// 성산항: 우도발·성산발 시각이 30분 간격이에요. 종달항: 종달발·우도발이 따로 정해져 있어요.
const half = (from, to) => { // 'HH:MM' ~ 'HH:MM' 30분 간격 시각 목록
  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
  const out = []
  for (let m = toMin(from); m <= toMin(to); m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  return out
}

export const SEONGSAN = [
  { label: '1~2월, 11~12월', months: [1, 2, 11, 12], udo: half('07:30', '17:00'), port: half('08:00', '17:00') },
  { label: '3월, 10월', months: [3, 10], udo: half('07:30', '17:30'), port: half('08:00', '17:30') },
  { label: '4월, 9월', months: [4, 9], udo: half('07:30', '18:00'), port: half('08:00', '18:00') },
  { label: '5~8월', months: [5, 6, 7, 8], udo: ['07:00', ...half('08:00', '18:30')], port: half('08:00', '18:30') },
]
export const JONGDAL = [
  { label: '1~3월, 10~12월', months: [1, 2, 3, 10, 11, 12], port: ['09:30', '11:30', '13:30', '15:30'], udo: ['10:30', '12:30', '14:30', '16:00'] },
  { label: '4~9월', months: [4, 5, 6, 7, 8, 9], port: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:30'], udo: ['09:30', '10:30', '12:30', '13:30', '14:30', '16:00'] },
]
export const UDO_SOURCE = 'http://udoboat.smart9.net/m/pages.php?p=3_1_1_1'
export const UDO_NOTICE = 'http://udoboat.smart9.net/m/list.php?bo_table=7_1_1_1'
