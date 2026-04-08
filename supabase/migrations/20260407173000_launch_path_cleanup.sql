-- Support streamed assistant message updates for the launch-path journal flow
create policy "Users can update own entries" on public.journal_entries
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Typed lead capture table for the advertorial/email waitlist flow
create table if not exists public.lead_captures (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'advertorial',
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_lead_captures_email on public.lead_captures (email);

alter table public.lead_captures enable row level security;

create policy "Anon can insert leads" on public.lead_captures
  for insert to anon
  with check (true);

create policy "Authenticated can insert leads" on public.lead_captures
  for insert to authenticated
  with check (true);
