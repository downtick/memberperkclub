// Single source of truth for producer onboarding content. The public
// getting-started page, the producer welcome email and the convention
// prospect email all read from here, so a producer is never told three
// different things. Every statement was checked against the running code on
// 2026-09-20 — if a flow changes, change it HERE and every surface follows.
//
// Deliberately NOT claimed anywhere below:
//   - any dollar savings figure (standing rule: never invent savings)
//   (renewal now exists: /api/producer/renew + daily expiry reminders)
import { SITE } from "@/lib/siteConfig";

const U = SITE.url;

export const GUIDE_URLS = {
  gettingStarted: `${U}/producers/getting-started`,
  signup: `${U}/producer-signup`,
  login: `${U}/login`,
  paymentMethod: `${U}/producer/payment-method`,
  enroll: `${U}/producer/enroll`,
  dashboard: `${U}/producer/dashboard`,
  producersPitch: `${U}/producers`,
} as const;

export type GuideStep = {
  n: number;
  title: string;
  body: string;
  url: string;
  cta: string;
  required?: boolean;
};

export const PRODUCER_STEPS: GuideStep[] = [
  {
    n: 1,
    title: "Create your account",
    body: "Fill in your name, business name, email, phone and business address. Your business name is what your clients see in their member dashboard all year, so use the name they know you by.",
    url: GUIDE_URLS.signup,
    cta: "Create my account",
  },
  {
    n: 2,
    title: "Activate your account",
    body: `We email you a sign-in link from club@memberperkclub.com. Click Sign in and you're in. There's no password to remember — to sign in later, choose "Email me a sign-in link" on the login page. Not there within a couple of minutes? Check spam.`,
    url: GUIDE_URLS.login,
    cta: "Go to the login page",
  },
  {
    n: 3,
    title: "Add a payment method",
    body: "You can't enroll clients until this is done, and you only do it once. Your card is stored securely by Stripe — we never see the number — and it's charged $12 only when you choose to enroll a client, never automatically.",
    url: GUIDE_URLS.paymentMethod,
    cta: "Add a payment method",
    required: true,
  },
  {
    n: 4,
    title: "Enroll your first client",
    body: "Enter your client's name, email, phone and state, then click “Enroll client — charge $12”. Their membership is active immediately, for one year.",
    url: GUIDE_URLS.enroll,
    cta: "Enroll a client",
  },
];

export const WHAT_HAPPENS_NEXT = [
  "You enroll your client",
  "They get a welcome email with their member number",
  "They set their own password",
  "They start using their benefits",
];

// Summaries of the real benefit list (2 travel perks + 31 directory perks as
// seeded). Names categories and examples only — no savings amounts.
export const BENEFIT_HIGHLIGHTS: { title: string; body: string }[] = [
  { title: "Travel", body: "Member rates on hotel rooms and rental cars, plus cruise shore excursions booked directly." },
  { title: "Business services", body: "AI answering service, call tracking, business texting, phone systems, web hosting, QuickBooks, a CRM, virtual assistants, LLC formation and a virtual mailbox." },
  { title: "Money & identity", body: "FICO score access, identity monitoring, DIY credit tools and online banking with Ally Bank." },
  { title: "Home & auto", body: "Home warranty, pet medications and tires." },
  { title: "Health & personal", body: "Supplements and vitamins, grooming, secure private email and a VPN." },
  { title: "Guides library", body: "Practical home, budgeting and wellness guides, including printable checklists." },
];

export const WHY_PRODUCERS: { lead: string; body: string }[] = [
  { lead: "Free to join.", body: "No contract, no monthly fee, no minimum." },
  // Deliberately no "give it away to win a policy": most states regulate
  // rebating/inducements in connection with an insurance sale.
  { lead: "You set the price.", body: "Buy at $12 wholesale and charge your client anything up to the $149 public price. You keep the difference." },
  { lead: "No licensing question.", body: "It's a consumer savings membership, not insurance, so there's no carrier appointment and no coverage to explain." },
  { lead: "Your name, all year.", body: "Every client you enroll sees your agency as the provider each time they sign in." },
  { lead: "Nothing to chase.", body: "One charge per membership. It never auto-renews, so there's no residual billing a year later." },
];

export const PRODUCER_FAQ: { q: string; a: string }[] = [
  { q: "I didn't get my sign-in email.", a: "Check your spam or promotions folder for a message from club@memberperkclub.com. You can request a fresh link any time on the login page — choose “Email me a sign-in link”." },
  { q: "How do I sign in again later?", a: "Go to the login page and choose “Email me a sign-in link”. Producer accounts don't use a password." },
  { q: "Why can't I enroll a client yet?", a: "You need a payment method on file first. Add one on the Payment method page — you only do it once." },
  { q: "My client didn't get their welcome email.", a: "Ask them to check spam first. Then open your producer dashboard and click “Resend welcome” on their row. Each resend includes a fresh link to set their password. You can resend to the same client once every few minutes." },
  { q: "What should I charge my client?", a: "That's entirely your decision — anything from nothing up to the $149 public price. Your clients never see the $12 wholesale rate." },
  { q: "When is my card charged?", a: "Only at the moment you click to enroll a client: $12 per membership. Never automatically and never on a schedule." },
  { q: "Can I change my payment method?", a: "Yes. Add a new card on the Payment method page and it replaces the old one." },
  { q: "Are memberships refundable?", a: "No. Memberships purchased at the wholesale rate are non-refundable and fully earned at the time of purchase." },
  { q: "Does a membership renew?", a: "Not automatically — nothing is ever charged without you choosing to. We email you 30 days and again 7 days before a client's membership ends. To renew, click \u201cRenew\u201d on their row in your dashboard: it's the same $12, and the new year starts when the current one ends, so renewing early never costs your client any days. If you do nothing, their access simply ends on that date." },
  { q: "Can I charge my client for the renewal?", a: "Yes. You're the retail seller, so you decide what — if anything — your client pays to renew, just like the first year. We only ever charge you the $12 wholesale rate." },
  { q: "Can my client cancel?", a: "There's nothing for them to cancel — they were never charged and nothing recurs. They can change their email and password." },
  { q: "Is this insurance?", a: `No. ${SITE.name} is a savings membership, not an insurance product, so there's no carrier appointment or licensing question.` },
];
