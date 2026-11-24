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
  '我哋係中華基督教會何福堂書院嘅學生。學校打算移除照顧咗五年嘅校貓「阿福」，我哋希望校方重新考慮，等阿福可以繼續留喺校園。

如果你都想阿福留低，請用學校 Google 帳號喺下面簽名支持。',
  2000
)
on conflict (id) do nothing;

insert into admins (email) values ('s202201143@ccchwc.edu.hk')
on conflict (email) do nothing;
