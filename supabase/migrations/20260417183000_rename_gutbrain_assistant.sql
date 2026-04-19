-- Normalize assistant naming to GutBrain.

ALTER TABLE public.user_brain_profiles
  ALTER COLUMN assistant_name
  SET DEFAULT 'GutBrain';

UPDATE public.user_brain_profiles
SET assistant_name = 'GutBrain'
WHERE assistant_name IS NULL
   OR btrim(assistant_name) = ''
   OR lower(assistant_name) IN ('coach', 'gutbrain ai');
