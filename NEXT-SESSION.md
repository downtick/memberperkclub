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

## State as of this handoff (2026-09-20)

### THE ONE BLOCKER — `STRIPE_SECRET_KEY` is invalid

`GET /api/health?deep=1` returns `keyValid: false`,
`keyErrorType: "StripeAuthenticationError"`. Stripe rejects the credential
outright. This breaks producer card setup, the $12 enrollment, and the $149
checkout. The user must replace it from Stripe -> Developers -> API keys on
account `acct_1U9vffGxZ5qOKVch`, then redeploy.

**Use `?deep=1` from now on.** The plain `/api/health` checks only that a
variable is non-empty, which reported all-green for weeks while the key was
dead. `?deep=1` actually calls Stripe (`balance.retrieve`, then
`prices.retrieve`) and reports `keyValid`, `priceValid`, `priceIsLive`,
`priceIsRecurring`, `priceAmount`. Never trust the shallow endpoint again.

### Done this session

- **Stripe objects created (live)**: product `prod_VAHHxcE7s0DHDl`, price
  `price_1U9wizGxZ5qOKVchp7gjQgbJ` ($149/yr recurring), webhook
  `we_1U9wjKGxZ5qOKVchJ7LtthFl` on the four events the handler switches on.
- **Env vars fixed.** Eight `NEXT_PUBLIC_*` vars had been created as
  *Sensitive*, so Next.js could not inline them and they arrived empty while
  the build still succeeded. All re-added as **Config**. Verified for real by
  downloading the deployed JS chunks and grepping for the Supabase host and
  anon key — both present and exact.
- **Supabase**: redirect allow-list was **completely empty** (the cause of
  magic links landing on localhost) - now 3 entries. Custom SMTP enabled via
  SMTP2GO by the user. All three auth email templates replaced with branded
  versions (larger 17px button, arrow, fallback URL).
- **Member numbers** restart at **1001** with 4-digit padding, so members see
  `1001` and not `001001`. Verified live: the first producer got `MPC-1001`.
- **Two real bugs fixed.** Producer-enrolled members were sent a welcome email
  containing `href="undefined"` because `createUser()` sets no password and no
  set-password link was generated - they had no way into their account. And
  the enroll form let a producer fill in a client's full details before
  revealing no card was on file.
- **New**: `EMAIL_BCC` (silent archive copy of every outbound email),
  producer "your client is enrolled" confirmation email, `logStripeError`
  shared helper so Stripe failures are greppable in logs instead of being
  swallowed into "Unable to ...".

### Test state

One producer exists: `downtick5@gmail.com`, `MPC-1001`, no card on file (blocked
by the Stripe key). **These are test rows.** Delete them and re-run
`alter sequence member_number_seq restart with 1001;` before real members, so
the first real member is 1001.

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

## Punchlist added 2026-09-20 (after the first live producer test)

11. **Sendy producer onboarding list + autoresponder.** Create a Sendy list
    for producers. The producer signup form subscribes each new producer to
    it (server-side, from `/api/producer/signup`), which triggers a Sendy
    autoresponder sequence. Source copy for email 1 already exists:
    `content/emails/producer-onboarding-letter.md` — reuse it. Needs from the
    user: Sendy install URL, API key, and the new list ID.
    - **Known limitation, tell the user again when building:** Sendy
      autoresponders are time-based and cannot see what a producer has
      done, so a "please add a payment method" email will still go to
      producers who already added one. The behaviour-based alternative
      (daily Vercel Cron checking each producer, sending via SMTP2GO) can
      target "no card after 2 days" / "card but no clients after 7 days".
      The user chose Sendy; a hybrid is possible later.
    - **Gotcha:** Sendy `/subscribe` RE-ACTIVATES unsubscribed and bounced
      addresses when it updates custom fields. Check status before
      subscribing, never blindly re-subscribe.
    - Keep Sendy bulk on its own subdomain with its own SPF/DKIM, separate
      from transactional mail (see item 6).
12. **Promote an admin.** Nobody is admin yet; /admin is unreachable.
    User to choose: promote `downtick5@gmail.com` (admins keep producer
    access), or a dedicated admin login created free via /login ->
    "Email me a sign-in link".
13. **SMTP2GO API key: add the Stats permission.** The key is recognised
    (`ENDPOINT_PERMISSION_DENIED` from `/api/health?deep=1`) but lacks Stats,
    which is all the health check uses. Sending is proven only by a real
    send — check `email_log`.
14. **Rotate the SMTP2GO SMTP password** — it was pasted into a chat
    transcript on 2026-09-20.
15. **Supabase key migration.** The project now issues `sb_publishable_` /
    `sb_secret_` keys; the site uses the legacy `anon` / `service_role` JWTs.
    Migrate both, THEN disable legacy keys. Disabling first takes the site
    down instantly.
16. **Preview deploys share live Stripe keys and the production database.**
    Proper fix: Stripe test keys + a second Supabase project scoped to the
    Preview environment. Until then, never test payments on a *.vercel.app URL.
17. **Behaviour-based producer drip** (see item 11 limitation) if Sendy's
    time-based sequence proves too blunt.
18. **Test data cleanup before real members:** delete `downtick5@gmail.com`
    (producer, MPC-1001) and `lantus30@gmail.com` (member, MPC-1002), refund
    the $12 in Stripe, then `alter sequence member_number_seq restart with
    1001;` so the first real member is 1001.

## Convention prospect tool (built 2026-09-20) — setup still needed

Built: `/admin/prospects` (phone-first capture), `/api/admin/prospects`,
`lib/sendy.ts`, prospect email via `buildProspectEmailHtml()` in
`lib/emails.ts`, Sendy check in `/api/health?deep=1`. NOT yet usable:

1. **An admin must exist** — the page is admin-only and nobody is admin.
2. **Sendy**: create list "Producer prospects" under brand Member Perk Club;
   set `SENDY_URL`, `SENDY_API_KEY`, `SENDY_PROSPECT_LIST_ID` in Vercel
   (server-side, Sensitive is fine); redeploy; `?deep=1` must show
   `sendy.listValid: true`.
3. **Autoresponder**: on that list, send immediately after subscription,
   HTML from the admin page's "Copy HTML". Replace `[YOUR NAME]` and the
   mailing-address placeholder first.
4. **Postal address required** (CAN-SPAM) in every commercial email. The
   business currently shows none anywhere.
5. **SES** (Sendy's sender): confirm memberperkclub.com is verified with
   SPF/DKIM and that the daily sending quota covers 1,000–2,000/week.
6. Test end to end on a phone before the event, including Unsubscribe.

## Product gaps found 2026-09-20

19. **No renewal path for producer-enrolled members.** The enroll route
    rejects any email that already exists (409), so after a client's year
    ends the producer cannot renew them. Needs a renew action. The guide and
    FAQ deliberately do not promise renewal until this exists.
20. **Bulk tier copy mismatch.** `/producers` says "a flat MONTHLY plan …
    up to 500 new memberships a month"; the user described a flat $295 for
    up to 500. Reconcile before building item 9.
