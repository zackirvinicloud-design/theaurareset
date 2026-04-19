create table if not exists public.recipe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_key text not null,
  title text not null,
  phase_name text not null,
  meal_type text not null,
  summary text,
  ingredients text[] not null default '{}',
  instructions text[] not null default '{}',
  notes text,
  source text not null default 'manual',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recipe_key)
);

create index if not exists idx_recipe_items_user_id on public.recipe_items (user_id);
create index if not exists idx_recipe_items_lookup on public.recipe_items (user_id, phase_name, meal_type, title);

alter table public.recipe_items enable row level security;

drop policy if exists "Users can view their recipes" on public.recipe_items;
create policy "Users can view their recipes"
  on public.recipe_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their recipes" on public.recipe_items;
create policy "Users can insert their recipes"
  on public.recipe_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their recipes" on public.recipe_items;
create policy "Users can update their recipes"
  on public.recipe_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their recipes" on public.recipe_items;
create policy "Users can delete their recipes"
  on public.recipe_items for delete
  using (auth.uid() = user_id);

drop trigger if exists update_recipe_items_updated_at on public.recipe_items;
create trigger update_recipe_items_updated_at
  before update on public.recipe_items
  for each row execute function public.update_updated_at_column();
