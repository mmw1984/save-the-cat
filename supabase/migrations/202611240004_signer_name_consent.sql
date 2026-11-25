-- Signers can opt in to having their name shown to other signed-in signers.
-- show_name=false keeps the row in the anonymous "#N" list for everyone
-- except admins, who always see names.
alter table signatures
  add column if not exists show_name boolean not null default false;
