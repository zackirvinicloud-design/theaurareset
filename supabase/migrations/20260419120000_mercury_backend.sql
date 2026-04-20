-- ============================================================
-- MERCURY Backend Planning + Evaluation Memory
-- ============================================================

create table public.mercury_runs (
  id uuid not null default gen_random_uuid() primary key,
  objective text not null check (objective in ('paid_conversions')),
  guardrail_status text not null check (guardrail_status in ('pass', 'blocked')),
  guardrail_reason text not null,
  required_approval boolean not null default true,
  source_citations text[] not null default '{}',
  input_payload jsonb not null default '{}'::jsonb,
  artifact_payload jsonb not null default '{}'::jsonb,
  model_memo text,
  created_at timestamptz not null default now()
);

create index idx_mercury_runs_created_at
  on public.mercury_runs(created_at desc);

create index idx_mercury_runs_objective_created
  on public.mercury_runs(objective, created_at desc);

alter table public.mercury_runs enable row level security;

create table public.mercury_experiments (
  id uuid not null default gen_random_uuid() primary key,
  run_id uuid not null references public.mercury_runs(id) on delete cascade,
  experiment_index integer not null,
  experiment_id text not null,
  title text not null,
  expected_lift numeric not null default 0,
  confidence numeric not null default 0,
  effort numeric not null default 0,
  risk numeric not null default 0,
  time_to_signal integer not null default 7,
  approval_required boolean not null default true,
  experiment_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_mercury_experiments_run_id
  on public.mercury_experiments(run_id);

create index idx_mercury_experiments_expected_lift
  on public.mercury_experiments(expected_lift desc);

alter table public.mercury_experiments enable row level security;

create table public.mercury_eval_runs (
  id uuid not null default gen_random_uuid() primary key,
  run_id uuid references public.mercury_runs(id) on delete set null,
  conversion_proxy_score numeric not null default 0,
  compliance_score numeric not null default 0,
  actionability_score numeric not null default 0,
  calibration_score numeric not null default 0,
  mercury_quality_index numeric not null default 0,
  eval_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_mercury_eval_runs_created_at
  on public.mercury_eval_runs(created_at desc);

create index idx_mercury_eval_runs_quality
  on public.mercury_eval_runs(mercury_quality_index desc);

alter table public.mercury_eval_runs enable row level security;
