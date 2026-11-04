// 선사 → 공식 마크(각 선사 누리집의 로고, public/ships). 마크가 없는 선사는 이름 첫 글자로 대신해요.
export const SHIP_COMPANIES = [
  { match: '한일', logo: '/ships/hanil.png' },
  { match: '씨월드', logo: '/ships/seaworld.png' },
  { match: '남해고속', logo: '/ships/namhae.png' },
  { match: '현성', logo: '/ships/oceanvista.png' },
  { match: '원더풀아이스', logo: '/ships/wonderfulis.png' },
]
export const shipCompany = (name) => SHIP_COMPANIES.find((c) => String(name ?? '').includes(c.match))
