create table public.window_types (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(trim(name)) > 0),
  labor_cost_cents integer not null check (labor_cost_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.window_types is 'Window type catalog with a flat labor cost preset per type.';

create table public.glass_types (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(trim(name)) > 0),
  price_per_sqft_cents integer not null check (price_per_sqft_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.glass_types is 'Glass type catalog, priced per square foot.';

create trigger window_types_set_updated_at
before update on public.window_types
for each row
execute function public.set_updated_at();

create trigger glass_types_set_updated_at
before update on public.glass_types
for each row
execute function public.set_updated_at();

-- Same posture as customers: RLS enabled with no anon/authenticated policies
-- (server-only access via the privileged service key for now).
alter table public.window_types enable row level security;
alter table public.glass_types enable row level security;

-- auto_expose_new_tables is off (see supabase/config.toml), so explicit
-- grants are required for these tables to be reachable through the Data
-- API at all, even for the service role.
grant select, insert, update, delete on public.window_types to service_role;
grant select, insert, update, delete on public.glass_types to service_role;
