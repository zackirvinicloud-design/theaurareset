-- ============================================================
-- BRAINIAC Backend Planning Memory
-- ============================================================

CREATE TABLE public.brainiac_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name text NOT NULL,
  north_star_metric text NOT NULL,
  primary_constraint text NOT NULL CHECK (
    primary_constraint IN ('measurement', 'acquisition', 'activation', 'retention', 'conversion', 'operations')
  ),
  primary_objective text NOT NULL,
  state_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  plan_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  model_memo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brainiac_runs_created_at
  ON public.brainiac_runs(created_at DESC);

ALTER TABLE public.brainiac_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.brainiac_decisions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.brainiac_runs(id) ON DELETE CASCADE,
  decision_index integer NOT NULL,
  area text NOT NULL CHECK (
    area IN ('measurement', 'acquisition', 'activation', 'retention', 'conversion', 'operations')
  ),
  title text NOT NULL,
  rationale text NOT NULL,
  expected_outcome text NOT NULL,
  leading_metric text NOT NULL,
  first_step text NOT NULL,
  reversible boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'proposed' CHECK (
    status IN ('proposed', 'approved', 'running', 'won', 'lost', 'killed')
  ),
  decision_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brainiac_decisions_run_id
  ON public.brainiac_decisions(run_id);

CREATE INDEX idx_brainiac_decisions_status
  ON public.brainiac_decisions(status);

ALTER TABLE public.brainiac_decisions ENABLE ROW LEVEL SECURITY;
