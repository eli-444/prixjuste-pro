-- Tarifly / PrixJuste Pro - schema Supabase
-- A executer dans l'editeur SQL Supabase apres creation du projet.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  activity_type text check (activity_type in ('service', 'product', 'mixed')),
  profession_slug text,
  city text,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professions (
  slug text primary key,
  label text not null,
  activity_type text not null check (activity_type in ('service', 'product', 'mixed')),
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_rates (
  id uuid primary key default gen_random_uuid(),
  profession_slug text not null references public.professions(slug) on delete cascade,
  unit text not null check (unit in ('hour', 'day', 'sqm', 'project', 'service')),
  country text not null default 'FR',
  region text,
  department text,
  city text,
  price_low numeric(12, 2) not null,
  price_median numeric(12, 2) not null,
  price_high numeric(12, 2) not null,
  currency text not null default 'eur',
  source_label text,
  confidence_score integer not null default 50 check (confidence_score >= 0 and confidence_score <= 100),
  sample_size integer,
  valid_from date,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (price_low <= price_median and price_median <= price_high)
);

create table if not exists public.pricing_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  client_name text,
  opportunity_status text not null default 'to_price'
    check (opportunity_status in ('new', 'to_price', 'proposal_sent', 'negotiation', 'won', 'lost')),
  probability integer not null default 50 check (probability >= 0 and probability <= 100),
  deadline date,
  client_budget numeric(12, 2),
  next_action text,
  quote_validated boolean not null default false,
  quote_validated_at timestamptz,
  market_profession_slug text references public.professions(slug) on delete set null,
  market_region text,
  market_city text,
  market_unit text check (market_unit in ('hour', 'day', 'sqm', 'project', 'service')),
  market_reference_price numeric(12, 2),
  market_snapshot jsonb,
  activity_type text not null check (activity_type in ('service', 'product', 'mixed')),
  input jsonb not null,
  result jsonb not null,
  recommended_price numeric(12, 2),
  created_at timestamptz not null default now()
);

create table if not exists public.market_observations (
  id uuid primary key default gen_random_uuid(),
  calculation_id uuid not null unique references public.pricing_calculations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  profession_slug text not null references public.professions(slug) on delete cascade,
  unit text not null check (unit in ('hour', 'day', 'sqm', 'project', 'service')),
  country text not null default 'FR',
  region text,
  city text,
  observed_price numeric(12, 2) not null check (observed_price > 0),
  source text not null default 'validated_quote',
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_rate_stats (
  profession_slug text not null references public.professions(slug) on delete cascade,
  unit text not null check (unit in ('hour', 'day', 'sqm', 'project', 'service')),
  country text not null default 'FR',
  region text not null default '',
  city text not null default '',
  sample_count integer not null default 0,
  average_price numeric(12, 2) not null default 0,
  median_price numeric(12, 2) not null default 0,
  price_low numeric(12, 2) not null default 0,
  price_high numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (profession_slug, unit, country, region, city)
);

create table if not exists public.stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  amount_total integer,
  currency text default 'eur',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded', 'canceled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.premium_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purchase_id uuid references public.purchases(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  source text not null default 'stripe',
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_professions_updated_at on public.professions;
create trigger set_professions_updated_at
before update on public.professions
for each row execute function public.set_updated_at();

drop trigger if exists set_market_rates_updated_at on public.market_rates;
create trigger set_market_rates_updated_at
before update on public.market_rates
for each row execute function public.set_updated_at();

drop trigger if exists set_market_observations_updated_at on public.market_observations;
create trigger set_market_observations_updated_at
before update on public.market_observations
for each row execute function public.set_updated_at();

drop trigger if exists set_stripe_customers_updated_at on public.stripe_customers;
create trigger set_stripe_customers_updated_at
before update on public.stripe_customers
for each row execute function public.set_updated_at();

drop trigger if exists set_purchases_updated_at on public.purchases;
create trigger set_purchases_updated_at
before update on public.purchases
for each row execute function public.set_updated_at();

drop trigger if exists set_premium_entitlements_updated_at on public.premium_entitlements;
create trigger set_premium_entitlements_updated_at
before update on public.premium_entitlements
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.professions enable row level security;
alter table public.market_rates enable row level security;
alter table public.market_observations enable row level security;
alter table public.market_rate_stats enable row level security;
alter table public.pricing_calculations enable row level security;
alter table public.stripe_customers enable row level security;
alter table public.purchases enable row level security;
alter table public.premium_entitlements enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "professions_select_public" on public.professions;
create policy "professions_select_public"
on public.professions for select
using (active = true);

drop policy if exists "market_rates_select_public" on public.market_rates;
create policy "market_rates_select_public"
on public.market_rates for select
using (true);

drop policy if exists "market_observations_select_own" on public.market_observations;
create policy "market_observations_select_own"
on public.market_observations for select
using (auth.uid() = user_id);

drop policy if exists "market_rate_stats_select_public" on public.market_rate_stats;
create policy "market_rate_stats_select_public"
on public.market_rate_stats for select
using (true);

drop policy if exists "pricing_select_own" on public.pricing_calculations;
create policy "pricing_select_own"
on public.pricing_calculations for select
using (auth.uid() = user_id);

drop policy if exists "pricing_insert_own" on public.pricing_calculations;
create policy "pricing_insert_own"
on public.pricing_calculations for insert
with check (auth.uid() = user_id);

drop policy if exists "pricing_delete_own" on public.pricing_calculations;
create policy "pricing_delete_own"
on public.pricing_calculations for delete
using (auth.uid() = user_id);

drop policy if exists "stripe_customers_select_own" on public.stripe_customers;
create policy "stripe_customers_select_own"
on public.stripe_customers for select
using (auth.uid() = user_id);

drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own"
on public.purchases for select
using (auth.uid() = user_id);

drop policy if exists "premium_entitlements_select_own" on public.premium_entitlements;
create policy "premium_entitlements_select_own"
on public.premium_entitlements for select
using (auth.uid() = user_id);

create index if not exists pricing_calculations_user_created_idx
on public.pricing_calculations (user_id, created_at desc);

create index if not exists pricing_calculations_user_status_idx
on public.pricing_calculations (user_id, opportunity_status, created_at desc);

create index if not exists professions_activity_idx
on public.professions (activity_type, active, label);

create index if not exists market_rates_lookup_idx
on public.market_rates (profession_slug, unit, country, region, city);

create index if not exists market_observations_lookup_idx
on public.market_observations (profession_slug, unit, country, region, city);

create or replace function public.refresh_market_rate_stats(
  p_profession_slug text,
  p_unit text,
  p_country text,
  p_region text,
  p_city text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_region text := coalesce(p_region, '');
  v_city text := coalesce(p_city, '');
  v_count integer;
  v_average numeric(12, 2);
  v_median numeric(12, 2);
  v_low numeric(12, 2);
  v_high numeric(12, 2);
begin
  select
    count(*)::integer,
    round(avg(observed_price), 2),
    round(percentile_cont(0.5) within group (order by observed_price)::numeric, 2),
    min(observed_price),
    max(observed_price)
  into v_count, v_average, v_median, v_low, v_high
  from public.market_observations
  where profession_slug = p_profession_slug
    and unit = p_unit
    and country = p_country
    and coalesce(region, '') = v_region
    and coalesce(city, '') = v_city;

  if v_count = 0 then
    delete from public.market_rate_stats
    where profession_slug = p_profession_slug
      and unit = p_unit
      and country = p_country
      and region = v_region
      and city = v_city;
    return;
  end if;

  insert into public.market_rate_stats (
    profession_slug,
    unit,
    country,
    region,
    city,
    sample_count,
    average_price,
    median_price,
    price_low,
    price_high,
    updated_at
  )
  values (
    p_profession_slug,
    p_unit,
    p_country,
    v_region,
    v_city,
    v_count,
    v_average,
    v_median,
    v_low,
    v_high,
    now()
  )
  on conflict (profession_slug, unit, country, region, city)
  do update set
    sample_count = excluded.sample_count,
    average_price = excluded.average_price,
    median_price = excluded.median_price,
    price_low = excluded.price_low,
    price_high = excluded.price_high,
    updated_at = now();
end;
$$;

create or replace function public.refresh_market_rate_stats_from_observation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.refresh_market_rate_stats(old.profession_slug, old.unit, old.country, old.region, old.city);
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    perform public.refresh_market_rate_stats(new.profession_slug, new.unit, new.country, new.region, new.city);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_market_rate_stats_on_observation on public.market_observations;
create trigger refresh_market_rate_stats_on_observation
after insert or update or delete on public.market_observations
for each row execute function public.refresh_market_rate_stats_from_observation();

create or replace function public.sync_market_observation_from_calculation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price numeric(12, 2);
begin
  v_price := coalesce(new.market_reference_price, new.recommended_price);

  if new.quote_validated
    and new.market_profession_slug is not null
    and new.market_unit is not null
    and v_price is not null
    and v_price > 0 then
    insert into public.market_observations (
      calculation_id,
      user_id,
      profession_slug,
      unit,
      country,
      region,
      city,
      observed_price,
      accepted_at
    )
    values (
      new.id,
      new.user_id,
      new.market_profession_slug,
      new.market_unit,
      'FR',
      new.market_region,
      new.market_city,
      v_price,
      coalesce(new.quote_validated_at, now())
    )
    on conflict (calculation_id)
    do update set
      profession_slug = excluded.profession_slug,
      unit = excluded.unit,
      country = excluded.country,
      region = excluded.region,
      city = excluded.city,
      observed_price = excluded.observed_price,
      accepted_at = excluded.accepted_at,
      updated_at = now();
  else
    delete from public.market_observations
    where calculation_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_market_observation_on_calculation on public.pricing_calculations;
create trigger sync_market_observation_on_calculation
after insert or update on public.pricing_calculations
for each row execute function public.sync_market_observation_from_calculation();

create index if not exists purchases_user_created_idx
on public.purchases (user_id, created_at desc);

create index if not exists premium_entitlements_user_status_idx
on public.premium_entitlements (user_id, status);
