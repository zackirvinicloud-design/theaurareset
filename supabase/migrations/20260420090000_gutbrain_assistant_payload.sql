alter table public.journal_entries
add column if not exists assistant_payload jsonb;
