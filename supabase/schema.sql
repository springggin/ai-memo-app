-- 메모 테이블 생성
create table if not exists memos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  category text not null default 'other',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 자동 갱신 (created_at 순서와 무관하게 최신순 정렬을 위해 인덱스 추가)
create index if not exists memos_created_at_idx on memos (created_at desc);

-- RLS 활성화 (로그인 기능이 없는 앱이므로 anon 키로 모든 CRUD를 허용)
alter table memos enable row level security;

create policy "Allow public read" on memos
  for select using (true);

create policy "Allow public insert" on memos
  for insert with check (true);

create policy "Allow public update" on memos
  for update using (true) with check (true);

create policy "Allow public delete" on memos
  for delete using (true);
