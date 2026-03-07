-- ============================================================
-- Guided Journal Tables
-- ============================================================

-- 1. User Progress — persists day, phase, streak
CREATE TABLE public.user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_day integer NOT NULL DEFAULT 0 CHECK (current_day >= 0 AND current_day <= 21),
  current_phase smallint NOT NULL DEFAULT 1 CHECK (current_phase >= 1 AND current_phase <= 4),
  streak_count integer NOT NULL DEFAULT 0,
  last_active_date date,
  start_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Journal Entries — daily text entries + AI responses
CREATE TABLE public.journal_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number >= 0 AND day_number <= 21),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_entries_user_day
  ON public.journal_entries(user_id, day_number);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON public.journal_entries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON public.journal_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON public.journal_entries FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 3. Symptom Logs — quick severity tracking
CREATE TABLE public.symptom_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number >= 0 AND day_number <= 21),
  symptom_type text NOT NULL CHECK (symptom_type IN (
    'bloating', 'fatigue', 'brain_fog', 'headache', 'skin',
    'digestion', 'energy', 'sleep', 'mood', 'other'
  )),
  severity smallint NOT NULL CHECK (severity >= 1 AND severity <= 5),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_symptom_logs_user_day
  ON public.symptom_logs(user_id, day_number);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptoms"
  ON public.symptom_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms"
  ON public.symptom_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptoms"
  ON public.symptom_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. Daily Checklists — checkbox completion state
CREATE TABLE public.daily_checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number >= 0 AND day_number <= 21),
  item_key text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number, item_key)
);

CREATE INDEX idx_daily_checklists_user_day
  ON public.daily_checklists(user_id, day_number);

ALTER TABLE public.daily_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists"
  ON public.daily_checklists FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists"
  ON public.daily_checklists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists"
  ON public.daily_checklists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
