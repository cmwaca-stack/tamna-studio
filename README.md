# 알뜰정보 제주살이 — 제주 IP 소재 AI 가이드

> 제주의 이야기를 새로 만드는 **청년 창작자**를 위한, 소재·장소·날씨 AI 가이드

제주 IP(오름, 신화·설화, 4·3, 제주어)로 굿즈·영상·웹툰·전시를 만들려는 청년이
**소재의 역사적 뿌리 → 직접 보러 갈 곳 → 답사 가능한 날씨**를 한 번에 확인합니다.
Three.js 로 만든 입체 제주섬(한라산·오름) 위에 검색 결과가 핀으로 꽂히고, 비 예보가 있으면 3D 장면에 비가 내립니다.

## 화면

| 경로 | 화면 | 하는 일 |
| --- | --- | --- |
| `/` | 홈 | 3D 제주 + 소재 테마 선택, 동작 체크(React·Supabase·/api) |
| `/explore` | 3D 탐색 | 테마·직접 검색 → 핀 + 목록, 핀 선택 → 상세 |
| `/kit` | 소재 키트 | 테마별 답사 날씨 판정 · 국가유산 · 전시/행사/명소 |
| `/guide` | AI 검색 | 에이전트가 API 도구를 골라 호출, 호출한 도구 표시 |

## 사용한 공공데이터 API

| # | API | 용도 | 키 |
| --- | --- | --- | --- |
| ① | 한국관광공사 국문 관광정보 서비스 (TourAPI) | 전시·문화시설(14), 축제(15), 답사 명소(12) | data.go.kr **Decoding 키** |
| ② | 기상청 단기예보 조회서비스 | 답사 날씨 판정, 3D 비 연출 | 위와 동일 |
| ③ | 국가유산청 국가유산 검색 | 소재의 역사적 배경·고증 | 불필요 (XML) |

## AI 에이전트

LLM(Claude) + 도구 3개(위 API) + 반복 루프(상한 5회). 도구의 `description` 이 곧 성능이라 "언제 쓰는지"를 구체적으로 적었습니다.

| 도구 | 하는 일 | 언제 쓰는지 |
| --- | --- | --- |
| `search_tour_places` | 전시·문화시설·축제·답사 명소 검색 | 장소·전시·행사·답사 코스 질문 |
| `get_weather` | 제주시/서귀포시 앞으로 몇 시간 날씨 | 야외 답사·촬영 가능 여부, 비 올 때 실내 대안 |
| `search_heritage` | 국가유산 이름 검색 | 소재의 배경·고증, 특정 유산 질문 |

수업 규칙: 모델 `claude-sonnet-5-5` 고정, 루프 상한 5회·`max_tokens`·대화 기록 10개 제한은 지우지 않습니다.

## 구조

```
api/       Vercel 서버 함수 (비밀 키는 여기서만): hello · tour · weather · heritage · agent
server/    공공 API 호출 함수 (화면용 + 에이전트 도구용 공용) · http.js 공통 도구
src/
  router.jsx · nav.js · layouts/RootLayout.jsx
  store/useAppStore.js     전역 상태 (닉네임·테마, 대화, 토스트)
  data/themes.js           소재 테마 6종 + 키워드
  hooks/                   useThemePins · useWeather · useAsync
  lib/                     supabase · pins · geo · terrain(3D 지형) · weather
  components/              Scene3D(Three.js) · LazyScene · Chips · ItemCard · PinDetail · WeatherChip · Status
  pages/                   Home · Explore · Kit · Guide · NotFound
supabase.sql               tamna_notes 테이블 + RLS 정책
```

## 시작하기

```bash
npm install
copy .env.example .env.local        # macOS/Linux: cp .env.example .env.local
# .env.local 에 값 채우기 (아래 표)
npm run dev                         # http://localhost:5173  (화면 + /api 동시 실행)
```

`npm run dev` 한 번으로 화면과 `/api`(서버 함수)가 같이 뜹니다. `vite.config.js` 의 개발용 플러그인이 `api/` 폴더의 함수를 그대로 실행하고 `.env.local` 값을 읽어 줍니다.
`.env.local` 을 고친 뒤에는 서버를 껐다 켜세요. (Vercel CLI 는 배포·환경변수 관리에만 씁니다: `npm i -g vercel` → `vercel login` → `vercel link`)

### .env.local

| 변수 | 설명 |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase 프로젝트 값 (공개돼도 되는 값). `service_role` 키는 쓰지 않습니다 |
| `DATA_GO_KR_KEY` | 공공데이터포털 **Decoding 키** (TourAPI + 기상청 공용) |
| `ANTHROPIC_API_KEY` | 강사가 나눠 준 Claude 키 — 절대 `VITE_` 를 붙이거나 공개하지 마세요 |

값에는 따옴표·공백·`#` 주석을 붙이지 말고, 저장한 뒤 서버를 껐다 켭니다.

## Supabase 연동

1. [supabase.com](https://supabase.com) → New project (Region: Northeast Asia/Seoul 권장)
2. 대시보드 **SQL Editor → New query** 에 `supabase.sql` 전체를 붙여넣고 **Run**
3. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키를 `.env.local` 에 입력
4. `npm run dev` 를 다시 켜고 홈의 **동작 체크 → Supabase** 가 `연결 OK` 인지 확인

> RLS 정책은 실습용(누구나 읽기·쓰기, 닉네임으로만 구분)입니다. 실제 서비스에서는 Supabase Auth 로 제한하세요.

## Vercel 배포

1. GitHub 저장소에 push (`.env.local` 이 올라가지 않았는지 `git check-ignore -v .env.local` 로 확인)
2. Vercel → Add New → Project → 저장소 선택 (Framework: Vite 자동 인식)
3. **Settings → Environment Variables** 에 4개 입력: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DATA_GO_KR_KEY`, `ANTHROPIC_API_KEY`
4. **Deployments → Redeploy** (환경변수는 재배포해야 적용됩니다)
5. 고정 주소(프로젝트명.vercel.app)를 **시크릿 창**에서 열어 동작 체크 3개 확인

## 체크포인트

- [ ] 홈 "동작 체크" 3개 모두 OK (React·라우터 / Supabase / 서버 함수 /api)
- [ ] `/api/tour?keyword=해녀` · `/api/weather?place=서귀포시` · `/api/heritage?keyword=관덕정` 에서 JSON 확인
- [ ] 소재 키트에서 날씨·유산·장소 3종 표시, 로딩·에러·빈 결과 화면 확인
- [ ] 3D 제주: 마우스로 회전·확대, 핀 클릭 → 저장
- [ ] 에이전트 테스트 4개 (아래 캡처 칸)
- [ ] Vercel 환경변수 4개 입력 → Redeploy → 시크릿 창에서 고정 주소 확인

## 에이전트 테스트 캡처

| 질문 | 기대 동작 | 캡처 |
| --- | --- | --- |
| 제주시 지금 날씨 어때? 오름 촬영 가도 돼? | `get_weather` 1회 | |
| 관덕정이 어떤 국가유산이야? | `search_heritage` | |
| 해녀를 소재로 전시 준비 중인데, 내일 서귀포에 비 오면 볼 만한 실내 장소 알려줘 | 도구 2개 이상 연속 호출 | |
| 제주에 에펠탑 알려줘 | 지어내지 않고 "검색 결과가 없어요" | |

## 배포

- 배포 주소: (프로젝트명).vercel.app
- GitHub: (저장소 주소)

## 자주 막히는 곳

- `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` / XML 에러 → 키 승인 대기(1~2시간) 또는 Encoding 키 사용. **Decoding 키**를 쓰세요.
- TourAPI 결과가 0건 → 지역 코드(`areaCode=39`)로 0건이면 자동으로 `lDongRegnCd=50` 을 한 번 더 시도합니다
- `/api/...` 가 404/500 → 터미널 로그 확인, `.env.local` 수정 후엔 서버 재시작
- Supabase 카드가 빨간색 → 카드의 메시지 확인 (`does not exist` → SQL 실행, `Invalid API key` → 키 재복사)
- 에이전트 429 → 1분 기다리기, 같은 질문 반복 금지 / 401 → `ANTHROPIC_API_KEY` 확인 후 서버 재시작
- 로컬은 되는데 배포본만 에러 → Vercel 환경변수 입력 후 Redeploy
