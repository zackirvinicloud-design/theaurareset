-- Chat threads for persistent, user-managed conversation history
create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_threads_user_updated
  on public.chat_threads (user_id, updated_at desc);

alter table public.chat_threads enable row level security;

drop policy if exists "Users can view own chat threads" on public.chat_threads;
create policy "Users can view own chat threads"
  on public.chat_threads for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own chat threads" on public.chat_threads;
create policy "Users can insert own chat threads"
  on public.chat_threads for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own chat threads" on public.chat_threads;
create policy "Users can update own chat threads"
  on public.chat_threads for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own chat threads" on public.chat_threads;
create policy "Users can delete own chat threads"
  on public.chat_threads for delete to authenticated
  using (auth.uid() = user_id);

drop trigger if exists update_chat_threads_updated_at on public.chat_threads;
create trigger update_chat_threads_updated_at
  before update on public.chat_threads
  for each row execute function public.update_updated_at_column();

alter table public.journal_entries
  add column if not exists thread_id uuid;

-- Backfill one thread per user/day so existing entries remain visible after thread migration.
with day_threads as (
  select distinct user_id, day_number, gen_random_uuid() as thread_id
  from public.journal_entries
  where thread_id is null
),
inserted as (
  insert into public.chat_threads (id, user_id, title)
  select
    dt.thread_id,
    dt.user_id,
    case
      when dt.day_number = 0 then 'Prep Day chat'
      else 'Day ' || dt.day_number || ' chat'
    end
  from day_threads dt
  on conflict (id) do nothing
  returning id
)
update public.journal_entries je
set thread_id = dt.thread_id
from day_threads dt
where je.thread_id is null
  and je.user_id = dt.user_id
  and je.day_number = dt.day_number;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'journal_entries_thread_id_fkey'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_thread_id_fkey
      foreign key (thread_id) references public.chat_threads(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_journal_entries_user_thread_created
  on public.journal_entries (user_id, thread_id, created_at);

alter table public.journal_entries
  alter column thread_id set not null;
