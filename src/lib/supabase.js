import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// .env.local 을 아직 안 만들었어도 앱이 멈추지 않도록, 값이 없으면 null
export const supabase = url && key ? createClient(url, key) : null
export const isSupabaseReady = Boolean(supabase)
export const NOTES_TABLE = 'tamna_notes'

// 에러 메시지 → 무엇을 하면 되는지
function hint(error) {
  const m = error.message ?? ''
  if (/does not exist|schema cache|relation/i.test(m)) return ' → supabase.sql 을 SQL Editor 에서 실행하세요'
  if (/Invalid API key|JWT/i.test(m)) return ' → anon public 키를 다시 복사하세요 (service_role 아님)'
  if (/row-level security|violates/i.test(m) || error.code === '42501') return ' → supabase.sql 의 policy(정책) 부분을 실행하세요'
  if (/Failed to fetch|NetworkError/i.test(m)) return ' → VITE_SUPABASE_URL 주소를 확인하세요'
  return ''
}

// 홈 "동작 체크"용 — 테이블까지 실제로 읽어 보고, 실패하면 원인 메시지를 돌려준다
export async function checkSupabase() {
  if (!supabase) return { ok: false, msg: '.env.local 에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 넣고 서버를 다시 켜세요' }
  const { error, count } = await supabase.from(NOTES_TABLE).select('id', { count: 'exact', head: true })
  return error
    ? { ok: false, msg: error.message + hint(error) }
    : { ok: true, msg: `연결 OK · ${NOTES_TABLE} 테이블 확인 (${count ?? 0}행)` }
}

// "진단" 버튼용 — 환경변수 → URL 형식 → 읽기 → 쓰기 → 삭제 순서로 점검하고 단계별 결과를 돌려준다
export async function diagnoseSupabase() {
  const steps = []
  const add = (name, ok, msg) => steps.push({ name, ok, msg })

  add('환경변수', Boolean(url && key),
    url && key ? '둘 다 들어 있어요' : `${!url ? 'VITE_SUPABASE_URL ' : ''}${!key ? 'VITE_SUPABASE_ANON_KEY ' : ''}가 비어 있어요 (.env.local 저장 후 서버 재시작)`)
  if (!supabase) return steps

  const urlOk = /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)
  add('URL 형식', urlOk, urlOk ? url.replace(/\/$/, '') : `‘https://프로젝트ID.supabase.co’ 형태여야 해요 (지금: ${url})`)

  const read = await supabase.from(NOTES_TABLE).select('id', { count: 'exact', head: true })
  add('읽기 (select)', !read.error, read.error ? read.error.message + hint(read.error) : `${NOTES_TABLE} 에서 ${read.count ?? 0}행 확인`)
  if (read.error) return steps

  const probe = { nickname: '__healthcheck__', source: 'tour', item_id: String(Date.now()), title: '연결 테스트 (자동 삭제)' }
  const write = await supabase.from(NOTES_TABLE).insert(probe).select('id').single()
  add('쓰기 (insert)', !write.error, write.error ? write.error.message + hint(write.error) : `테스트 행 저장 (id ${write.data.id})`)
  if (write.error) return steps

  const del = await supabase.from(NOTES_TABLE).delete().eq('id', write.data.id)
  add('삭제 (delete)', !del.error, del.error ? del.error.message + hint(del.error) : '테스트 행 삭제 완료')
  return steps
}
