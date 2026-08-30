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
variables are non-empty, and this project has already been burned by exactly
that. As of 2026-08-29 the live Stripe account contained no products, prices or
webhook endpoints at all, yet health reported `annualPrice: true` and
`webhookSecret: true`. Real objects now exist (see below), but the two Vercel
variables still hold the old placeholder values until they are replaced.

Database is built: `supabase/setup.sql` ran successfully (9 tables, 17 policies,
31 perks, 11 articles).

## THE IMMEDIATE TASK — Stripe objects created; env vars are now the only blocker

**Done in Stripe (live mode, account `acct_1U9vffGxZ5qOKVch` "MemberPerkClub") on 2026-08-29:**

- Product `MemberPerkClub Membership` -> `prod_VAHHxcE7s0DHDl`
- Price **`price_1U9wizGxZ5qOKVchp7gjQgbJ`** — verified `active`, USD `14900`,
  `recurring.interval: year`, `livemode: true`
- Webhook endpoint -> `we_1U9wjKGxZ5qOKVchJ7LtthFl` at
  `https://memberperkclub.com/api/stripe/webhook`, status `enabled`, subscribed
  to exactly the four events the handler switches on.

**Critical finding:** before this work the account had **zero products, zero
prices and zero webhook endpoints** in live mode. So the `STRIPE_PRICE_ANNUAL`
and `STRIPE_WEBHOOK_SECRET` values already sitting in Vercel were placeholders
or test-mode ids — `/api/health` reported both as present the whole time. Both
MUST be overwritten; neither could ever have worked.

No $12 price was created, and that is now a settled decision: the rate is not
expected to move, so it stays inline as `PRODUCER_ENROLLMENT_FEE_CENTS = 1200`
in `lib/stripe.ts`. Do not add `STRIPE_PRICE_PRODUCER`. See punchlist item 9 for
the bulk tier that *will* eventually need its own handling.

### REMAINING — the user sets these in Vercel, then redeploys

```
STRIPE_PRICE_ANNUAL   = price_1U9wizGxZ5qOKVchp7gjQgbJ
STRIPE_WEBHOOK_SECRET = whsec_KvYSeLXzSysfGd65z24WtRxutnZ5IY8a
```

Vercel -> Settings -> Environment Variables, applied to Production, Preview and
Development. **Then redeploy** — env changes never reach an existing build.
The webhook signing secret is shown by Stripe only at creation time; if it is
lost, roll it on the endpoint rather than hunting for it.

Note `/api/stripe/checkout` swallows Stripe errors into a generic 500, so a bad
price id surfaces to visitors as "Unable to start checkout" and is visible only
in Vercel runtime logs. Verify by running one real checkout after the redeploy.

### Vercel env-var gotchas already hit on this project

- **`NEXT_PUBLIC_*` variables must be typed "Config", not Sensitive/Secret.**
  Next.js inlines them at build time; the protected type blocks that read and the
  value silently arrives empty — the build still succeeds. Vercel does not allow
  changing a variable's type after creation, so it must be deleted and re-added.
- Sensitive values cannot be read back (`vercel env pull` returns them blank), so
  a secret can only be verified by a real functional test, never by inspection.
- `/api/health` reports which variables are **present**, not whether they are
  valid. A leftover `price_REPLACE_ME` reads as present and is worse than an
  empty value: the friendly "checkout isn't configured yet" path only triggers on
  an *empty* string, so a placeholder throws a raw Stripe error at visitors.

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
9. **Bulk producer tier — planned, not built.** A flat **$295 for up to 500
   enrollments**, alongside the existing $12-per-membership rate. Nothing exists
   for this yet: no Stripe object, no code path, no UI. Open design questions to
   settle before building — is $295 a single up-front charge for a block of 500
   seats, or a cap that a producer grows into? What happens at seat 501? Does an
   unused balance expire or roll over? Like the $12 rate it is producer-facing
   wholesale, so it must never surface as a consumer pricing option. Because this
   is a second rate, the earlier reasoning against `STRIPE_PRICE_PRODUCER` weakens
   — revisit whether both tiers should become real Stripe Prices when this is
   built.
10. **Stripe branding assets are generated but not uploaded.** PNGs live in
   `public/brand/` (see below). The user uploads them in the Stripe Dashboard —
   Settings -> Business -> Branding. There is no API path for this on a
   non-Connect account.

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

## Brand assets

Generated from the canonical spec, not redrawn: the `i-spark` polygon from
`components/IconSprite.tsx` on the `.mark` gradient from `app/globals.css`
(`linear-gradient(145deg, #A97BFF, #6733CC)`), wordmark in system-ui Semibold to
match `.logo`'s `font-weight: 600`.

| File | Size | Use |
|---|---|---|
| `public/brand/stripe-icon-512.png` | 512x512 | Stripe **Icon**. Full-bleed square on purpose so Stripe's own rounding/cropping cannot clip a pre-rounded corner. |
| `public/brand/stripe-logo-wordmark.png` | 1539x256, transparent | Stripe **Logo** (invoices, receipts, hosted Checkout). |
| `public/brand/mark-rounded-512.png` | 512x512 | The header mark as a standalone raster — favicons, social, app icons. |

Regenerate with `python3` from the script kept alongside this work; the shapes
are derived from source, so if the sprite or the gradient changes, regenerate
rather than hand-editing the PNGs.
