// 선사 → 공식 마크(각 선사 누리집의 로고, public/ships)와 운임·예매 안내 누리집. 마크가 없는 선사는 이름 첫 글자로 대신해요.
// 씨월드·한일고속은 제주여객터미널 운임 조회에 요금이 없어서(터미널 안내: "선사 홈페이지에서 확인") 선사 누리집으로 연결해요.
export const SHIP_COMPANIES = [
  { match: '한일', logo: '/ships/hanil.png', site: 'https://www.hanilexpress.co.kr/' },
  { match: '씨월드', logo: '/ships/seaworld.png', site: 'https://www.seaferry.co.kr/' },
  { match: '남해고속', logo: '/ships/namhae.png', site: 'http://www.namhaegosok.co.kr/' },
  { match: '현성', logo: '/ships/oceanvista.png', site: 'http://www.oceanvista.co.kr/' },
  { match: '원더풀아이스', logo: '/ships/wonderfulis.png', site: 'https://www.wonderfulis.co.kr/boarding_guide/boarding_fee/' },
]
export const shipCompany = (name) => SHIP_COMPANIES.find((c) => String(name ?? '').includes(c.match))
