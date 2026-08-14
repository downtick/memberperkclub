import { sendEmail, adminNotifyAddress } from "./smtp2go";

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

  const credentialsHtml = tempPassword
    ? `<p>Your login is <strong>${to}</strong> and your temporary password is <strong>${tempPassword}</strong>. Please change it after you sign in.</p>
       <p><a href="${SITE_URL}/login" style="color:${VIOLET};font-weight:700">Log in to your account &rarr;</a></p>`
    : `<p>Click below to set your password and activate your account:</p>
       <p><a href="${setPasswordLink}" style="color:${VIOLET};font-weight:700">Set your password &rarr;</a></p>
       <p style="color:#665B7A;font-size:13px">This link expires in 72 hours.</p>`;

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
      : `Set your password: ${setPasswordLink}`
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
}) {
  const {
    firstName, lastName, businessName, email, phone,
    addressLine1, addressLine2, city, state, postalCode,
  } = opts;

  const addressHtml = [addressLine1, addressLine2, `${city}, ${state} ${postalCode}`]
    .filter(Boolean)
    .join("<br/>");
  const addressText = [addressLine1, addressLine2, `${city}, ${state} ${postalCode}`]
    .filter(Boolean)
    .join("\n         ");

  const html = wrap(
    "New Producer Sign-Up",
    `<p>A new producer just signed up:</p>
     <table style="width:100%;border-collapse:collapse;font-size:14px">
       <tr><td style="padding:6px 0;font-weight:700;width:130px;vertical-align:top">Business</td><td>${businessName}</td></tr>
       <tr><td style="padding:6px 0;font-weight:700;vertical-align:top">Contact</td><td>${firstName} ${lastName}</td></tr>
       <tr><td style="padding:6px 0;font-weight:700;vertical-align:top">Email</td><td>${email}</td></tr>
       <tr><td style="padding:6px 0;font-weight:700;vertical-align:top">Phone</td><td>${phone}</td></tr>
       <tr><td style="padding:6px 0;font-weight:700;vertical-align:top">Address</td><td>${addressHtml}</td></tr>
       <tr><td style="padding:6px 0;font-weight:700;vertical-align:top">State</td><td>${state}</td></tr>
     </table>`
  );
  const text = `New producer sign-up
Business: ${businessName}
Contact:  ${firstName} ${lastName}
Email:    ${email}
Phone:    ${phone}
Address:  ${addressText}
State:    ${state}`;

  return sendEmail({
    to: adminNotifyAddress(),
    subject: `New producer sign-up: ${businessName} (${firstName} ${lastName})`,
    html,
    text,
  });
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
