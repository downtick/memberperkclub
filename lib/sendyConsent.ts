// Consent-aware Sendy subscribe. Canonical copy: websites/_reference/sendy-resubscribe-confirm/
//
// Sendy's /subscribe silently re-activates an address that unsubscribed or
// complained, so any form (or a bot typing someone else's address) could undo
// an opt-out. This module checks the address's status first:
//
//   never on the list / unconfirmed  -> subscribe as normal
//   already subscribed               -> nothing to do
//   unsubscribed / complained        -> 'newsletter' mode: email a signed
//                                       "confirm you want back in" link;
//                                       'lead' mode: leave them off
//   bounced / soft bounced           -> leave them off (Sendy refuses hard
//                                       bounces anyway)
//
// Only the address owner can click the link, so a stranger can't re-subscribe
// them. The link opens a page with a button (POST), never a GET that
// subscribes, because mail scanners pre-fetch links.
//
// Env: SENDY_API_KEY (required: the status API and this install's /subscribe
// both need it; it also keys the link signature, so no extra secret is needed),
// SENDY_URL (install base, default https://clubfluent.com/sendy),
// SENDY_ORIGIN_SECRET (optional header the install checks).
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export type SubscribeMode = 'newsletter' | 'lead';
export type SubscribeOutcome = 'subscribed' | 'already' | 'confirm-sent' | 'skipped' | 'failed';

export interface ConsentSubscribeArgs {
  email: string;
  name?: string;
  listId: string;
  /** Extra Sendy fields (custom field name -> value). */
  fields?: Record<string, string>;
  /** 'newsletter' = the person is explicitly asking to join; 'lead' = a side effect of a quote/lead form. */
  mode: SubscribeMode;
  /** Sends the confirmation email (newsletter mode). Use the site's own mailer. */
  sendConfirmEmail?: (to: string, confirmUrl: string) => Promise<unknown>;
  /** Canonical site origin, e.g. "https://example.com". Never derive it from the Host header. */
  siteUrl?: string;
  /** Sendy brand id, for installs/sites that pass one. */
  brandId?: string;
}

const LINK_DAYS = 7;
const REJOIN_STATUSES = new Set(['unsubscribed', 'complained']);
const NEVER_STATUSES = new Set(['bounced', 'soft bounced']);
const NEW_STATUSES = new Set(['email does not exist in list', 'unconfirmed']);

function base(): string {
  return (process.env.SENDY_URL?.trim() || process.env.SENDY_BASE_URL || 'https://clubfluent.com/sendy').replace(/\/+$/, '');
}

function headers(): Record<string, string> {
  const originSecret = process.env.SENDY_ORIGIN_SECRET;
  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...(originSecret ? { 'X-VH-Origin-Secret': originSecret } : {}),
  };
}

/** The address's status on a list, lower-cased ("subscribed", "unsubscribed", ...), or null if it couldn't be read. */
export async function sendyStatus(email: string, listId: string): Promise<string | null> {
  const apiKey = process.env.SENDY_API_KEY?.trim();
  if (!apiKey) return null;
  try {
    const res = await fetch(`${base()}/api/subscribers/subscription-status.php`, {
      method: 'POST',
      headers: headers(),
      body: new URLSearchParams({ api_key: apiKey, list_id: listId, email }).toString(),
    });
    const text = (await res.text()).trim().toLowerCase();
    const known = REJOIN_STATUSES.has(text) || NEVER_STATUSES.has(text) || NEW_STATUSES.has(text) || text === 'subscribed';
    return known ? text : null;
  } catch {
    return null;
  }
}

/** Calls Sendy /subscribe directly. Only call after a status check or a verified confirm link. */
export async function rawSubscribe(email: string, listId: string, name?: string, fields?: Record<string, string>, brandId?: string): Promise<boolean> {
  const form = new URLSearchParams({ email, list: listId, boolean: 'true' });
  if (name) form.set('name', name);
  if (brandId) form.set('brand_id', brandId);
  const apiKey = process.env.SENDY_API_KEY?.trim();
  if (apiKey) form.set('api_key', apiKey);
  for (const [k, v] of Object.entries(fields || {})) if (v) form.set(k, v);
  try {
    const res = await fetch(`${base()}/subscribe`, { method: 'POST', headers: headers(), body: form.toString() });
    const text = (await res.text()).trim().toLowerCase();
    const ok = text === '1' || text === 'true' || text.includes('already');
    if (!ok) console.error('[sendy] subscribe response:', text);
    return ok;
  } catch (e) {
    console.error('[sendy] subscribe failed', (e as Error)?.message);
    return false;
  }
}

// ── Signed confirm link ──────────────────────────────────────────────────────

function signingKey(): Buffer | null {
  const apiKey = process.env.SENDY_API_KEY?.trim();
  return apiKey ? createHash('sha256').update(`sendy-resubscribe:${apiKey}`).digest() : null;
}

function sign(email: string, listId: string, exp: number): string | null {
  const key = signingKey();
  if (!key) return null;
  return createHmac('sha256', key).update(`${email.toLowerCase()}\n${listId}\n${exp}`).digest('base64url');
}

export function buildConfirmUrl(siteUrl: string, email: string, listId: string): string | null {
  const exp = Math.floor(Date.now() / 1000) + LINK_DAYS * 86400;
  const s = sign(email, listId, exp);
  if (!s) return null;
  const q = new URLSearchParams({ e: email, l: listId, x: String(exp), s });
  return `${siteUrl.replace(/\/+$/, '')}/newsletter/confirm?${q.toString()}`;
}

export type ConfirmCheck = { ok: true; email: string; listId: string } | { ok: false; reason: 'invalid' | 'expired' };

/** Verifies the e/l/x/s values from a confirm link (or the page's hidden form fields). */
export function verifyConfirm(e: unknown, l: unknown, x: unknown, s: unknown): ConfirmCheck {
  const email = String(e || '').trim();
  const listId = String(l || '').trim();
  const exp = Number(x);
  const sig = String(s || '');
  if (!email || !listId || !Number.isFinite(exp) || !sig) return { ok: false, reason: 'invalid' };
  const expected = sign(email, listId, exp);
  if (!expected) return { ok: false, reason: 'invalid' };
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: 'invalid' };
  if (exp < Date.now() / 1000) return { ok: false, reason: 'expired' };
  return { ok: true, email, listId };
}

// One confirm email per address per 10 minutes, so the form can't be used to
// flood someone's inbox. In-memory: per instance, best-effort.
const recentConfirms = new Map<string, number>();
function confirmThrottled(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase();
  const last = recentConfirms.get(key);
  if (last && now - last < 10 * 60_000) return true;
  recentConfirms.set(key, now);
  if (recentConfirms.size > 5000) for (const [k, t] of recentConfirms) if (now - t > 10 * 60_000) recentConfirms.delete(k);
  return false;
}

// ── Main entry point ─────────────────────────────────────────────────────────

/**
 * Subscribe with the opt-out respected. Callers should show the visitor the
 * same message whatever the outcome (e.g. "Thanks! If you'd unsubscribed
 * before, check your inbox for a link to confirm."), so the form never
 * reveals who is or was on the list.
 */
export async function subscribeWithConsent(args: ConsentSubscribeArgs): Promise<SubscribeOutcome> {
  const { email, name, listId, fields, mode, brandId } = args;
  if (!listId || !email) return 'skipped';

  const status = await sendyStatus(email, listId);

  if (status === 'subscribed') return 'already';
  if (status && NEVER_STATUSES.has(status)) return 'skipped';

  if (status && NEW_STATUSES.has(status)) {
    return (await rawSubscribe(email, listId, name, fields, brandId)) ? 'subscribed' : 'failed';
  }

  // Previously opted out, or status unknown (API key missing / Sendy unreachable).
  // A lead form never re-adds; a newsletter form asks the owner to confirm.
  if (mode === 'lead') return 'skipped';
  if (!args.sendConfirmEmail || !args.siteUrl) return 'skipped';
  if (confirmThrottled(email)) return 'confirm-sent';
  const url = buildConfirmUrl(args.siteUrl, email, listId);
  if (!url) return 'skipped';
  try {
    await args.sendConfirmEmail(email, url);
    return 'confirm-sent';
  } catch (e) {
    console.error('[sendy] confirm email failed', (e as Error)?.message);
    return 'failed';
  }
}

// ── Email copy ───────────────────────────────────────────────────────────────

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Subject, HTML and text for the confirmation email. siteName is the site's own name (trusted). */
export function confirmEmailContent(siteName: string, confirmUrl: string) {
  const subject = `Confirm you want to rejoin the ${siteName} newsletter`;
  const text = [
    `Someone (hopefully you) asked to rejoin the ${siteName} newsletter with this email address.`,
    `Because this address unsubscribed before, we won't add it back unless you confirm:`,
    confirmUrl,
    `The link works for ${LINK_DAYS} days. If this wasn't you, ignore this email and you'll stay unsubscribed.`,
  ].join('\n\n');
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#222;max-width:560px">
<p>Someone (hopefully you) asked to rejoin the <strong>${esc(siteName)}</strong> newsletter with this email address.</p>
<p>Because this address unsubscribed before, we won't add it back unless you confirm.</p>
<p style="margin:24px 0"><a href="${esc(confirmUrl)}" style="background:#1a56db;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;font-weight:bold">Yes, resubscribe me</a></p>
<p style="color:#555;font-size:13px">The link works for ${LINK_DAYS} days. If this wasn't you, ignore this email and you'll stay unsubscribed.</p>
</div>`;
  return { subject, html, text };
}
