-- Premium symptom center persistence

create table if not exists public.symptom_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null check (day_number >= 0 and day_number <= 21),
  logged_at timestamptz not null default now(),
  gut_state smallint check (gut_state between 0 and 10),
  mood_score smallint check (mood_score between 0 and 10),
  energy_score smallint check (energy_score between 0 and 10),
  stress_score smallint check (stress_score between 0 and 10),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.symptom_checkin_items (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null references public.symptom_checkins(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null check (day_number >= 0 and day_number <= 21),
  symptom_key text not null,
  symptom_label text not null,
  category text not null,
  severity smallint not null check (severity between 0 and 4),
  trend text not null default 'same' check (trend in ('better', 'same', 'worse')),
  duration_bucket text not null default '12_24h' check (duration_bucket in ('under_1h', '1_3h', '3_12h', '12_24h', 'multi_day')),
  body_areas text[] not null default '{}',
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.symptom_checkin_factors (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null unique references public.symptom_checkins(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null check (day_number >= 0 and day_number <= 21),
  bristol_type smallint check (bristol_type between 1 and 7),
  hydration_level smallint check (hydration_level between 0 and 10),
  sleep_quality smallint check (sleep_quality between 0 and 10),
  supplements_taken boolean,
  trigger_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_symptom_checkins_user_day_logged
  on public.symptom_checkins(user_id, day_number, logged_at desc);

create index if not exists idx_symptom_items_user_day
  on public.symptom_checkin_items(user_id, day_number);

create index if not exists idx_symptom_items_user_label
  on public.symptom_checkin_items(user_id, symptom_label);

create index if not exists idx_symptom_factors_user_day
  on public.symptom_checkin_factors(user_id, day_number);

alter table public.symptom_checkins enable row level security;
alter table public.symptom_checkin_items enable row level security;
alter table public.symptom_checkin_factors enable row level security;

drop policy if exists "Users can view their own symptom checkins" on public.symptom_checkins;
create policy "Users can view their own symptom checkins"
  on public.symptom_checkins for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own symptom checkins" on public.symptom_checkins;
create policy "Users can insert their own symptom checkins"
  on public.symptom_checkins for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own symptom checkins" on public.symptom_checkins;
create policy "Users can update their own symptom checkins"
  on public.symptom_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own symptom checkins" on public.symptom_checkins;
create policy "Users can delete their own symptom checkins"
  on public.symptom_checkins for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view their own symptom checkin items" on public.symptom_checkin_items;
create policy "Users can view their own symptom checkin items"
  on public.symptom_checkin_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own symptom checkin items" on public.symptom_checkin_items;
create policy "Users can insert their own symptom checkin items"
  on public.symptom_checkin_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own symptom checkin items" on public.symptom_checkin_items;
create policy "Users can update their own symptom checkin items"
  on public.symptom_checkin_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own symptom checkin items" on public.symptom_checkin_items;
create policy "Users can delete their own symptom checkin items"
  on public.symptom_checkin_items for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view their own symptom checkin factors" on public.symptom_checkin_factors;
create policy "Users can view their own symptom checkin factors"
  on public.symptom_checkin_factors for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own symptom checkin factors" on public.symptom_checkin_factors;
create policy "Users can insert their own symptom checkin factors"
  on public.symptom_checkin_factors for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own symptom checkin factors" on public.symptom_checkin_factors;
create policy "Users can update their own symptom checkin factors"
  on public.symptom_checkin_factors for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own symptom checkin factors" on public.symptom_checkin_factors;
create policy "Users can delete their own symptom checkin factors"
  on public.symptom_checkin_factors for delete
  using (auth.uid() = user_id);

drop trigger if exists update_symptom_checkins_updated_at on public.symptom_checkins;
create trigger update_symptom_checkins_updated_at
  before update on public.symptom_checkins
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_symptom_checkin_factors_updated_at on public.symptom_checkin_factors;
create trigger update_symptom_checkin_factors_updated_at
  before update on public.symptom_checkin_factors
  for each row execute function public.update_updated_at_column();

-- Legacy backfill from daily_symptoms into baseline rich checkins
with inserted as (
  insert into public.symptom_checkins (
    user_id,
    day_number,
    logged_at,
    note
  )
  select
    ds.user_id,
    ds.day_number,
    coalesce(ds.updated_at, ds.created_at, now()),
    'Imported from legacy symptom tracker.'
  from public.daily_symptoms ds
  where coalesce(array_length(ds.symptom_keys, 1), 0) > 0
    and not exists (
      select 1
      from public.symptom_checkins sc
      where sc.user_id = ds.user_id
        and sc.day_number = ds.day_number
        and sc.note = 'Imported from legacy symptom tracker.'
    )
  returning id, user_id, day_number
)
insert into public.symptom_checkin_items (
  checkin_id,
  user_id,
  day_number,
  symptom_key,
  symptom_label,
  category,
  severity,
  trend,
  duration_bucket,
  body_areas,
  is_custom
)
select
  inserted.id,
  inserted.user_id,
  inserted.day_number,
  symptom_key,
  initcap(replace(symptom_key, '_', ' ')),
  coalesce(mapping.category, 'detox'),
  2,
  'same',
  '12_24h',
  '{}',
  false
from inserted
join public.daily_symptoms ds
  on ds.user_id = inserted.user_id
 and ds.day_number = inserted.day_number
cross join unnest(ds.symptom_keys) as symptom_key
left join (
  values
    ('bloating', 'digestive'),
    ('nausea', 'digestive'),
    ('cramping', 'digestive'),
    ('cravings', 'digestive'),
    ('constipation', 'digestive'),
    ('diarrhea', 'digestive'),
    ('fatigue', 'energy'),
    ('wired', 'energy'),
    ('energy_spikes', 'energy'),
    ('irritable', 'mood'),
    ('anxious', 'mood'),
    ('emotional', 'mood'),
    ('skin_breakout', 'skin')
) as mapping(symptom_key, category)
  on mapping.symptom_key = symptom_key;
