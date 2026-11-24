-- Public petition variant: a second Worker (savethecat-public) lets anyone
-- with a Google account sign into a separate pool. signatures.kind marks
-- which pool a signature belongs to; uniqueness is per (email, kind) so the
-- same person may sign both petitions but only once each.
alter table signatures
  add column if not exists kind text not null default 'school'
  check (kind in ('school', 'public'));

alter table signatures drop constraint if exists signatures_email_key;
drop index if exists signatures_email_key;
create unique index if not exists signatures_email_kind_key
  on signatures (email, kind);
