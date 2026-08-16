# MemberPerkClub.com — Phase 1 Handoff

Paid membership savings club. Two membership paths, no free consumer tier.

> **Positioning — read this first.** MemberPerkClub is **not a plastic card** and must never
> be presented as one. No card renders, embossed-card graphics, or chip icons anywhere; copy
> says "membership", "become a member", "member benefits", "memberships given". Member numbers
> display as `Member no. 000482` — the DB stores `MPC-000482`, and `memberNumberDigits()` /
> `memberNumberLabel()` in `lib/membership.ts` strip the prefix for every UI surface. The word
> "card" is permitted only in the brand name itself and in payment contexts, where the copy
> still prefers "payment method".
>
> It is also **a savings club, not an insurance product** — stated on `/join`, the homepage
> pricing section, and Terms §1.

1. **Retail** — $149/yr Stripe subscription, auto-renews, member manages own billing via Stripe
   Customer Portal, member CAN see what they paid. Free cancellation within 7 days of signup, no
   refund after that.
2. **Producer-enrolled** — a free "producer"/agent account adds a payment method once, then
   enrolls clients for a one-time, non-refundable $12 (PaymentIntent off the saved payment
   method, NOT a subscription). Fixed 1-year term, does NOT auto-renew, no commission ever paid
   to producers. The enrolled member cannot see what was paid and cannot cancel it themselves —
   their account settings only allow changing email/password.

**The producer-provided path is never shown as a consumer pricing option.** Public pages advertise
exactly one price: $149/year retail, with auto-renew and the 7-day cancellation terms. The
producer relationship surfaces only *after login*, in `app/dashboard/page.tsx`, as a soft violet
band reading "Your membership is provided by **<business name>**" (looked up from
`producers.business_name` at runtime). `/producers` remains public — it is the producer-facing
explanation of the wholesale program, not a consumer price.

## Tech stack

- Next.js 16 (App Router, TypeScript), Tailwind CSS 4 (CSS-based `@theme`, no `tailwind.config.js`)
- Supabase (Postgres + Auth: email/password + magic link, RLS)
- Stripe (Checkout subscriptions for retail, SetupIntent + PaymentIntent for producer/client)
- SMTP2GO (transactional email via HTTPS API)
- `zod` for form/schema validation

### Theme — light only, violet accent

**There is no dark mode and no dark CSS.** The user reviewed a dark rendering, found the purple
too dark to read, and explicitly chose the white-ground-with-violet version. `app/globals.css`
defines the complete palette once on bare `:root`, and `body` carries an explicit background.
Do **not** add a `prefers-color-scheme` block, a `[data-theme]` block, an appearance switch, or a
pre-paint theme script. (The only `prefers-color-scheme` string reachable from the page is inside
Next.js's own built-in error-page styling — the compiled `globals.css` contains zero.)

Because there is no pre-paint script mutating `<html>`, nothing needs `suppressHydrationWarning`.
Saved accessibility preferences (text scale, high contrast) are read *and applied* in
`AccessibilityToggle`'s mount effect, which keeps server and client markup identical.

- **Violet** is the only primary accent — buttons, links, active tabs, focus rings, meters, badges.
- **Ember appears in exactly ONE place site-wide:** the number inside the hero stat chip
  (`.statchip b`). Nothing clickable is ever ember — the user specifically rejected orange on the
  "Get deal" and "Copy code" actions. Those use `.btn-deal` (solid `--violet-2`) and `.btn-code`
  (`--violet-wash` on a `#DCCEFB` border, swapping to the green `--good` palette with a checkmark
  and the word "Copied" for 1.8s on success). The discount code itself is no longer a button — it
  sits beside one in a neutral `.codechip`.
- **`--danger` / `--danger-wash`** are additions beyond the supplied token set, because form
  errors need a signal distinct from both violet and the reserved ember.
- Type: serif display (`"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`) for
  headings, `system-ui` for body, `ui-monospace` for member numbers and eyebrow labels.
- Motion is deliberately restrained: one staggered fade-up of the hero tiles (`.rise`) and a
  single one-second fill of the days-left meter. No scroll-triggered reveals, no counting-up
  numbers, no parallax. `prefers-reduced-motion` disables all of it.

### Icon system — no emoji anywhere

`components/IconSprite.tsx` holds the complete 24-symbol custom SVG sprite from the design
sample, rendered once in the root layout; `components/Icon.tsx` is the `<Icon name="…" />`
wrapper emitting `<svg class="ic"><use href="#i-…"/></svg>`.

> **Do not refactor the per-symbol presentation attributes into CSS classes.** Each `<symbol>`
> carries `fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
> stroke-linejoin="round"`, with accent shapes overriding via `fill="currentColor" opacity=".16"
> stroke="none"`. CSS selectors do not cross the `<use>` shadow boundary — moving this styling
> into CSS makes every icon render as a solid black blob.

`i-spark` reversed out white inside the violet `.mark` gradient is the brand mark. The codebase
contains **zero emoji** — verified by a codepoint sweep. Printable checklists use a drawn
`.checkbox` element rather than a ballot-box glyph so they print reliably.

## What's done (Phase 1 — foundation)

- **Scaffold**: `create-next-app` (TS, Tailwind, App Router, ESLint). No git repo was
  initialized/pushed — per instructions, `.git` was removed after scaffolding.
- **Theme & layout**: `app/globals.css`, `app/layout.tsx`, `components/Header.tsx` (hides Join/
  Sign Up and shows a single Dashboard button once signed in, includes `OmniSearch`),
  `components/Footer.tsx`, `components/MobileNav.tsx`, `components/AccessibilityToggle.tsx`
  (copied from the `groomerinsurance` reference pattern per `websites/CLAUDE.md`, restyled gold).
- **Supabase schema**: `supabase/schema.sql` — `profiles` (role, member_number, membership_status,
  comp_until, billing_source, plan, current_period_end, producer_id FK, enrolled_at/expires_at for
  the producer path), `producers` (**business_name** (required), **address_line1**,
  **address_line2**, **city**, **state**, **postal_code**, plus billing_mode
  `per_client`|`flat_monthly` and monthly_quota — future-proofed for the flat-monthly plan, NOT
  wired up), `member_events`, `resources`,
  `resource_clicks`, `articles`, `email_log`, `stripe_events`, the `member_access`/`has_access`
  view, RLS policies, and a collision-safe `MPC-000001` member-number sequence + trigger.
  `supabase/seed.sql` loads the perks directory (from
  `websites/_reference/non-insurance-affiliate-links.md`, FitAminos excluded) and the article
  metadata rows.
- **`/producers` — the wholesale-to-retail explainer.** This is the most important content page
  for the business model, and producers misread the model without it. Headline: "Buy at
  wholesale. Sell at your price. Keep the difference." It frames the product as a non-insurance
  add-on the producer resells under their own agency: we bill the $12 wholesale rate, they are the
  retail seller and set the client price. `components/MarginCalculator.tsx` renders the two-box
  `.flow` plus a 0–149 slider (default 49) that live-updates the retail figure and the large "You
  keep" number, swapping the explanatory sentence across three states — above $12 (margin is
  theirs, which is why no commission exists), exactly $12 (passing through at cost), and below $12
  (shows the absorbed amount and notes many producers do this to win or keep a policy). Math
  mirrors the sample's `sync()` and was verified at 0 / 5 / 12 / 49 / 149. It degrades gracefully:
  the server renders the default $49 state as real markup, so only the drag needs JS.
- **Vocabulary**: user-facing copy says **"producers"**, never "agents" — navigation, headings,
  the portal title ("Producer portal"), and body text. Internal identifiers, DB columns
  (`producers`, `producer_id`), and route paths deliberately keep their existing names.
- **Public marketing pages**: `/`, `/join`, `/producers`, `/producer-signup`, `/about`, `/faq`,
  `/contact` (+ `/api/contact`, honeypot + rate limiting; Turnstile is NOT wired — see Pending),
  `/terms`, `/privacy`, `/disclaimer` — real MemberPerkClub-specific copy filled into the
  `websites/_reference` templates, not lorem ipsum. **Flag for counsel review before launch**,
  especially the retail/producer membership clauses in `/terms` §2, the arbitration/venue
  placeholder, and the CCPA section in `/privacy`.
- **Auth**: `/login` supports both password login and "log in with a link" (magic link), and the
  magic-link flow doubles as the password-reset/recovery mechanism per spec. `/auth/callback`
  exchanges the code; `/post-login` routes by role (admin → `/admin`, producer →
  `/producer/dashboard`, member → `/dashboard`).
- **Retail join flow**: `/join` creates a bare Supabase auth account client-side, then calls
  `/api/stripe/checkout` to start a Checkout subscription session against `STRIPE_PRICE_ANNUAL`.
  `/api/stripe/webhook` handles `checkout.session.completed` (activates membership, sends welcome
  email), `customer.subscription.updated/deleted`, `invoice.payment_failed`, with `stripe_events`
  idempotency. `/api/stripe/portal` redirects into the Stripe Customer Portal.
- **Producer flow**: `/producer-signup` (free account, collects first name, last name,
  **business name**, email, phone, and a **full mailing address** — street, line 2, city, state,
  ZIP; phone auto-formats to `xxx-xxx-xxxx` with the leading-`1` strip + inline notice, ZIP is
  5 numeric digits, state is a select; sends the back-end-only admin notification email, which
  now includes business name, full address, and phone alongside name/email/state) → `/producer/payment-method` (Stripe Elements
  SetupIntent to save a card) → `/producer/dashboard` (lists enrolled clients: name, member #,
  status, expiration) → `/producer/enroll` (one-time $12 off-session PaymentIntent, creates the
  member account, 1-year `expires_at`, sends welcome email).
- **Member dashboard**: `/dashboard` (welcome header, status badge + days-left via
  `lib/membership.ts`, "what's new" row), `/dashboard/perks` (hardcoded Travel cards — Hotel Room
  Discounters + Venture Ashore — plus the category-based resources directory seeded from the
  affiliate-links reference file, `AffiliateDisclosure` next to every grid per the compliance
  note), `/dashboard/articles` + `/dashboard/articles/[slug]` (11-article library in
  `content/articles/index.tsx`; 5 fully written — winterizing, AC bill, air filter schedule,
  home maintenance checklist, emergency fund builder — the rest are stubbed per spec; printables
  use `components/PrintButton.tsx` + `@media print` CSS, not literal PDFs), `/dashboard/billing`
  (retail only — producer-enrolled members are redirected server-side), `/dashboard/settings`
  (email/password only, same page for both membership types).
- **Admin panel**: `/admin` (counts + recent signups), `/admin/members` (search/filter),
  `/admin/members/[id]` (status/free-days/admin-note/grant-admin/cancel actions +
  `member_events` timeline), `/admin/members/new` (comp member creation, temp-password or
  set-password-link welcome flow, plus an optional **"Credit to a producer"** select —
  picking one sets `plan='producer_enrolled'` + `producer_id` so the member gets the
  provided-by band, no visible price and no self-cancel, while `billing_source` stays
  `comp` so the producer is *not* charged the $12 wholesale rate; the `member_events`
  row records `producerId` and `billed:false`), `/admin/producers`, `/admin/resources` + `/admin/articles`
  (CRUD), `/admin/audit` (site-wide log). All gated by `requireAdmin()` (`lib/access.ts`),
  `noindex`/robots-blocked via `app/admin/layout.tsx` metadata and `app/robots.ts`.
- **Email**: `lib/emails.ts` — welcome (temp password OR set-password link), producer-signup
  admin notice, contact-form notice — all sent via `lib/smtp2go.ts` (SMTP2GO HTTPS API, stubbed
  behind `SMTP2GO_API_KEY`/`EMAIL_FROM`, logs a warning and no-ops if unset rather than throwing).
- **`npm run build` passes** with no errors (TypeScript clean; see Deferred below re: ESLint).

## Punchlist (in priority order)

**1. Connect Supabase — TOP PRIORITY, blocks everything behind the login.**
Create the project, run `supabase/schema.sql` then `supabase/seed.sql`, and set
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
in Vercel. Until then the public marketing pages render fine (verified) but nobody can
sign up, log in, or reach the dashboard, producer portal, or admin panel.
Then promote yourself: run the commented `update profiles set role = 'admin' where
email = '...'` at the bottom of `schema.sql` after your first signup.

**2. Sendy — producer/agent marketing list.** A second, separate Sendy list and sending
identity for marketing *to* producers and agents (people who would resell the service),
kept apart from the member list below. Send it from a bulk subdomain so campaign
complaints can't damage transactional deliverability. Not yet created.

**3. Affiliate links crediting the wrong property.** Five seeded perk URLs still carry
ServiceLocatorPro's partner slug (CallRail, SimpleTexting, QuickBooks, Freshsales, High
Level Science). No branding leaks, but commissions may credit the wrong site. Pull
MemberPerkClub-specific links from each merchant dashboard before launch.

**4. Counsel review** of `/terms`, `/privacy`, `/disclaimer` — especially the
governing-law/venue placeholder in Terms §10, the two-membership-path clauses, and
`NEXT_PUBLIC_SITE_LEGAL_ENTITY` (must name the entity that actually exists).

**5. Remaining Stripe keys** (secret/publishable/webhook secret/price id). The webhook
secret can only be created after the first deploy, since Stripe needs the endpoint URL
to exist. Checkout returns a clean "not configured yet" message until `STRIPE_PRICE_ANNUAL`
is real.

**6. Dedicated producer signup page + first-sale kit** — split-screen signup with the
margin calculator alongside the form, and a flyer / sample email copy / "what should I
charge?" guide so a new producer can sell the day after signing up.

**7. Six of eleven articles are still stubs.**

**Dropped by decision:** Turnstile. The contact form keeps its honeypot and IP
rate-limiting; no CAPTCHA will be added.

## Email &amp; Sendy

- **Single mailbox**: `club@memberperkclub.com` handles everything. Point `EMAIL_FROM`,
  `ADMIN_NOTIFY_EMAIL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, and `NEXT_PUBLIC_PRIVACY_EMAIL` at
  it. Additional addresses should be aliases into that one mailbox, never separate
  accounts.
- **Sendy brand**: `Member Perk Club`.
- **Member welcome list ID**: `1QPsrUh892R9dNEZBaFGK2cg` — members only.
- **Unsubscribe redirect**: set that list's unsubscribe URL in Sendy to
  `https://memberperkclub.com/unsubscribed`. The page confirms removal, states plainly
  that the membership is still active and that new benefits are announced on the
  dashboard instead, and explains that account email (welcome, password reset, receipts,
  renewal) still sends because it isn't marketing. `noindex` + robots-blocked.
- **Transactional vs bulk**: transactional mail goes through SMTP2GO on the root domain.
  Sendy campaigns should send from a bulk subdomain with their own SPF/DKIM, with
  Reply-To pointing back at `club@` so replies land in the one mailbox.
- **Counsel review**: `/terms`, `/privacy`, `/disclaimer` need a lawyer's pass, especially the
  governing-law/venue placeholder in Terms §10 and the two-membership-path clauses.
- **Future flat-monthly producer plan**: `producers.billing_mode` (`per_client`|`flat_monthly`)
  and `producers.monthly_quota` exist in the schema per spec, but no Stripe subscription or
  quota-enforcement logic is wired — intentionally deferred.
- **ESLint**: `npm run build` type-checks clean, but a separate `npm run lint` pass surfaces
  `react/no-unescaped-entities` warnings (straight quotes/apostrophes in JSX text — cosmetic,
  not build-blocking) plus one `react-hooks/set-state-in-effect` note in
  `AccessibilityToggle.tsx` (matches the portfolio's reference implementation). Worth a cleanup
  pass before launch but doesn't block anything in Phase 1.
- **Affiliate link ownership**: five seeded perk URLs still carry another portfolio site's
  partner slug (`.../servicelocatorpro`, `.../servicelocator`) baked in by the merchant — these
  are functional payout identifiers, not display copy, and no third-party agency name appears
  anywhere on the site. Per `_reference/non-insurance-affiliate-links.md`, **get
  MemberPerkClub-specific partner links from each merchant's dashboard before launch** or the
  commissions may credit the wrong property. The tracking source params we control were
  switched to `memberperkclub`.
- **Remaining 6 articles**: `maintain-your-lawn-through-the-seasons`,
  `air-quality-voc-filter-worth-it`, `low-maintenance-indoor-gardening`,
  `budget-to-save-for-a-home`, `family-budget`, `self-improvement-worksheet` are stubbed with a
  short bullet list — expand to full articles before launch.
- **OG image**: `app/layout.tsx` references `/og-image.jpg`, which doesn't exist yet.
- **GA4 / analytics**: not wired in this pass (other portfolio sites use a `NEXT_PUBLIC_GA_ID`
  pattern in `layout.tsx` — add the same here when ready).

## Open item: brand rename away from "Card"

The user intends to rename the brand **and domain** away from "Card" entirely. Nothing has been
renamed yet — but the build was prepared for it:

- `lib/siteConfig.ts` is the single source of truth (`SITE.name`, `SITE.domain`, `SITE.url`,
  `SITE.legalEntity`, `SITE.supportEmail`, `SITE.privacyEmail`), each overridable by an env var
  (`NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_DOMAIN`, …).
- Every user-facing brand mention — header, footer, layout metadata, home, `/join`, `/producers`,
  `/faq`, `/about`, and the legal pages — resolves through `SITE`, so the rename is a one-line
  change (or one env var) rather than a 40-file sweep. **Do not hardcode the brand name in new
  components; import `SITE`.**
- Still hardcoded and needing a pass at rename time: the `metadataBase`/canonical domain if not
  set via env, `app/robots.ts` and `app/sitemap.ts` (absolute URLs), `lib/emails.ts` (the sender
  address default and email chrome), the `supabase/` member-number prefix `MPC-` (internal only —
  never displayed), and the repo/directory name itself.

## Environment variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server only, never exposed to the client

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ANNUAL=                  # Price id for the $149/yr retail subscription

# SMTP2GO
SMTP2GO_API_KEY=
EMAIL_FROM=members@memberperkclub.com # on-theme sender — not hello@
ADMIN_NOTIFY_EMAIL=                   # back-end only, never shown on any page

# Site / brand (see "Open item: brand rename" above)
NEXT_PUBLIC_SITE_URL=https://memberperkclub.com
NEXT_PUBLIC_SITE_NAME=MemberPerkClub
NEXT_PUBLIC_SITE_DOMAIN=memberperkclub.com
NEXT_PUBLIC_SITE_LEGAL_ENTITY=MemberPerkClub, LLC
```

Copy `.env.local.example` to `.env.local` and fill in real values.

## Setup order for a fresh Supabase project

1. Create the Supabase project, copy URL/anon/service-role keys into `.env.local`.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql`.
4. Sign up once through `/join` or `/producer-signup` (or create yourself via `/admin/members/new`
   once you have another admin), then promote yourself: `update profiles set role='admin' where
   email='you@...';`
5. Add Stripe keys + create the `$149/yr` recurring Price in Stripe, set `STRIPE_PRICE_ANNUAL`.
6. Add a Stripe webhook endpoint pointing at `/api/stripe/webhook` for
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_failed`; copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
7. Add SMTP2GO API key + verify the sending domain's SPF/DKIM; set `EMAIL_FROM` and
   `ADMIN_NOTIFY_EMAIL`.
