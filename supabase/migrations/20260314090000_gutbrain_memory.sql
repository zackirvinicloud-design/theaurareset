-- ============================================================
-- GutBrain AI memory + insight snapshots
-- ============================================================

CREATE TABLE public.user_brain_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_name text NOT NULL DEFAULT 'GutBrain AI',
  preferred_name text,
  protocol_goal text,
  why_now text,
  motivation_style text,
  barriers text[] NOT NULL DEFAULT '{}'::text[],
  support_preferences text[] NOT NULL DEFAULT '{}'::text[],
  wins text[] NOT NULL DEFAULT '{}'::text[],
  conversation_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_brain_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brain profile"
  ON public.user_brain_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brain profile"
  ON public.user_brain_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brain profile"
  ON public.user_brain_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_brain_profiles_updated_at
  BEFORE UPDATE ON public.user_brain_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.journey_insight_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number >= 0 AND day_number <= 21),
  phase_number smallint NOT NULL CHECK (phase_number >= 1 AND phase_number <= 4),
  summary text NOT NULL,
  next_step text,
  signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_journey_insight_snapshots_user_created
  ON public.journey_insight_snapshots(user_id, created_at DESC);

ALTER TABLE public.journey_insight_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insight snapshots"
  ON public.journey_insight_snapshots FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insight snapshots"
  ON public.journey_insight_snapshots FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
