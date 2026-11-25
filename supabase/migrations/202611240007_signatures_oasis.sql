-- Separate signature pool for the Oasis-branded deployment: mirrors the
-- final shape of the signatures table (migrations 0001+0003+0004) so the
-- two petitions never mix signers.
create table if not exists public.signatures_oasis (
  id bigint generated always as identity primary key,
  email citext not null,
  name text not null,
  signed_at timestamptz not null default now(),
  kind text not null default 'school' check (kind in ('school', 'public')),
  show_name boolean not null default true
);

create unique index if not exists signatures_oasis_email_kind_key
  on public.signatures_oasis (email, kind);

create index if not exists signatures_oasis_signed_at_idx
  on public.signatures_oasis (signed_at desc);

alter table public.signatures_oasis enable row level security;

revoke all on public.signatures_oasis from anon, authenticated;
grant all on public.signatures_oasis to service_role;
