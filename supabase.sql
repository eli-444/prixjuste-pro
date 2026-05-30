-- Tarifly / PrixJuste Pro - schema Supabase
-- A executer dans l'editeur SQL Supabase apres creation du projet.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  activity_type text not null check (activity_type in ('service', 'product', 'mixed')),
  input jsonb not null,
  result jsonb not null,
  recommended_price numeric(12, 2),
  created_at timestamptz not null default now()
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

create index if not exists purchases_user_created_idx
on public.purchases (user_id, created_at desc);

create index if not exists premium_entitlements_user_status_idx
on public.premium_entitlements (user_id, status);
