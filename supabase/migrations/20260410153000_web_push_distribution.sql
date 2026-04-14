-- ============================================================
-- Web push reminder delivery infrastructure
-- ============================================================

create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  timezone text not null default 'America/Los_Angeles',
  source text not null default 'notification_setup',
  active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists idx_web_push_subscriptions_user_active
  on public.web_push_subscriptions (user_id, active);

create index if not exists idx_web_push_subscriptions_active_seen
  on public.web_push_subscriptions (active, last_seen_at desc);

alter table public.web_push_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'web_push_subscriptions'
      and policyname = 'Users can view own web push subscriptions'
  ) then
    create policy "Users can view own web push subscriptions"
      on public.web_push_subscriptions for select to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'web_push_subscriptions'
      and policyname = 'Users can insert own web push subscriptions'
  ) then
    create policy "Users can insert own web push subscriptions"
      on public.web_push_subscriptions for insert to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'web_push_subscriptions'
      and policyname = 'Users can update own web push subscriptions'
  ) then
    create policy "Users can update own web push subscriptions"
      on public.web_push_subscriptions for update to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'web_push_subscriptions'
      and policyname = 'Users can delete own web push subscriptions'
  ) then
    create policy "Users can delete own web push subscriptions"
      on public.web_push_subscriptions for delete to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_web_push_subscriptions_updated_at'
  ) then
    create trigger update_web_push_subscriptions_updated_at
      before update on public.web_push_subscriptions
      for each row execute function public.update_updated_at_column();
  end if;
end $$;

create table if not exists public.push_delivery_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reminder_id uuid references public.task_reminders(id) on delete set null,
  web_push_subscription_id uuid references public.web_push_subscriptions(id) on delete set null,
  status text not null,
  response_payload jsonb,
  error_message text,
  clicked_target text,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_push_delivery_events_user_created
  on public.push_delivery_events (user_id, created_at desc);

create index if not exists idx_push_delivery_events_reminder
  on public.push_delivery_events (reminder_id, created_at desc);

alter table public.push_delivery_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'push_delivery_events'
      and policyname = 'Users can view own push delivery events'
  ) then
    create policy "Users can view own push delivery events"
      on public.push_delivery_events for select to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'task_reminders'
  ) then
    alter table public.task_reminders
      drop constraint if exists task_reminders_delivery_channel_check;

    alter table public.task_reminders
      add constraint task_reminders_delivery_channel_check
      check (delivery_channel in ('local', 'sms', 'push'));
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'user_onboarding_profiles'
  ) then
    alter table public.user_onboarding_profiles
      add column if not exists push_setup_source text,
      add column if not exists push_setup_seen_at timestamptz,
      add column if not exists push_setup_completed_at timestamptz,
      add column if not exists push_setup_skipped_at timestamptz,
      add column if not exists push_permission_status text;

    alter table public.user_onboarding_profiles
      drop constraint if exists user_onboarding_profiles_preferred_reminder_channel_check;

    alter table public.user_onboarding_profiles
      add constraint user_onboarding_profiles_preferred_reminder_channel_check
      check (preferred_reminder_channel in ('local', 'sms', 'push'));
  end if;
end $$;
