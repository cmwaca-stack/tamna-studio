import Anthropic from '@anthropic-ai/sdk'
import { searchTour } from '../server/tour.js'
import { getWeather } from '../server/weather.js'
import { searchHeritage } from '../server/heritage.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-sonnet-5-5' // 수업 규칙: 다른 모델로 바꾸지 마세요
const MAX_TURNS = 5 // 에이전트 루프 상한 (수업 규칙: 지우지 마세요)
const MAX_HISTORY = 10 // 대화 기록 상한 (수업 규칙: 지우지 마세요)

// ① 도구 설명서 — Claude 는 이 description 만 보고 "어떤 도구를 언제 쓸지" 스스로 고른다
const tools = [
  {
    name: 'search_tour_places',
    description:
      '제주에서 창작 소재를 직접 보러 갈 장소를 한국관광공사 TourAPI 로 검색한다. 전시·박물관 등 문화시설(14), 축제·행사(15), 답사 명소(12)를 찾을 때 쓴다. 사용자가 장소·전시·행사·답사 코스를 물으면 반드시 이 도구를 먼저 쓴다.',
    input_schema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: '소재 키워드 (예: 해녀, 돌하르방, 오름, 신화, 4·3)' },
        contentTypeId: { type: 'string', description: '14 전시·문화시설, 15 축제·행사, 12 답사 명소' },
      },
    },
  },
  {
    name: 'get_weather',
    description:
      '기상청 단기예보로 제주시/서귀포시의 앞으로 몇 시간 기온·하늘·강수확률을 조회한다. 야외 답사·촬영 가능 여부, 비 올 때 실내 대안을 판단해야 하거나 사용자가 날씨를 물을 때 쓴다.',
    input_schema: {
      type: 'object',
      properties: { place: { type: 'string', enum: ['제주시', '서귀포시'] } },
      required: ['place'],
    },
  },
  {
    name: 'search_heritage',
    description:
      '국가유산청 API 로 제주의 국가유산을 이름으로 검색한다. 소재의 역사적 배경이나 고증이 필요하거나, 사용자가 특정 유산·유적(예: 관덕정)이 무엇인지 물을 때 쓴다.',
    input_schema: { type: 'object', properties: { keyword: { type: 'string', description: '유산 이름 (예: 관덕정, 삼성혈)' } } },
  },
]

// ② 도구 이름 → 실제로 실행할 함수
const run = { search_tour_places: searchTour, get_weather: getWeather, search_heritage: searchHeritage }

const SYSTEM = `너는 '알뜰정보 제주살이'의 가이드 에이전트다. 제주 IP(해녀, 돌하르방, 오름, 신화·설화, 4·3, 제주어 등)로 굿즈·영상·웹툰·전시를 만들려는 청년 창작자를 돕는다.
- 장소·날씨·유산 정보는 반드시 도구로 확인한 뒤 답한다.
- 도구 결과에 없는 장소나 유산은 지어내지 않고 "검색 결과가 없어요"라고 답한다.
- 야외 답사·촬영을 묻는데 비가 오거나 강수확률이 높으면 실내 대안(전시·문화시설)을 함께 제안한다.
- 4·3처럼 민감한 소재는 가볍게 소비하지 않도록 존중하는 톤을 유지하고, 확인되지 않은 사실을 단정하지 않는다.
- 답은 한국어로, 5문장 이내로 짧게.`

// 대화 기록 정리: 최근 N개만, 그리고 반드시 user 메시지로 시작해야 API 가 받아준다
function cleanHistory(history) {
  const recent = (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content)
    .slice(-MAX_HISTORY)
  while (recent.length && recent[0].role !== 'user') recent.shift()
  return recent
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const { message, history } = req.body ?? {}
  if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message 가 비어 있어요' })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY 가 설정되지 않았어요' })

  const messages = [...cleanHistory(history), { role: 'user', content: message.slice(0, 1000) }]
  const steps = [] // 화면의 "에이전트가 호출한 도구" 목록용

  try {
    // ③ 에이전트 루프: 생각 → 도구 호출 → 결과 확인 → (반복) → 최종 답
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const r = await client.messages.create({ model: MODEL, max_tokens: 1024, system: SYSTEM, tools, messages })

      if (r.stop_reason !== 'tool_use') {
        const answer = r.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n')
        return res.status(200).json({ answer, steps })
      }

      messages.push({ role: 'assistant', content: r.content })
      const results = []
      for (const block of r.content) {
        if (block.type !== 'tool_use') continue
        let result
        try { result = await run[block.name](block.input ?? {}) }
        catch (e) { result = { error: e.message } }
        steps.push({ tool: block.name, args: block.input, count: Array.isArray(result) ? result.length : 0 })
        results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) })
      }
      messages.push({ role: 'user', content: results })
    }
    res.status(200).json({ answer: '도구 호출이 너무 많아 중단했어요. 질문을 조금 더 좁혀 주세요.', steps })
  } catch (e) {
    // 429 = 호출 한도 초과, 401 = 키 오류
    res.status(e.status ?? 500).json({ error: e.status === 429 ? '사용량이 많아요. 1분 뒤 다시 시도하세요.' : e.message })
  }
}
