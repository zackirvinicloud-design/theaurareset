create or replace function public.grant_founder_complimentary_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.email, '')) = 'zackirvin@icloud.com' then
    insert into public.user_subscriptions (
      user_id,
      is_active,
      payment_provider,
      payment_id
    )
    values (
      new.id,
      true,
      'complimentary',
      'founder-access'
    )
    on conflict (user_id) do update
      set is_active = excluded.is_active,
          payment_provider = excluded.payment_provider,
          payment_id = excluded.payment_id,
          updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists grant_founder_complimentary_access_on_signup on auth.users;

create trigger grant_founder_complimentary_access_on_signup
after insert on auth.users
for each row
execute function public.grant_founder_complimentary_access();

insert into public.user_subscriptions (
  user_id,
  is_active,
  payment_provider,
  payment_id
)
select
  users.id,
  true,
  'complimentary',
  'founder-access'
from auth.users as users
where lower(coalesce(users.email, '')) = 'zackirvin@icloud.com'
on conflict (user_id) do update
  set is_active = excluded.is_active,
      payment_provider = excluded.payment_provider,
      payment_id = excluded.payment_id,
      updated_at = now();
