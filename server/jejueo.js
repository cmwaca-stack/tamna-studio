// 공공 API ⑤ 제주특별자치도청 제주어 3종 (첨부 OpenAPI 활용가이드 B01·B02·B03)
//  B01 제주 방언사전  /rest/JejuDialectService/getJejuDialectServiceList      ?page&pageSize&name&content&type  (키 없음)
//  B02 제주 생활방언  /rest/JejuLifeDialectService/getJejuLifeDialectServiceList ?startPage&pageSize&authApiKey
//  B03 제주 속담사전  /rest/JejuAdageService/getJejuAdageServiceList           ?page&pageSize          (키 없음)
// 응답은 XML(<jejunetApi>) — 목록은 B01 은 list.item, B02·B03 은 items.item
import { XMLParser } from 'fast-xml-parser'
import { KeyError, toList } from './http.js'

const parser = new XMLParser({ processEntities: true })
const BASE = 'https://www.jeju.go.kr'
const abs = (u) => (!u ? '' : /^https?:/.test(u) ? u : `${BASE}${u.startsWith('/') ? '' : '/'}${u}`)
// 파서가 못 푼 숫자 문자 참조(&#62775; 등)를 글자로 바꾸고, 일반 폰트에 없는 옛한글 전용 영역(PUA) 글자는 아래아 'ㆍ' 로 근사 표기
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/[\uE000-\uF8FF]/g, 'ㆍ')
const str = (v) => (v == null ? '' : decode(String(v).trim()))

export const DIALECT_TYPES = {
  DETI: '때·기후', DEIN: '인륜', DEJI: '지리', DESK: '천문', DEBA: '방위', DEMA: '신체', DEHO: '집', DEFO: '음식', DEBO: '복식',
  DEJO: '직조', DERO: '농경', DEGY: '기예', DEMU: '무속', DENA: '날짐승', DEJS: '짐승', DEWA: '물동물', DEGP: '곤충', DECM: '초목',
  DEGM: '곡물', DECH: '채소', DEFW: '꽃·열매', DEGA: '광물', DEGL: '잡류', DELE: '대이름씨', DESS: '셈씨', DEMS: '움직씨',
  DEGS: '지명', DE01: '그림씨', DE02: '어찌씨', DE03: '매김씨', DE04: '느낌씨', DE05: '토씨',
}

const KINDS = {
  dialect: {
    path: 'JejuDialectService/getJejuDialectServiceList', list: 'list',
    map: (i) => ({ id: str(i.seq), title: str(i.siteName) || str(i.name), old: str(i.name), meaning: str(i.contents), eng: str(i.engContents), sound: str(i.soundUrl), tag: DIALECT_TYPES[str(i.type)] ?? '' }),
  },
  life: {
    path: 'JejuLifeDialectService/getJejuLifeDialectServiceList', list: 'items',
    map: (i) => ({ id: str(i.seq ?? i.name), title: str(i.siteName) || str(i.name), old: str(i.original), meaning: str(i.solution) || str(i.contents), eng: '', sound: '', image: abs(str(i.image1Url)), tag: str(i.type) }),
  },
  adage: {
    path: 'JejuAdageService/getJejuAdageServiceList', list: 'items',
    map: (i) => ({ id: str(i.seq), title: str(i.name), old: '', meaning: str(i.contents), eng: str(i.engContents), sound: abs(str(i.soundUrl)), tag: '' }),
  },
}

export async function jejueo({ kind = 'dialect', page = 1, pageSize = 20, q = '', type = '' } = {}) {
  const k = KINDS[kind]
  if (!k) throw new Error(`알 수 없는 종류: ${kind}`)
  const p = new URLSearchParams()
  if (kind === 'life') {
    p.set('startPage', String(page))
    p.set('authApiKey', process.env.JEJU_API_KEY ?? '')
  } else p.set('page', String(page))
  p.set('pageSize', String(pageSize))
  if (kind === 'dialect') { if (q) p.set('name', q); if (type) p.set('type', type) }

  const res = await fetch(`${BASE}/rest/${k.path}?${p}`)
  const text = await res.text()
  const root = parser.parse(text)?.jejunetApi
  if (!root) throw new Error(`제주도청 API 응답을 해석하지 못했어요 (${res.status}): ${text.slice(0, 120)}`)
  if (Number(root.resultCode) !== 0) { // XML 파서가 "00" 을 숫자 0 으로 읽음
    const msg = `${root.resultMsg ?? '오류'} (${root.resultCode})`
    if (kind === 'life' && !process.env.JEJU_API_KEY) throw new KeyError(`제주 생활방언은 요청키가 필요해요: JEJU_API_KEY 를 .env.local 에 넣으세요 — ${msg}`)
    throw new Error(`제주도청 API: ${msg}`)
  }
  let items = toList(root[k.list]?.item).map(k.map)
  // 생활방언·속담 API 는 검색 조건이 없어 받은 쪽(현재 페이지)에서 걸러 줍니다
  if (q && kind !== 'dialect') items = items.filter((w) => (w.title + w.meaning + w.eng).includes(q))
  return { items, total: Number(root.query?.rows ?? items.length), page: Number(root.query?.page ?? page), pageSize: Number(root.query?.pageSize ?? pageSize) }
}
