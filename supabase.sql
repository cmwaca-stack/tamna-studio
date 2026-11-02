-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여넣고 Run
-- (여러 번 실행해도 안전합니다)

create table if not exists tamna_notes (
  id          bigint generated always as identity primary key,
  nickname    text   not null,
  theme       text,                                   -- oreum | myth | jeju43 | jejueo | all
  source      text   not null check (source in ('tour', 'heritage')),
  item_id     text   not null,
  title       text   not null,
  memo        text   not null default '',
  created_at  timestamptz not null default now(),
  unique (nickname, source, item_id)                  -- 같은 소재 중복 저장 방지
);

create index if not exists tamna_notes_nickname_idx on tamna_notes (nickname, created_at desc);

alter table tamna_notes enable row level security;

drop policy if exists "notes read"   on tamna_notes;
drop policy if exists "notes insert" on tamna_notes;
drop policy if exists "notes update" on tamna_notes;
drop policy if exists "notes delete" on tamna_notes;
create policy "notes read"   on tamna_notes for select using (true);
create policy "notes insert" on tamna_notes for insert with check (true);
create policy "notes update" on tamna_notes for update using (true) with check (true);
create policy "notes delete" on tamna_notes for delete using (true);

-- ⚠ 실습용 정책입니다(로그인 없이 누구나 읽기·쓰기). 닉네임으로만 구분합니다.
--   실제 서비스에서는 Supabase Auth 를 붙이고 auth.uid() 로 제한하세요.


-- ─────────────────────────────────────────────────────────
-- ✅ 연결·테이블 확인용 쿼리 (아래를 한 줄씩 따로 실행해 보세요)
-- ─────────────────────────────────────────────────────────

-- 1) 테이블이 만들어졌는지 (tamna_notes 한 줄이 나오면 OK)
-- select table_name from information_schema.tables where table_schema = 'public' and table_name = 'tamna_notes';

-- 2) 컬럼 구조 확인
-- select column_name, data_type, is_nullable from information_schema.columns where table_name = 'tamna_notes' order by ordinal_position;

-- 3) RLS 정책 4개(read/insert/update/delete)가 있는지
-- select policyname, cmd from pg_policies where tablename = 'tamna_notes';

-- 4) 테스트 데이터 넣기 → 조회 (앱의 '내 노트'에서 닉네임을 '테스트' 로 하면 보입니다)
-- insert into tamna_notes (nickname, theme, source, item_id, title, memo) values ('테스트', 'oreum', 'tour', 'sql-test-1', 'SQL 에서 넣은 테스트 소재', '연결 확인용');
-- select * from tamna_notes order by created_at desc limit 10;

-- 5) 테스트 데이터 지우기
-- delete from tamna_notes where nickname in ('테스트', '__healthcheck__');
