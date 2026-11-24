-- Roster used to label anonymous signatures by role. Public/anonymous rows
-- show 學生 #N (current student), 校友 #N (alumni), or Staff #N (any email
-- not listed, e.g. teachers). Admins still see real emails.
--
-- The roster rows themselves are NOT in this file (they are personal data):
-- load them through the service-role API instead, e.g.
--   POST $SUPABASE_URL/rest/v1/roster  [{"email": "...", "role": "student"}, ...]
create table if not exists roster (
  email citext primary key,
  role text not null check (role in ('student', 'alumni'))
);

alter table roster enable row level security;
grant all on roster to service_role;
