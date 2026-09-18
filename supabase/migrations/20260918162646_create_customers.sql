create table public.customers (
  id bigint generated always as identity primary key,
  first_name text not null check (char_length(trim(first_name)) > 0),
  last_name text not null check (char_length(trim(last_name)) > 0),
  phone_number text not null check (char_length(trim(phone_number)) > 0),
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customers is 'Window shop customers.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

-- RLS is enabled with no policies (default-deny for anon/authenticated).
-- This table is only ever reached server-side through the privileged
-- service key, which bypasses RLS. Add ownership-scoped policies once
-- end-user auth sits in front of this table.
alter table public.customers enable row level security;

-- auto_expose_new_tables is off (see supabase/config.toml), so explicit
-- grants are required for the table to be reachable through the Data API
-- at all, even for the service role.
grant select, insert, update, delete on public.customers to service_role;
