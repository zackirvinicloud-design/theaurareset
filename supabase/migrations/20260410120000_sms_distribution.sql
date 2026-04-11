-- ============================================================
-- SMS reminder distribution
-- ============================================================

create table if not exists public.sms_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone_e164 text not null,
  timezone text not null default 'America/Los_Angeles',
  transactional_opt_in boolean not null default false,
  marketing_opt_in boolean not null default false,
  consent_source text not null default 'web_setup',
  consent_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'paused', 'revoked')),
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists idx_sms_subscriptions_status
  on public.sms_subscriptions (status);

alter table public.sms_subscriptions enable row level security;

create policy "Users can view own sms subscription"
  on public.sms_subscriptions for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own sms subscription"
  on public.sms_subscriptions for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own sms subscription"
  on public.sms_subscriptions for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger update_sms_subscriptions_updated_at
  before update on public.sms_subscriptions
  for each row execute function public.update_updated_at_column();

create table if not exists public.task_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null check (day_number >= 0 and day_number <= 21),
  checklist_key text not null,
  label text not null,
  scheduled_local_time text not null,
  scheduled_at_utc timestamptz not null,
  timezone text not null,
  deep_link_target text not null,
  delivery_channel text not null default 'local' check (delivery_channel in ('local', 'sms')),
  sms_enabled boolean not null default false,
  active boolean not null default true,
  delivered_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day_number, checklist_key)
);

create index if not exists idx_task_reminders_due
  on public.task_reminders (delivery_channel, active, scheduled_at_utc);

alter table public.task_reminders enable row level security;

create policy "Users can view own task reminders"
  on public.task_reminders for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own task reminders"
  on public.task_reminders for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own task reminders"
  on public.task_reminders for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own task reminders"
  on public.task_reminders for delete to authenticated
  using (auth.uid() = user_id);

create trigger update_task_reminders_updated_at
  before update on public.task_reminders
  for each row execute function public.update_updated_at_column();

create table if not exists public.sms_delivery_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reminder_id uuid references public.task_reminders(id) on delete set null,
  sms_subscription_id uuid references public.sms_subscriptions(id) on delete set null,
  provider text not null default 'twilio',
  status text not null,
  message_sid text,
  error_message text,
  response_payload jsonb,
  clicked_target text,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_sms_delivery_events_user_created
  on public.sms_delivery_events (user_id, created_at desc);

alter table public.sms_delivery_events enable row level security;

create policy "Users can view own sms delivery events"
  on public.sms_delivery_events for select to authenticated
  using (auth.uid() = user_id);
