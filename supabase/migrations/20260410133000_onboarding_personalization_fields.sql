-- ============================================================
-- Structured onboarding personalization fields
-- ============================================================

alter table public.user_onboarding_profiles
  add column if not exists first_name text,
  add column if not exists food_preferences text[] not null default '{}'::text[];
