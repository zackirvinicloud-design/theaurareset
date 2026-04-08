create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  phase_name text not null,
  category_name text not null,
  item_name text not null,
  quantity text,
  notes text,
  optional text,
  source text not null default 'manual',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_key)
);

create index if not exists idx_shopping_list_items_user_id on public.shopping_list_items (user_id);
create index if not exists idx_shopping_list_items_lookup on public.shopping_list_items (user_id, phase_name, category_name, item_name);

alter table public.shopping_list_items enable row level security;

drop policy if exists "Users can view their shopping list items" on public.shopping_list_items;
create policy "Users can view their shopping list items"
  on public.shopping_list_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their shopping list items" on public.shopping_list_items;
create policy "Users can insert their shopping list items"
  on public.shopping_list_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their shopping list items" on public.shopping_list_items;
create policy "Users can update their shopping list items"
  on public.shopping_list_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their shopping list items" on public.shopping_list_items;
create policy "Users can delete their shopping list items"
  on public.shopping_list_items for delete
  using (auth.uid() = user_id);

drop trigger if exists update_shopping_list_items_updated_at on public.shopping_list_items;
create trigger update_shopping_list_items_updated_at
  before update on public.shopping_list_items
  for each row execute function public.update_updated_at_column();
