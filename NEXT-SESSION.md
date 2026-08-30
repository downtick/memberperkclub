# Start here — MemberPerkClub session handoff

**Read this first, then `HANDOFF.md` for depth.** This file is the current state
and the next actions; `HANDOFF.md` is the full architecture, conventions and
gotchas.

- **Repo**: `github.com/downtick/memberperkclub` (branch `main`, all work pushed)
- **Local**: `websites/memberperkclub`
- **Live**: https://memberperkclub.com — deployed on Vercel, latest build shipped
- **Stack**: Next.js 16 (App Router, TS), Tailwind 4, Supabase (Postgres + Auth,
  RLS), Stripe, SMTP2GO

## What the business is

A paid perks/savings club. **Not insurance, and never presented as a card** — the
word "card" appears only in payment contexts. Two ways to become a member:

1. **Retail** — $149/yr Stripe subscription, auto-renews, 7-day free
   cancellation then non-refundable. Member manages their own billing.
2. **Producer (wholesale)** — insurance agents open a free account, save a
   payment method, and are billed **$12 per membership** as a one-time charge.
   The producer is the retail seller and sets their own client price (free up to
   the $149 public price), keeping the margin. **No commission is ever paid — the
   margin is the compensation.** These memberships do not auto-renew and are
   non-refundable. The enrolled member never sees the price and cannot cancel;
   they can only change email and password.

The producer-provided path is **never** shown as a consumer pricing option.
Public pricing advertises exactly one price: $149/year.

## State as of this handoff

`GET https://memberperkclub.com/api/health` reports every integration present:
Supabase (public + service role), SMTP2GO (key, from, admin notify), and all four
Stripe values. **Presence is not validity** — that endpoint only checks the
variables are non-empty. If `STRIPE_PRICE_ANNUAL` is still `price_REPLACE_ME`,
checkout will fail with a raw Stripe error instead of the friendly
"not configured yet" message, because the friendly path only triggers on an
*empty* value.

Database is built: `supabase/setup.sql` ran successfully (9 tables, 17 policies,
31 perks, 11 articles).

## THE IMMEDIATE TASK — create the Stripe product

The Stripe MCP connector is now connected. Create **one** product:

- **Product**: `MemberPerkClub Membership`
- **Price**: `$149.00 USD`, **recurring, yearly**
- Put the resulting id (starts with `price_`, NOT `prod_`) into
  `STRIPE_PRICE_ANNUAL` in Vercel, then redeploy.

**Do NOT create a $12 price.** The producer wholesale rate is charged as a
PaymentIntent with the amount set inline from `PRODUCER_ENROLLMENT_FEE_CENTS =
1200` in `lib/stripe.ts`. A $12 Price would sit unused and mislead anyone trying
to change the rate later.

*Open question for the user:* they may prefer to move the $12 into Stripe as a
Price + `STRIPE_PRICE_PRODUCER` env var so the wholesale rate can change without
a deploy. Worth it only if the rate is expected to move. Ask before building.

Then confirm the webhook exists at
`https://memberperkclub.com/api/stripe/webhook` subscribed to
`checkout.session.completed`, `customer.subscription.updated`,
`customer.subscription.deleted`, `invoice.payment_failed`, and that
`STRIPE_WEBHOOK_SECRET` holds that endpoint's real `whsec_` secret.

## Punchlist after Stripe

1. **Supabase → Authentication settings** (not yet done, and it silently breaks
   logins): **URL Configuration** — Site URL `https://memberperkclub.com`,
   redirect allow-list `https://memberperkclub.com/**`, `https://*.vercel.app/**`,
   `http://localhost:3000/**`. When a requested redirect is not in the
   allow-list Supabase silently falls back to Site URL, which ships as
   `http://localhost:3000` — that is why magic links landed on localhost.
   **SMTP Settings** — point at SMTP2GO (`mail.smtp2go.com`, port 587, sender
   `club@memberperkclub.com`; credentials come from SMTP2GO → SMTP Users, which
   are NOT the API key). Supabase's built-in mailer is rate-limited to a few per
   hour and is development-only. Then paste the three branded templates from
   `supabase/auth-emails/`.
2. **Promote the first admin**: `update profiles set role = 'admin' where email
   = '...'`. There is no other way into `/admin`.
3. **Adversarial security pass on the live site — do this before real money.**
   Sign in as an ordinary member and actually attempt to: read another member's
   profile row, set your own `role` to `admin`, and read `resources`/`articles`
   without an active membership. The schema shipped with a privilege-escalation
   hole (a profiles self-update policy — RLS cannot restrict columns) and a
   `member_access` view that ran with owner rights and exposed every profile.
   Both were fixed by reading the SQL, **never verified against a database.**
4. **Five affiliate links still credit ServiceLocatorPro** — CallRail,
   SimpleTexting, QuickBooks, Freshsales, High Level Science all carry
   `/servicelocatorpro` partner slugs. No branding leaks, but commissions may pay
   the wrong property. Pull MemberPerkClub-specific links from each merchant.
5. **Counsel review** of `/terms`, `/privacy`, `/disclaimer`, and set
   `NEXT_PUBLIC_SITE_LEGAL_ENTITY` to the entity that actually exists.
6. **Sendy** — brand `Member Perk Club`, member welcome list ID
   `1QPsrUh892R9dNEZBaFGK2cg`, unsubscribe redirect `/unsubscribed` (page built).
   Needed: a member intro email and, separately, a marketing email. A second list
   for marketing *to producers/agents* is planned but not created. Send bulk from
   a subdomain with its own SPF/DKIM so campaign complaints cannot damage the
   transactional reputation. **Decide whether the Sendy member intro duplicates
   the transactional welcome** — two welcomes in one hour trains people to ignore
   the sender.
7. **Dedicated producer signup page + first-sale kit** — split-screen signup with
   the margin calculator beside the form, and a flyer / sample email copy /
   "what should I charge?" guide. Design was agreed in detail; not built.
8. **Six of eleven articles are still stubs.**

**Dropped by decision:** Turnstile. Honeypot + IP rate limiting only. Do not
re-add it.

## Conventions that will bite you

- **No dark mode.** Light only, violet accent. Do not add a
  `prefers-color-scheme` block, a `[data-theme]` block, or a theme switch.
- **Ember/orange appears in exactly one CSS rule site-wide** (`.statchip b`, the
  hero stat number). Nothing clickable is ever ember.
- **Icons**: `components/IconSprite.tsx`. Styling lives in per-`<symbol>`
  presentation attributes — **do not refactor into CSS classes**, selectors do
  not cross the `<use>` shadow boundary and every icon becomes a black blob.
- **No emoji anywhere** in the codebase.
- Say **"producers"**, not "agents", in user-facing copy.
- **Never invent testimonials, reviews, member counts, or savings figures.**
- Sample agency name in any mock data is **"Sunridge Insurance Group"**. Never
  reference Baker, BIB, Stratum, or any other real agency.
- Brand name resolves through `lib/siteConfig.ts` (env-overridable) — never
  hardcode it.
- One mailbox for the whole business: `club@memberperkclub.com`. Anything else
  is an alias, never a second account.
