-- ============================================================
-- Onboarding profile for mobile-first signup funnel
-- ============================================================

CREATE TABLE public.user_onboarding_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_version text NOT NULL DEFAULT 'v1',
  entry_source text NOT NULL DEFAULT 'landing',
  current_day_selected integer NOT NULL DEFAULT 0 CHECK (current_day_selected >= 0 AND current_day_selected <= 21),
  protocol_goal text,
  why_now text,
  primary_blocker text,
  routine_type text,
  diet_pattern text,
  health_flags text[] NOT NULL DEFAULT '{}'::text[],
  support_style text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_onboarding_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding profile"
  ON public.user_onboarding_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding profile"
  ON public.user_onboarding_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding profile"
  ON public.user_onboarding_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_onboarding_profiles_updated_at
  BEFORE UPDATE ON public.user_onboarding_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
