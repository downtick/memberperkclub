-- ============================================================================
-- MemberPerkClub.com — Supabase schema
-- ============================================================================
-- Two membership paths, no free consumer tier:
--   1. Retail  — $149/yr Stripe subscription, auto-renews, member manages own
--      billing via Stripe Customer Portal and CAN see what they paid.
--   2. Producer-enrolled — a free "producer" account pays a one-time $12 per
--      client (PaymentIntent off a saved card, NOT a subscription). Fixed
--      1-year term, does NOT auto-renew, non-refundable, no commission ever.
--      The enrolled member canNOT see what was paid and canNOT cancel it
--      themselves (their account settings only allow email/password changes).
--
-- Run this whole file once against a fresh Supabase project (SQL editor or
-- `supabase db push`). Idempotent-ish: uses `create table if not exists` /
-- `create or replace` where practical, but re-running policy blocks will
-- error on duplicates — drop and re-run in a fresh project when iterating.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ── Member number sequence (collision-safe under concurrent signups) ───────
-- Format: MPC-000001 (zero-padded to 6 digits). A Postgres sequence
-- guarantees uniqueness under concurrency; the trigger formats it at insert
-- time so the column is a plain, indexable text value everywhere else.
create sequence if not exists member_number_seq start 1;

-- ============================================================================
-- profiles — every account: member (retail or producer-enrolled), producer,
-- or admin. Producers are NOT members; they're the free sales channel.
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  member_number text unique,                 -- MPC-000001, set by trigger below
  role text not null default 'member'
    check (role in ('member','producer','admin')),

  first_name text,
  last_name text,
  phone text,
  state text,

  -- Membership (only meaningful for role='member'; null/irrelevant for
  -- producer/admin rows)
  plan text
    check (plan is null or plan in ('retail_annual','producer_enrolled')),
  membership_status text not null default 'pending'
    check (membership_status in ('pending','active','past_due','lapsed','canceled')),
  billing_source text not null default 'stripe'
    check (billing_source in ('stripe','comp','manual','producer')),
  comp_until timestamptz,                    -- admin-granted access through this date
  admin_note text,                           -- free-text, admin-only

  -- Retail (Stripe subscription) fields
  stripe_customer_id text unique,
  stripe_subscription_id text,
  current_period_end timestamptz,            -- retail: next renewal date
                                              -- producer-enrolled: fixed expiration (no renewal)

  -- Producer-enrolled fields
  producer_id uuid references profiles(id),  -- which producer enrolled this member
  enrolled_at timestamptz,                   -- when the $12 charge succeeded
  expires_at timestamptz,                    -- producer-enrolled term end (1 yr from enrolled_at)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_producer_idx on profiles(producer_id);
create index if not exists profiles_status_idx on profiles(membership_status);

-- Auto-assign member_number on insert if not already set
create or replace function assign_member_number()
returns trigger as $$
begin
  if new.member_number is null then
    new.member_number := 'MPC-' || lpad(nextval('member_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_assign_member_number on profiles;
create trigger trg_assign_member_number
  before insert on profiles
  for each row execute function assign_member_number();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Create a profile row automatically when a Supabase Auth user is created.
-- Role/plan defaults to 'member'/null; app code (signup flow, admin create,
-- producer signup) updates the row right after via service-role client with
-- the real role/plan/name/etc.
create or replace function handle_new_auth_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ============================================================================
-- producers — business/billing data for producer accounts. One row per
-- profile with role='producer'. Holds the saved-card reference used for
-- instant $12 PaymentIntents, plus future-proofing for a flat-monthly plan.
-- ============================================================================
create table if not exists producers (
  id uuid primary key references profiles(id) on delete cascade,

  -- Business identity. business_name is what a member sees in the "Your
  -- membership is provided by …" band on their dashboard, so it is required
  -- at signup.
  business_name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,                          -- 5-digit US ZIP

  stripe_customer_id text unique,            -- Stripe customer holding the saved payment method
  stripe_payment_method_id text,             -- default PaymentMethod from the SetupIntent

  -- Future: flat-monthly "unlimited" plan (up to 500 enrollments/mo) instead
  -- of $12/client. NOT wired up yet — schema only, so it can be added later
  -- without a rearchitect. Do not build Stripe subscription/quota logic for
  -- this in Phase 1.
  billing_mode text not null default 'per_client'
    check (billing_mode in ('per_client','flat_monthly')),
  monthly_quota int,                         -- e.g. 500 for the future flat plan; null under per_client

  created_at timestamptz not null default now()
);

-- ============================================================================
-- member_events — unified audit log. actor_id null = system/Stripe event;
-- actor_id set = an admin did it. Powers both the per-account timeline
-- (/admin/members/[id]) and the site-wide log (/admin/audit).
-- ============================================================================
create table if not exists member_events (
  id bigint generated always as identity primary key,
  member_id uuid not null references profiles(id) on delete cascade,
  actor_id uuid references profiles(id),
  event text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index if not exists member_events_timeline_idx on member_events(member_id, created_at desc);
create index if not exists member_events_actor_idx on member_events(actor_id, created_at desc);

-- ============================================================================
-- resources — the perks/affiliate directory shown at /dashboard/perks.
-- Seeded from websites/_reference/non-insurance-affiliate-links.md.
-- ============================================================================
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,                    -- Business | Personal | Health & Beauty | Financial | Home & Auto | Travel
  description text,
  logo_url text,
  affiliate_url text not null,
  discount_code text,
  code_instructions text,
  featured boolean not null default false,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists resources_category_idx on resources(category);

create table if not exists resource_clicks (
  id bigint generated always as identity primary key,
  resource_id uuid not null references resources(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  clicked_at timestamptz not null default now()
);

-- ============================================================================
-- articles — the learning library at /dashboard/articles. v1 content lives
-- as MDX-ish content files (content/articles/*), but rows exist here so the
-- header omni-search and "what's new" widget can index title/summary/slug
-- without importing the whole content tree.
-- ============================================================================
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  category text,                             -- Home | Budgeting | Wellness | Printable
  printable boolean not null default false,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- email_log — SMTP2GO send record (debugging deliverability, never logs
-- secrets like temp passwords).
-- ============================================================================
create table if not exists email_log (
  id bigint generated always as identity primary key,
  to_email text not null,
  template text not null,
  status text,
  error text,
  sent_at timestamptz not null default now()
);

-- ============================================================================
-- stripe_events — webhook idempotency guard
-- ============================================================================
create table if not exists stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- ============================================================================
-- member_access view — the SINGLE gating source of truth. Every dashboard
-- route and RLS policy checks has_access, never membership_status directly.
-- ============================================================================
create or replace view member_access as
select
  p.*,
  (
    p.membership_status in ('active','past_due')
    or (p.comp_until is not null and p.comp_until > now())
  ) as has_access
from profiles p;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles enable row level security;
alter table producers enable row level security;
alter table member_events enable row level security;
alter table resources enable row level security;
alter table resource_clicks enable row level security;
alter table articles enable row level security;
alter table email_log enable row level security;
alter table stripe_events enable row level security;

-- profiles: a user can read their own row; admins can read/manage all.
-- Sensitive billing/role columns are protected from direct client updates —
-- only server actions using the service-role key (after requireAdmin()/
-- Stripe webhook verification) may change them.
create policy "own profile read" on profiles for select
  using (auth.uid() = id);
create policy "admins read all profiles" on profiles for select
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));
create policy "own profile update basic fields" on profiles for update
  using (auth.uid() = id);
create policy "admins manage all profiles" on profiles for all
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));

revoke update (
  role, member_number, plan, membership_status, billing_source, comp_until,
  admin_note, stripe_customer_id, stripe_subscription_id, current_period_end,
  producer_id, enrolled_at, expires_at
) on profiles from authenticated;

-- producers: a producer can read/update their own row; admins manage all.
-- A member may also read the business_name of the producer who enrolled them,
-- so their dashboard can render "Your membership is provided by …".
create policy "own producer row" on producers for select
  using (auth.uid() = id);
create policy "enrolled member reads their producer" on producers for select
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.producer_id = producers.id
  ));
create policy "admins manage producers" on producers for all
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));

-- member_events: admins read everything; a member/producer can read their own
-- non-sensitive timeline
create policy "admins read all events" on member_events for select
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));
create policy "own timeline read" on member_events for select
  using (auth.uid() = member_id);
create policy "admins write events" on member_events for insert
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'))
  with check (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));

-- resources: readable by any member/producer/admin with has_access; admins
-- manage (insert/update/delete) via service-role in server actions
create policy "active members read resources" on resources for select
  using (
    active and exists (
      select 1 from member_access m where m.id = auth.uid() and (m.has_access or m.role in ('admin','producer'))
    )
  );
create policy "admins manage resources" on resources for all
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));

create policy "members log clicks" on resource_clicks for insert
  with check (auth.uid() = profile_id);
create policy "admins read clicks" on resource_clicks for select
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));

-- articles: same gate as resources
create policy "active members read articles" on articles for select
  using (
    published and exists (
      select 1 from member_access m where m.id = auth.uid() and (m.has_access or m.role in ('admin','producer'))
    )
  );
create policy "admins manage articles" on articles for all
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));

-- email_log / stripe_events: admin only, otherwise server (service-role) only
create policy "admins read email log" on email_log for select
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));
create policy "admins read stripe events" on stripe_events for select
  using (exists (select 1 from profiles a where a.id = auth.uid() and a.role = 'admin'));

-- ============================================================================
-- Seed: first admin. Replace the email, then run once after your first
-- Supabase Auth signup (or after using the Admin API to create the account).
-- ============================================================================
-- update profiles set role = 'admin' where email = 'you@memberperkclub.com';
