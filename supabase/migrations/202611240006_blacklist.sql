-- Blacklisted accounts: cannot sign in; existing sessions are treated as
-- logged out. Rows are managed through the service-role REST API, never
-- exposed to clients.
create table if not exists public.blacklist (
  email citext primary key,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.blacklist enable row level security;

revoke all on public.blacklist from anon, authenticated;
grant all on public.blacklist to service_role;
