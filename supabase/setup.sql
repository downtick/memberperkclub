-- MemberPerkClub — one-shot database setup
-- Paste this whole file into the Supabase SQL Editor and press Run.
-- Safe to re-run: tables use "if not exists", policies/triggers are dropped
-- and recreated, and the seed inserts are conflict-guarded.

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
create or replace view member_access with (security_invoker = true) as
select
  p.*,
  (
    p.membership_status in ('active','past_due')
    or (p.comp_until is not null and p.comp_until > now())
  ) as has_access
from profiles p;

-- ============================================================================
-- is_admin() — SECURITY DEFINER so it reads profiles with RLS bypassed.
-- A policy ON profiles that sub-queries profiles makes Postgres raise
-- "infinite recursion detected in policy for relation profiles", which would
-- break every profile read on the site. Routing the admin check through this
-- function is what avoids that.
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

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
drop policy if exists "own profile read" on profiles;
create policy "own profile read" on profiles for select
  using (auth.uid() = id);
drop policy if exists "admins read all profiles" on profiles;
create policy "admins read all profiles" on profiles for select
  using (public.is_admin());
-- Deliberately NO self-update policy on profiles. Every profile write goes
-- through the service-role client in server actions; RLS cannot restrict
-- columns, so a self-update policy would also let a member set their own
-- role='admin' or extend their own comp_until. Members change email/password
-- via supabase.auth.updateUser(), which touches auth.users, not this table.
drop policy if exists "admins manage all profiles" on profiles;
create policy "admins manage all profiles" on profiles for all
  using (public.is_admin());

revoke update (
  role, member_number, plan, membership_status, billing_source, comp_until,
  admin_note, stripe_customer_id, stripe_subscription_id, current_period_end,
  producer_id, enrolled_at, expires_at
) on profiles from authenticated;

-- producers: a producer can read/update their own row; admins manage all.
-- A member may also read the business_name of the producer who enrolled them,
-- so their dashboard can render "Your membership is provided by …".
drop policy if exists "own producer row" on producers;
create policy "own producer row" on producers for select
  using (auth.uid() = id);
drop policy if exists "enrolled member reads their producer" on producers;
create policy "enrolled member reads their producer" on producers for select
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.producer_id = producers.id
  ));
drop policy if exists "admins manage producers" on producers;
create policy "admins manage producers" on producers for all
  using (public.is_admin());

-- member_events: admins read everything; a member/producer can read their own
-- non-sensitive timeline
drop policy if exists "admins read all events" on member_events;
create policy "admins read all events" on member_events for select
  using (public.is_admin());
drop policy if exists "own timeline read" on member_events;
create policy "own timeline read" on member_events for select
  using (auth.uid() = member_id);
drop policy if exists "admins write events" on member_events;
create policy "admins write events" on member_events for insert
  with check (public.is_admin());

-- resources: readable by any member/producer/admin with has_access; admins
-- manage (insert/update/delete) via service-role in server actions
drop policy if exists "active members read resources" on resources;
create policy "active members read resources" on resources for select
  using (
    active and exists (
      select 1 from member_access m where m.id = auth.uid() and (m.has_access or m.role in ('admin','producer'))
    )
  );
drop policy if exists "admins manage resources" on resources;
create policy "admins manage resources" on resources for all
  using (public.is_admin());

drop policy if exists "members log clicks" on resource_clicks;
create policy "members log clicks" on resource_clicks for insert
  with check (auth.uid() = profile_id);
drop policy if exists "admins read clicks" on resource_clicks;
create policy "admins read clicks" on resource_clicks for select
  using (public.is_admin());

-- articles: same gate as resources
drop policy if exists "active members read articles" on articles;
create policy "active members read articles" on articles for select
  using (
    published and exists (
      select 1 from member_access m where m.id = auth.uid() and (m.has_access or m.role in ('admin','producer'))
    )
  );
drop policy if exists "admins manage articles" on articles;
create policy "admins manage articles" on articles for all
  using (public.is_admin());

-- email_log / stripe_events: admin only, otherwise server (service-role) only
drop policy if exists "admins read email log" on email_log;
create policy "admins read email log" on email_log for select
  using (public.is_admin());
drop policy if exists "admins read stripe events" on stripe_events;
create policy "admins read stripe events" on stripe_events for select
  using (public.is_admin());

-- ============================================================================
-- Seed: first admin. Replace the email, then run once after your first
-- Supabase Auth signup (or after using the Admin API to create the account).
-- ============================================================================
-- update profiles set role = 'admin' where email = 'you@memberperkclub.com';


-- ============================================================================
-- MemberPerkClub.com — seed data
-- Run AFTER schema.sql. Mirrors lib/data/resourcesSeed.ts and
-- content/articles/*.mdx — keep the three in sync when adding new perks or
-- articles.
-- ============================================================================

insert into resources (name, category, description, affiliate_url, discount_code, featured, sort) values
-- Business
('GoodCall AI Answering Service', 'Business', 'An AI receptionist that never misses a call — picks up when you can''t, answers common questions, and books appointments around the clock.', 'https://goodcall.com/?ref=clubmembers', null, true, 10),
('CallRail Call Tracking', 'Business', 'Advanced call tracking and analytics so you know exactly which ads, keywords, and campaigns are generating your calls.', 'https://partners.callrail.com/servicelocatorpro', null, false, 20),
('SimpleTexting', 'Business', 'Business texting with the highest open rates in marketing — appointment reminders, promotions, and two-way texts from a dedicated business number.', 'https://simpletexting.grsm.io/servicelocatorpro', null, false, 30),
('Local Phone Numbers', 'Business', 'Buy a local number for any area code to give your business a presence in any city or region you serve.', 'http://www.jdoqocy.com/click-8222006-11832664-1468862346000?sid=memberperkclub', null, false, 40),
('VOIP Phone System', 'Business', 'A full business phone system over the internet, with extensions, voicemail, and call routing.', 'https://www.jdoqocy.com/click-9121627-12746697', null, false, 50),
('Domain Name Registration', 'Business', 'Register your domain at a discount for your business website and email.', 'https://www.jdoqocy.com/6181shqnhp4E676B7C4658CE5C6', null, false, 60),
('Hire a Virtual Assistant', 'Business', 'Find help for your business the easy way — post a job ad and hire a virtual assistant for back-office projects, admin work, and more, without full-time overhead.', 'http://store.onlinejobs.ph/?aid=128288', null, true, 70),
('Freelance Project Marketplace', 'Business', 'Freelancers for any one-off project — design, writing, admin work starting at a few dollars.', 'https://fvrr.co/3jOTSv7', null, false, 80),
('InCorp Business Formation', 'Business', 'Form your business entity the easy way — start a corporation or LLC and get registered agent service.', 'https://www.incorp.com/default.aspx?referredbyaccountid=31890', null, false, 90),
('Create an LLC in Minutes', 'Business', 'Fast, guided LLC formation — create an LLC in minutes without a lawyer.', 'https://shareasale.com/r.cfm?b=1229325&u=1690228&m=81890&urllink=&afftrack=', null, false, 100),
('iPostal1 Virtual Mailbox', 'Business', 'A real street address for your business mail — mail forwarding and scanning, a professional address without a physical office.', 'https://ipostal1.com/?ref=4283', null, false, 110),
('SiteGround Hosting', 'Business', 'Fast, reliable WordPress and website hosting, built for speed and uptime.', 'https://www.siteground.com/recommended?referrer_id=8203857', null, true, 120),
('QuickBooks', 'Business', 'Accounting software built for small business — discounted subscription for invoicing, bookkeeping, and payroll.', 'https://quickbooks.grsm.io/servicelocator', null, false, 130),
('Envato Elements', 'Business', 'Unlimited downloads of stock photos, video, fonts, and design templates for one subscription.', 'https://1.envato.market/7mRmRy', null, false, 140),
('Freshsales CRM', 'Business', 'A CRM to track leads and customers — organize leads, deals, and follow-ups.', 'https://affiliatepartner-freshsales.freshworks.com/servicelocator', null, false, 150),
('FreshDesk', 'Business', 'Support ticketing for customer service teams — manage customer support requests in one place.', 'https://affiliatepartner.freshdesk.com/free-trial', null, false, 160),

-- Personal
('PrivateMail', 'Personal', 'A secure email option that''s better than a free email account — encrypted, ad-free, and no data mining of your messages.', 'https://privatemail.com/members/aff.php?aff=154', null, true, 10),
('NordVPN', 'Personal', 'Encrypt your connection on any network — a discounted VPN subscription to keep your browsing and data private.', 'https://go.nordvpn.net/SH3Zf', null, false, 20),

-- Health & Beauty
('Groomie Head & Body Trimmer', 'Health & Beauty', 'An at-home head and body trimmer with a member discount.', 'https://www.groomie.club/DAVID15941', '10% off with this link', false, 10),
('BulkSupplements', 'Health & Beauty', 'Discounted bulk vitamins and supplements, with a built-in checkout discount.', 'https://shareasale.com/r.cfm?b=602574&u=1690228&m=53326&urllink=&afftrack=', null, true, 20),
('PureBulk Vitamins', 'Health & Beauty', 'Member pricing on vitamins and raw supplement ingredients.', 'https://purebulk.com/?sca_ref=1318730.ijV90hfZYp&sca_source=memberperkclub', null, false, 30),
('Fire Cider (Elderberry Source)', 'Health & Beauty', 'A traditional apple cider vinegar and elderberry wellness tonic.', 'https://elderberrysource.com/clubmembers', null, false, 40),
('Hardworking Gentleman', 'Health & Beauty', 'Grooming products for hair and skin, made for people who work with their hands.', 'https://www.hardworkinggentlemen.com?sca_ref=4479815.vJzFUdcOTm&sca_source=memberperkclub', 'CLUB15 — 15% off', false, 50),
('High Level Science', 'Health & Beauty', 'Medical-grade supplement formulas: heart health, hormone/urinary tract support for women, and a testosterone formula for men. These statements have not been evaluated by the FDA; this product is not intended to diagnose, treat, cure, or prevent any disease.', 'https://livehighlevel.com/servicelocatorpro', null, false, 60),

-- Financial
('MyScoreIQ — FICO Score', 'Financial', 'Unlock your FICO score for $1 — see your score and credit report, with ongoing monitoring and alerts.', 'https://member.myscoreiq.com/get-fico-preferred.aspx?offercode=432135K3', null, true, 10),
('CreditScoreIQ — DIY Credit Repair', 'Financial', 'A do-it-yourself credit repair service to help dispute errors on your credit report.', 'https://creditscoreiq.com', null, false, 20),
('IdentityIQ — Identity Monitoring', 'Financial', 'Identity monitoring and alerts to catch identity theft early.', 'https://www.identityiq.com/sc-securemax.aspx?offercode=431283IX', null, false, 30),
('Ally Bank', 'Financial', 'Easy to open and use an Ally Bank Checking or Savings account, with modern features like Zelle transfers and a debit card.', 'https://ally.com/referral?code=9H5N9G7C3B&CP=WebAppReferFriend', null, false, 40),

-- Home & Auto
('Home Warranty', 'Home & Auto', 'A home warranty plan covering major systems and appliances, with $50 off.', 'https://www.anrdoezrs.net/click-9121627-13073571', '$50 off', true, 10),
('Pet Medications', 'Home & Auto', 'Discounted pet medications shipped to your door, up to 25% off.', 'https://www.dpbolvw.net/click-9121627-12521727', null, false, 20),
('Tire Rack', 'Home & Auto', 'Member pricing on tires, with expert reviews and ratings to help you choose.', 'https://www.kqzyfj.com/click-9121627-14310855', null, false, 30)
on conflict do nothing;

insert into articles (slug, title, summary, category, printable) values
('winterize-your-home', 'How to Winterize Your Home', 'A room-by-room checklist to get your home ready for cold weather and avoid costly winter damage.', 'Home', false),
('reduce-air-conditioning-bill', 'Tips for Reducing Your Air Conditioning Bill', 'Simple habits and small fixes that lower your cooling costs without sacrificing comfort.', 'Home', false),
('air-filter-change-schedule', 'Air Filter Change Schedule', 'A printable seasonal schedule so you never forget when to swap your HVAC filter.', 'Printable', true),
('home-maintenance-checklist', 'Home Maintenance Checklist', 'A printable checklist covering smoke detectors, CO detectors, and the small jobs that prevent big repairs.', 'Printable', true),
('maintain-your-lawn-through-the-seasons', 'How to Maintain Your Lawn Through the Seasons', 'What your lawn needs in spring, summer, fall, and winter — and what to skip.', 'Home', false),
('air-quality-voc-filter-worth-it', 'Is an Air Quality / VOC Filter Worth It?', 'What VOC filters actually do, who benefits most, and how to decide if one is worth the cost.', 'Home', false),
('low-maintenance-indoor-gardening', 'Low-Maintenance Indoor Gardening (No Yard Required)', 'Easy houseplants and a simple care routine for apartments, condos, and busy schedules.', 'Home', false),
('budget-to-save-for-a-home', 'How to Make a Budget to Save for a Home', 'A step-by-step budgeting method to build a down payment without feeling deprived.', 'Budgeting', false),
('family-budget', 'How to Make a Family Budget', 'A practical framework for budgeting as a household, including kids'' expenses and shared goals.', 'Budgeting', false),
('self-improvement-worksheet', 'Self-Improvement Worksheet', 'A printable worksheet to set and track personal goals one quarter at a time.', 'Printable', true),
('emergency-fund-builder', 'Emergency Fund Builder Worksheet', 'A printable worksheet that breaks a 3-to-6-month emergency fund into small, doable steps.', 'Printable', true)
on conflict do nothing;
