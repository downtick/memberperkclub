import { sendEmail, adminNotifyAddress } from "./smtp2go";
import {
  GUIDE_URLS,
  PRODUCER_STEPS,
  WHAT_HAPPENS_NEXT,
  BENEFIT_HIGHLIGHTS,
  WHY_PRODUCERS,
  type GuideStep,
} from "./producerGuide";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://memberperkclub.com";
// Literal hex only — email clients do not resolve CSS custom properties.
const VIOLET = "#6733CC";
const INK = "#1F1730";

function wrap(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="font-family:Arial,sans-serif;background:#FBF9FE;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(45,25,85,0.10)">
    <div style="background:linear-gradient(135deg,#2A1F45,#1F1730);padding:28px 32px;border-bottom:3px solid ${VIOLET}">
      <p style="color:${VIOLET};margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700">MemberPerkClub</p>
      <h1 style="color:#fff;margin:8px 0 0;font-size:21px">${title}</h1>
    </div>
    <div style="padding:28px 32px;color:#4C405F;font-size:15px;line-height:1.6">
      ${bodyHtml}
    </div>
    <div style="background:#FBF9FE;padding:16px 32px;font-size:12px;color:#665B7A;border-top:1px solid #E6DEF4">
      MemberPerkClub.com
    </div>
  </div>
</body>
</html>`;
}

// ── Shared producer-guide email blocks ────────────────────────────────────
// Built from lib/producerGuide.ts so the welcome email, the prospect email
// and the public guide page never disagree. Tables and inline styles only:
// that is what Apple Mail, Gmail and Outlook all render the same way.
function esc(v: string): string {
  return (v || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

type EmailStep = GuideStep & { done?: boolean };

function stepsHtml(steps: EmailStep[]): string {
  const arrow = `<tr><td align="center" style="padding:4px 0;font-size:24px;line-height:24px;color:${VIOLET}">&#8595;</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0">${steps
    .map((s, i) => {
      const box = s.required
        ? `border:2px solid ${VIOLET};background:#F3EDFE;`
        : `border:1px solid #E6DEF4;background:#ffffff;`;
      const badge = s.done
        ? `<td width="44" height="44" align="center" valign="middle" style="width:44px;height:44px;border-radius:22px;background:#E6DEF4;color:${VIOLET};font-size:20px;font-weight:700">&#10003;</td>`
        : `<td width="44" height="44" align="center" valign="middle" style="width:44px;height:44px;border-radius:22px;background:${VIOLET};color:#ffffff;font-size:20px;font-weight:700">${s.n}</td>`;
      const flag = s.required
        ? `<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${VIOLET}">&#9733; Required before you can enroll</p>`
        : "";
      const body = s.done
        ? `<p style="margin:0;font-size:14px;color:#665B7A">Done &mdash; you're signed up.</p>`
        : `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4C405F">${s.body}</p>
           <a href="${s.url}" style="display:inline-block;background:${VIOLET};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:9px">${s.cta} &rarr;</a>`;
      return `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${box}border-radius:14px"><tr>
        <td width="62" valign="top" style="padding:20px 0 20px 20px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>${badge}</tr></table></td>
        <td valign="top" style="padding:20px 20px 20px 12px">${flag}
          <p style="margin:0 0 6px;font-size:17px;font-weight:700;color:${INK}">${s.title}</p>${body}</td>
      </tr></table></td></tr>${i < steps.length - 1 ? arrow : ""}`;
    })
    .join("")}</table>`;
}

function whatHappensNextHtml(): string {
  const cells = WHAT_HAPPENS_NEXT.map(
    (t, i) => `<td align="center" valign="top" width="25%" style="padding:0 4px">
      <div style="width:32px;height:32px;line-height:32px;border-radius:16px;border:2px solid ${VIOLET};color:${VIOLET};font-weight:700;font-size:14px;margin:0 auto 8px;background:#ffffff">${i + 1}</div>
      <p style="margin:0;font-size:13px;line-height:1.45;color:#4C405F">${t}</p></td>`
  ).join("");
  return `<p style="margin:24px 0 12px;font-size:17px;font-weight:700;color:${INK}">What happens next</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

function benefitsHtml(heading: string): string {
  const rows = BENEFIT_HIGHLIGHTS.map(
    (b) => `<tr><td style="padding:0 0 10px"><p style="margin:0;font-size:14px;line-height:1.55;color:#4C405F">
      <strong style="color:${INK}">${b.title}:</strong> ${b.body}</p></td></tr>`
  ).join("");
  return `<p style="margin:26px 0 12px;font-size:17px;font-weight:700;color:${INK}">${heading}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EDFE;border-radius:12px">
      <tr><td style="padding:18px 20px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr></table>`;
}

function howItWorksHtml(): string {
  const rows = WHY_PRODUCERS.map(
    (w) => `<p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#4C405F">&#10003;&nbsp; <strong style="color:${INK}">${w.lead}</strong> ${w.body}</p>`
  ).join("");
  return `<p style="margin:26px 0 12px;font-size:17px;font-weight:700;color:${INK}">Why producers use it</p>${rows}`;
}

// ── 1. New-member welcome (temp password OR set-password link) ────────────
export async function sendWelcomeEmail(opts: {
  to: string;
  firstName: string;
  memberNumber: string;
  tempPassword?: string;
  setPasswordLink?: string;
}) {
  const { to, firstName, memberNumber, tempPassword, setPasswordLink } = opts;
  // Members never see the internal MPC- prefix — this is a membership, not a card.
  const memberDigits = (memberNumber || "").replace(/^MPC-/i, "");

  // Three cases. The third is load-bearing: with neither a password nor a
  // link, the old two-branch version emitted href="undefined" and the member
  // had no way in at all. Fall back to the self-serve reset instead.
  const credentialsHtml = tempPassword
    ? `<p>Your login is <strong>${to}</strong> and your temporary password is <strong>${tempPassword}</strong>. Please change it after you sign in.</p>
       <p><a href="${SITE_URL}/login" style="color:${VIOLET};font-weight:700">Log in to your account &rarr;</a></p>`
    : setPasswordLink
      ? `<p>Click below to set your password and activate your account:</p>
         <p><a href="${setPasswordLink}" style="color:${VIOLET};font-weight:700">Set your password &rarr;</a></p>
         <p style="color:#665B7A;font-size:13px">This link expires in 72 hours.</p>`
      : `<p>To get in, go to the login page and choose <strong>Email me a sign-in link</strong>. Your login is <strong>${to}</strong> &mdash; no password needed.</p>
         <p><a href="${SITE_URL}/login" style="color:${VIOLET};font-weight:700">Go to the login page &rarr;</a></p>`;

  const html = wrap(
    "Welcome to MemberPerkClub",
    `<p>Hi ${firstName || "there"},</p>
     <p>Your membership is active. Your member number is <strong>Member no. ${memberDigits}</strong>.</p>
     ${credentialsHtml}
     <h3 style="color:${INK};font-size:16px;margin-top:24px">Where to find things</h3>
     <ul style="padding-left:20px;color:#4C405F">
       <li><strong>Overview</strong> — your membership status and what's new</li>
       <li><strong>Benefits</strong> — travel rates, service deals, and business tools you can start using today</li>
       <li><strong>Guides</strong> — home, budgeting, and wellness articles, including printable checklists</li>
     </ul>
     <p>Questions? Just reply to this email or visit our <a href="${SITE_URL}/contact" style="color:${VIOLET}">contact page</a>.</p>`
  );
  const text = `Welcome to MemberPerkClub\n\nYour member number is ${memberDigits}.\n${
    tempPassword
      ? `Login: ${to} / Temp password: ${tempPassword} — please change it after signing in.`
      : setPasswordLink
        ? `Set your password: ${setPasswordLink}`
        : `Sign in at ${SITE_URL}/login and choose "Email me a sign-in link".`
  }\n\nLog in at ${SITE_URL}/login`;

  const result = await sendEmail({ to, subject: "Welcome to MemberPerkClub", html, text });
  return result;
}

// ── 2. Producer-signup admin notification (back-end only) ─────────────────
export async function sendProducerSignupAdminNotice(opts: {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  memberNumber?: string;
  referrer?: string;
  pageUrl?: string;
}) {
  const o = opts;
  const sections: Section[] = [
    { title: "Producer", rows: [
      ["Business", o.businessName],
      ["Contact", `${o.firstName} ${o.lastName}`],
      ["Email", o.email],
      ["Phone", o.phone],
      ["Member no.", digits(o.memberNumber)],
    ]},
    { title: "Business address", rows: [
      ["Street", o.addressLine1],
      ["Line 2", o.addressLine2 || "—"],
      ["City", o.city],
      ["State", o.state],
      ["ZIP", o.postalCode],
    ]},
    { title: "Account", rows: [
      ["Signed up", nowPT()],
      ["Payment method", "Not added yet"],
      ["Admin", `${SITE_URL}/admin/producers`],
    ]},
    trackingSection(o.referrer, o.pageUrl),
  ];
  return sendAdminNotice(`New producer: ${o.businessName}`, "New producer sign-up", sections);
}
// ── 3. Contact-form notification ────────────────────────────────────────
export async function sendContactNotice(opts: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  message: string;
  referrer?: string;
  pageUrl?: string;
}) {
  const { firstName, lastName, email, phone, state, message, referrer, pageUrl } = opts;
  const html = wrap(
    "New Contact Form Submission",
    `<table style="width:100%;border-collapse:collapse;font-size:14px">
       <tr><td style="padding:6px 0;font-weight:700;width:120px">Name</td><td>${firstName} ${lastName}</td></tr>
       <tr><td style="padding:6px 0;font-weight:700">Email</td><td>${email}</td></tr>
       <tr><td style="padding:6px 0;font-weight:700">Phone</td><td>${phone}</td></tr>
       <tr><td style="padding:6px 0;font-weight:700">State</td><td>${state}</td></tr>
     </table>
     <h3 style="color:${INK};font-size:15px;margin-top:20px">Message</h3>
     <p style="white-space:pre-wrap">${message}</p>
     <hr style="border:none;border-top:1px solid #E6DEF4;margin:20px 0" />
     <p style="font-size:12px;color:#665B7A">Referring URL: ${referrer || "(direct)"}<br/>Page: ${pageUrl || "(unknown)"}</p>`
  );
  const text = `New contact form submission\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nState: ${state}\n\nMessage:\n${message}\n\nReferring URL: ${referrer || "(direct)"}\nPage: ${pageUrl || "(unknown)"}`;

  return sendEmail({ to: adminNotifyAddress(), subject: `Contact form: ${firstName} ${lastName}`, html, text, replyTo: email });
}

// ── 4. Producer welcome (admin-created account) ───────────────────────────
// Sent when an admin hand-creates a producer account. The single call to
// action is adding a payment method: a producer cannot enroll anyone until
// one is on file, so that page — not the dashboard — is where they land.
export async function sendProducerWelcomeEmail(opts: {
  to: string;
  firstName: string;
  businessName: string;
  tempPassword?: string;
  setPasswordLink?: string;
}) {
  const { to, firstName, businessName, tempPassword, setPasswordLink } = opts;

  // Step 2 ("activate") depends on how the account was created. Three cases,
  // and the third matters: a producer who signed themselves up has neither a
  // temp password nor a set-password link — Supabase already emailed them a
  // sign-in link, and this email must say so or the two look like spam.
  const activateHtml = tempPassword
    ? `Your login is <strong>${to}</strong> and your temporary password is <strong>${tempPassword}</strong>. Please change it after you sign in.`
    : setPasswordLink
      ? `Use the button below to set your password and activate your producer account. The link expires in 72 hours.`
      : `We've emailed you a <strong>separate sign-in link</strong> from club@memberperkclub.com &mdash; click <strong>Sign in</strong> in that email. There's no password to remember: to sign in later, choose <strong>Email me a sign-in link</strong> on the login page.`;
  const activateUrl = setPasswordLink || GUIDE_URLS.login;
  const activateCta = setPasswordLink ? "Set your password" : "Go to the login page";

  const steps: EmailStep[] = [
    { ...PRODUCER_STEPS[0], done: true },
    { ...PRODUCER_STEPS[1], body: activateHtml, url: activateUrl, cta: activateCta },
    PRODUCER_STEPS[2],
    PRODUCER_STEPS[3],
  ];

  const html = wrap(
    "Your producer account is ready",
    `<p>Hi ${esc(firstName) || "there"},</p>
     <p>Welcome aboard. Your free producer account for <strong>${esc(businessName)}</strong> is set up &mdash; no contract, no monthly fee. Here's how to enroll your first client.</p>
     ${stepsHtml(steps)}
     ${whatHappensNextHtml()}
     ${benefitsHtml("What your clients get")}
     ${howItWorksHtml()}
     <p style="margin-top:22px">Everything above, plus answers to common questions, is on your
       <a href="${GUIDE_URLS.gettingStarted}" style="color:${VIOLET};font-weight:700">getting-started guide &rarr;</a></p>
     <p>Questions? Just reply to this email.</p>`
  );

  const text = `Your MemberPerkClub producer account is ready

Welcome aboard. Your free producer account for ${businessName} is set up.

1. Create your account — DONE
2. Activate your account — ${tempPassword ? `Login: ${to} / Temp password: ${tempPassword}` : setPasswordLink ? `Set your password: ${setPasswordLink}` : `Click "Sign in" in the separate sign-in email we sent you.`}
3. Add a payment method (required before you can enroll): ${GUIDE_URLS.paymentMethod}
4. Enroll your first client: ${GUIDE_URLS.enroll}

Your client then gets a welcome email with their member number and a link to set their own password.

How it works: you buy memberships at $12 wholesale and set your own price, up to the $149 public price. You keep the difference. One year per membership, one-time charge, never auto-renews.

Getting-started guide and common questions: ${GUIDE_URLS.gettingStarted}`;

  return sendEmail({ to, subject: "Your MemberPerkClub producer account is ready", html, text });
}
// ── 5. Producer confirmation: "your client is enrolled" ───────────────────
// Sent to the PRODUCER, not the member, the moment an enrollment succeeds.
// Deliberately says nothing about price: the producer sets their own retail
// price and the $12 wholesale rate is not this email's business. It also
// never includes the member's password or set-password link — that is the
// member's own credential and must not travel through a third party.
export async function sendProducerEnrollmentConfirmation(opts: {
  to: string;
  producerFirstName: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  memberNumber: string;
}) {
  const { to, producerFirstName, clientFirstName, clientLastName, clientEmail, memberNumber } = opts;
  const clientName = `${clientFirstName} ${clientLastName}`.trim();
  const memberDigits = (memberNumber || "").replace(/^MPC-/i, "");

  const html = wrap(
    "Your client is enrolled",
    `<p>Hi ${producerFirstName || "there"},</p>
     <p><strong>${clientName}</strong> is now an active MemberPerkClub member. Nothing further is needed from you &mdash; your part is done.</p>
     <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
       <tr><td style="padding:8px 0;color:#665B7A;width:140px">Member</td><td style="padding:8px 0;color:${INK};font-weight:600">${clientName}</td></tr>
       <tr><td style="padding:8px 0;color:#665B7A">Email</td><td style="padding:8px 0;color:${INK}">${clientEmail}</td></tr>
       <tr><td style="padding:8px 0;color:#665B7A">Member no.</td><td style="padding:8px 0;color:${INK};font-family:monospace">${memberDigits}</td></tr>
       <tr><td style="padding:8px 0;color:#665B7A">Term</td><td style="padding:8px 0;color:${INK}">One year from today</td></tr>
     </table>
     <h3 style="color:${INK};font-size:16px;margin-top:24px">What happens next</h3>
     <p>We have emailed ${clientFirstName || "your client"} a welcome message at <strong>${clientEmail}</strong> with their member number and a link to set their own password. Once they set it, they can sign in and start using their benefits right away.</p>
     <p style="color:#665B7A;font-size:13px">If they say it never arrived, ask them to check spam first. They can also sign in any time at the login page by choosing &ldquo;Email me a sign-in link&rdquo;.</p>
     <p><a href="${SITE_URL}/producer/dashboard" style="color:${VIOLET};font-weight:700">View your producer dashboard &rarr;</a></p>`
  );

  const text = `Your client is enrolled

${clientName} is now an active MemberPerkClub member. Nothing further is needed from you.

Member: ${clientName}
Email: ${clientEmail}
Member no.: ${memberDigits}
Term: One year from today

We have emailed ${clientFirstName || "your client"} at ${clientEmail} with their member number and a link to set their own password. Once they set it, they can sign in and start using their benefits.

Producer dashboard: ${SITE_URL}/producer/dashboard`;

  return sendEmail({ to, subject: `${clientName} is enrolled — MemberPerkClub`, html, text });
}

// ── 6. Convention prospect welcome — pasted into a SENDY autoresponder ────
// Not sent by this app. The admin prospect page adds an address to the Sendy
// "Producer prospects" list; Sendy's autoresponder sends THIS html. It uses
// Sendy's own tags, which Sendy fills in at send time:
//   [Name,fallback=there]            the name typed at the booth, if any
//   <unsubscribe>…</unsubscribe>     Sendy's unsubscribe link (legally required)
// CAN-SPAM also requires a real postal address in commercial email — the
// POSTAL_ADDRESS placeholder must be replaced before this goes live.
export function buildProspectEmailHtml(postalAddress = "[YOUR MAILING ADDRESS — required by law]"): string {
  const steps = PRODUCER_STEPS.map((s) => ({ ...s }));
  const body = `<p>Hi [Name,fallback=there],</p>
     <p>Great meeting you. As promised, here's how MemberPerkClub works &mdash; and why it's an easy extra to offer your clients.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 6px;background:#F3EDFE;border-radius:12px">
       <tr><td style="padding:20px 22px">
         <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:${INK}">A savings membership you resell under your own agency</p>
         <p style="margin:0;font-size:15px;line-height:1.6;color:#4C405F">You buy memberships at <strong>$12 wholesale</strong> and decide what your client pays &mdash; anything up to the $149 public price. You keep the difference. Your account is free, with no contract and no monthly fee.</p>
       </td></tr>
     </table>
     ${howItWorksHtml()}
     ${benefitsHtml("What your clients get")}
     <p style="margin:26px 0 4px;font-size:17px;font-weight:700;color:${INK}">Getting started takes about five minutes</p>
     ${stepsHtml(steps)}
     <p style="text-align:center;margin:8px 0 6px">
       <a href="${GUIDE_URLS.signup}" style="display:inline-block;background:${VIOLET};color:#ffffff;text-decoration:none;font-weight:700;font-size:17px;padding:16px 34px;border-radius:10px">Open my free producer account &rarr;</a>
     </p>
     <p style="margin-top:22px">Want the full walkthrough and answers to common questions first? It's all on our
       <a href="${GUIDE_URLS.gettingStarted}" style="color:${VIOLET};font-weight:700">getting-started guide</a>.</p>
     <p>Any questions, just reply to this email.</p>
     <p>[YOUR NAME]<br><span style="color:#665B7A">MemberPerkClub &middot; club@memberperkclub.com</span></p>
     <p style="margin-top:28px;font-size:12px;line-height:1.6;color:#8A7F9C">You're receiving this because we met in person and you asked for information about MemberPerkClub.<br>
       ${esc(postalAddress)}<br>
       <unsubscribe style="color:#8A7F9C">Unsubscribe</unsubscribe></p>`;
  return wrap("Great meeting you", body);
}


// ── Admin notices in the sectioned ("Stratum") format ─────────────────────
// Built ONCE as {title, rows} sections and rendered to both HTML and text so
// the two can never drift. Tracking metadata always goes in the LAST section
// so it can be deleted in one selection before a notice is forwarded.
type Section = { title: string; rows: [string, string][] };

function digits(memberNumber?: string | null): string {
  return (memberNumber || "").replace(/^MPC-/i, "") || "—";
}

function nowPT(d: Date = new Date()): string {
  return d.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }) + " PT";
}

function datePT(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles", month: "long", day: "numeric", year: "numeric",
  });
}

function trackingSection(referrer?: string, pageUrl?: string): Section {
  return { title: "Tracking", rows: [
    ["Referring URL", referrer || "(direct / none)"],
    ["Signup page", pageUrl || "—"],
  ]};
}

function sectionsHtml(sections: Section[]): string {
  return sections.map((sec) => `
    <h2 style="margin:22px 0 8px;padding:0 0 6px;border-bottom:2px solid ${VIOLET};font-size:15px;color:${VIOLET};text-transform:uppercase;letter-spacing:.06em">${esc(sec.title)}</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse">
      ${sec.rows.map(([k, v]) => `<tr>
        <td style="padding:6px 12px 6px 0;width:150px;vertical-align:top;font-weight:700;color:${INK}">${esc(k)}</td>
        <td style="padding:6px 0;vertical-align:top;color:#4C405F;word-break:break-word">${esc(v)}</td></tr>`).join("")}
    </table>`).join("");
}

function sectionsText(sections: Section[]): string {
  return sections.map((sec) =>
    `== ${sec.title.toUpperCase()} ==\n` + sec.rows.map(([k, v]) => `${k}: ${v}`).join("\n")
  ).join("\n\n");
}

async function sendAdminNotice(subject: string, heading: string, sections: Section[]) {
  return sendEmail({
    to: adminNotifyAddress(),
    subject,
    html: wrap(heading, sectionsHtml(sections)),
    text: `${heading}\n\n${sectionsText(sections)}`,
  });
}

// New member (retail or producer-enrolled) or a renewal — to club@.
export async function sendMemberAdminNotice(opts: {
  event: "retail" | "producer_enrolled" | "renewed";
  member: {
    firstName?: string | null; lastName?: string | null; email: string;
    phone?: string | null; state?: string | null; memberNumber?: string | null;
  };
  expiresAt?: string | null;
  producer?: { businessName?: string | null; name?: string | null; email?: string | null } | null;
  payment?: { amountCents?: number | null; reference?: string | null } | null;
  previousExpiresAt?: string | null;
}) {
  const m = opts.member;
  const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || "(not provided)";
  const label = opts.event === "retail" ? "New retail member ($149/yr)"
    : opts.event === "producer_enrolled" ? "New producer-enrolled member ($12)"
    : "Membership renewed ($12)";

  const sections: Section[] = [
    { title: "Member", rows: [
      ["Member no.", digits(m.memberNumber)],
      ["Name", name],
      ["Email", m.email],
      ["Phone", m.phone || "—"],
      ["State", m.state || "—"],
    ]},
    { title: "Membership", rows: [
      ["Type", label],
      ...(opts.event === "renewed" ? [["Previous end date", datePT(opts.previousExpiresAt)] as [string, string]] : []),
      [opts.event === "retail" ? "Renews" : "Ends", datePT(opts.expiresAt)],
      ["Recorded", nowPT()],
    ]},
  ];
  if (opts.producer) {
    sections.push({ title: "Producer", rows: [
      ["Business", opts.producer.businessName || "—"],
      ["Contact", opts.producer.name || "—"],
      ["Email", opts.producer.email || "—"],
    ]});
  }
  if (opts.payment) {
    sections.push({ title: "Payment", rows: [
      ["Amount", opts.payment.amountCents != null ? `$${(opts.payment.amountCents / 100).toFixed(2)}` : "—"],
      ["Stripe reference", opts.payment.reference || "—"],
    ]});
  }
  sections.push({ title: "Admin", rows: [["Members", `${SITE_URL}/admin/members`]] });

  return sendAdminNotice(`${label}: ${name} (${digits(m.memberNumber)})`, label, sections);
}

// ── Renewal + expiry emails ───────────────────────────────────────────────
export async function sendProducerRenewalConfirmation(opts: {
  to: string; producerFirstName: string; clientName: string; memberNumber: string; newExpiresAt: string;
}) {
  const o = opts;
  const html = wrap("Membership renewed",
    `<p>Hi ${esc(o.producerFirstName) || "there"},</p>
     <p><strong>${esc(o.clientName)}</strong> (member no. ${digits(o.memberNumber)}) is renewed for another year, through <strong>${datePT(o.newExpiresAt)}</strong>. Your saved payment method was charged the wholesale rate.</p>
     <p>We've let your client know. Nothing else is needed from you.</p>
     <p><a href="${GUIDE_URLS.dashboard}" style="color:${VIOLET};font-weight:700">View your producer dashboard &rarr;</a></p>`);
  const text = `${o.clientName} (member no. ${digits(o.memberNumber)}) is renewed through ${datePT(o.newExpiresAt)}.\n\nDashboard: ${GUIDE_URLS.dashboard}`;
  return sendEmail({ to: o.to, subject: `${o.clientName} renewed through ${datePT(o.newExpiresAt)}`, html, text });
}

// To the MEMBER. Never mentions a price: producer-enrolled members never see
// what their producer paid or charged.
export async function sendMemberRenewedEmail(opts: {
  to: string; firstName: string; agency: string | null; newExpiresAt: string;
}) {
  const o = opts;
  const via = o.agency ? ` by <strong>${esc(o.agency)}</strong>` : "";
  const html = wrap("Your membership is renewed",
    `<p>Hi ${esc(o.firstName) || "there"},</p>
     <p>Good news &mdash; your MemberPerkClub membership has been renewed${via}. It's now active through <strong>${datePT(o.newExpiresAt)}</strong>.</p>
     <p>Nothing changes: sign in the same way as before and your benefits are right where you left them.</p>
     <p><a href="${SITE_URL}/login" style="color:${VIOLET};font-weight:700">Sign in &rarr;</a></p>`);
  const text = `Your MemberPerkClub membership has been renewed${o.agency ? ` by ${o.agency}` : ""}. Active through ${datePT(o.newExpiresAt)}.\n\nSign in: ${SITE_URL}/login`;
  return sendEmail({ to: o.to, subject: `Your membership is renewed through ${datePT(o.newExpiresAt)}`, html, text });
}

export async function sendProducerExpiryReminder(opts: {
  to: string;
  producerFirstName: string;
  clients: { name: string; memberNumber: string; expiresAt: string; daysLeft: number }[];
}) {
  const o = opts;
  const n = o.clients.length;
  const soonest = Math.min(...o.clients.map((c) => c.daysLeft));
  const rows = o.clients.map((c) => `<tr>
      <td style="padding:8px 10px 8px 0;border-bottom:1px solid #E6DEF4;color:${INK};font-weight:600">${esc(c.name)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E6DEF4;font-family:monospace">${digits(c.memberNumber)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #E6DEF4">${datePT(c.expiresAt)} <span style="color:#665B7A">(${c.daysLeft} day${c.daysLeft === 1 ? "" : "s"})</span></td></tr>`).join("");
  const html = wrap(n === 1 ? "A client's membership ends soon" : `${n} client memberships end soon`,
    `<p>Hi ${esc(o.producerFirstName) || "there"},</p>
     <p>${n === 1 ? "This client's membership is" : "These clients' memberships are"} coming to an end. Memberships don't renew on their own, so if you'd like to keep ${n === 1 ? "them" : "them"} covered &mdash; and bill your client for the renewal &mdash; renew from your dashboard. It's the same $12 wholesale charge, and the new year starts when the current one ends, so renewing early never costs your client any days.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;margin:14px 0">
       <tr><th align="left" style="padding:0 10px 6px 0;font-size:12px;color:#665B7A">CLIENT</th><th align="left" style="padding:0 10px 6px;font-size:12px;color:#665B7A">MEMBER NO.</th><th align="left" style="padding:0 0 6px;font-size:12px;color:#665B7A">ENDS</th></tr>
       ${rows}
     </table>
     <p style="text-align:center;margin:22px 0 6px"><a href="${GUIDE_URLS.dashboard}" style="display:inline-block;background:${VIOLET};color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:10px">Renew from my dashboard &rarr;</a></p>
     <p style="color:#665B7A;font-size:13px">If you do nothing, their access simply ends on that date. There is no charge unless you choose to renew.</p>`);
  const text = `Client memberships ending soon:\n\n${o.clients.map((c) => `- ${c.name} (${digits(c.memberNumber)}) ends ${datePT(c.expiresAt)} — ${c.daysLeft} days`).join("\n")}\n\nRenew from your dashboard ($12 each): ${GUIDE_URLS.dashboard}\nNo charge unless you choose to renew.`;
  return sendEmail({ to: o.to, subject: n === 1 ? `${o.clients[0].name}'s membership ends in ${soonest} days` : `${n} client memberships ending soon`, html, text });
}
