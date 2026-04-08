-- Add daily_symptoms table
create table if not exists daily_symptoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  day_number integer not null,
  symptom_keys text[] not null default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, day_number)
);

-- Add daily_checkins table
create table if not exists daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  day_number integer not null,
  energy integer check (energy between 1 and 5),
  adherence text check (adherence in ('nailed', 'mostly', 'rough')),
  mood text check (mood in ('great', 'okay', 'tough')),
  note text,
  created_at timestamptz default now(),
  unique(user_id, day_number)
);

-- Enable RLS for both
alter table daily_symptoms enable row level security;
alter table daily_checkins enable row level security;

-- Policies for daily_symptoms
create policy "Users can view their own symptoms" on daily_symptoms
  for select using (auth.uid() = user_id);

create policy "Users can insert their own symptoms" on daily_symptoms
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own symptoms" on daily_symptoms
  for update using (auth.uid() = user_id);

-- Policies for daily_checkins
create policy "Users can view their own checkins" on daily_checkins
  for select using (auth.uid() = user_id);

create policy "Users can insert their own checkins" on daily_checkins
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own checkins" on daily_checkins
  for update using (auth.uid() = user_id);
