-- Save the Cat petition platform.
-- All tables have RLS enabled with NO policies: only the service-role key
-- (used exclusively server-side inside Cloudflare Workers) can touch them.

create extension if not exists citext;

-- Single-row table holding the one petition's editable content.
create table if not exists petition_content (
  id boolean primary key default true check (id),
  title text not null,
  body text not null,
  goal_count integer not null default 0 check (goal_count >= 0),
  updated_at timestamptz not null default now()
);

-- One row per signer; a Google account may sign exactly once.
create table if not exists signatures (
  id bigint generated always as identity primary key,
  email citext not null unique,
  name text not null,
  signed_at timestamptz not null default now()
);
create index if not exists signatures_signed_at_idx on signatures (signed_at desc);

-- Emails allowed into /admin and the CSV export. Manage with SQL, e.g.:
--   insert into admins (email) values ('you@ccchwc.edu.hk');
create table if not exists admins (
  email citext primary key
);

alter table petition_content enable row level security;
alter table signatures enable row level security;
alter table admins enable row level security;

-- Newer Supabase projects can be created without default grants; the service
-- role bypasses RLS but still needs table privileges.
grant all on petition_content, signatures, admins to service_role;

insert into petition_content (id, title, body, goal_count)
values (
  true,
  '拯救校貓行動 · Save the Cat',
  '兩隻貓B喺我哋校園住咗一個月，一直俾學生同老師疼錫照顧，我哋好想佢哋留低。而家傳出消息話，佢哋會喺今個星期五被移走，校方冇任何正式解釋或者諮詢。一間 Band 1 學校理應實踐基本嘅透明度，同埋建立真正嘅「生命教育」，可惜呢個決定將兩者完全拋棄。我相信動物唔係有需要先攞出嚟展示、冇需要就靜靜雞拋棄嘅道具。喺任何倉促而且不可逆轉嘅決定落實之前，我要求校長暫停呢次移走行動，公開同學生討論，例如透過十二月初嘅學生論壇。作為學校社群嘅一員同埋寵物主人，我認為我哋值得一個合理嘅解釋，同埋真正嘅發言權。',
  2000
)
on conflict (id) do nothing;

insert into admins (email) values ('s202201143@ccchwc.edu.hk')
on conflict (email) do nothing;
