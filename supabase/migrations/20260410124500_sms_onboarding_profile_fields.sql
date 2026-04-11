-- ============================================================
-- SMS funnel state on onboarding profiles
-- ============================================================

alter table public.user_onboarding_profiles
  add column if not exists sms_setup_source text,
  add column if not exists sms_setup_seen_at timestamptz,
  add column if not exists sms_setup_completed_at timestamptz,
  add column if not exists sms_setup_skipped_at timestamptz,
  add column if not exists sms_transactional_opt_in boolean not null default false,
  add column if not exists sms_marketing_opt_in boolean not null default false,
  add column if not exists preferred_reminder_channel text not null default 'local';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_onboarding_profiles_preferred_reminder_channel_check'
  ) then
    alter table public.user_onboarding_profiles
      add constraint user_onboarding_profiles_preferred_reminder_channel_check
      check (preferred_reminder_channel in ('local', 'sms'));
  end if;
end $$;
