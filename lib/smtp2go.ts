import { createAdminClient } from "@/lib/supabase/admin";

// SMTP2GO HTTPS API email sender — shared by all outbound mail. Stubbed
// behind env vars per websites/CLAUDE.md: real code path, no live key yet.
const SMTP2GO_API_URL = "https://api.smtp2go.com/v3/email/send";
const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY;

// On-theme sender — NOT hello@. "members@" reads as the club's own voice.
const SENDER = process.env.EMAIL_FROM || "members@memberperkclub.com";

// Back-end only — never rendered on any page. Admin notifications (producer
// signups, contact form) go here.
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "admin@memberperkclub.com";

// Silent archive copy of every outbound email, member-facing ones included.
// BCC rather than CC or a second To: recipients must never see this address.
// Intentionally env-only with NO fallback — the real address is an internal
// mailbox and must not appear in the repo. Unset means no BCC, not a default.
const EMAIL_BCC = process.env.EMAIL_BCC;

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailArgs): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!SMTP2GO_API_KEY) {
    console.warn(`[smtp2go] SMTP2GO_API_KEY not set — skipping send to ${to}: "${subject}"`);
    await recordSend(to, subject, false, "SMTP2GO_API_KEY not configured");
    return { ok: false, error: "SMTP2GO_API_KEY not configured" };
  }

  try {
    const res = await fetch(SMTP2GO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        api_key: SMTP2GO_API_KEY,
        to: [to],
        // Skip the BCC when it is already the To: — admin notices would
        // otherwise arrive twice in the same mailbox.
        ...(EMAIL_BCC && EMAIL_BCC.toLowerCase() !== to.toLowerCase()
          ? { bcc: [EMAIL_BCC] }
          : {}),
        sender: SENDER,
        subject,
        html_body: html,
        text_body: text,
        ...(replyTo ? { custom_headers: [{ header: "Reply-To", value: replyTo }] } : {}),
      }),
    });
    const data = await res.json();
    const ok = res.ok && data?.data?.succeeded >= 1;
    const error = ok ? undefined : JSON.stringify(data);
    await recordSend(to, subject, ok, error);
    return { ok, error };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await recordSend(to, subject, false, error);
    return { ok: false, error };
  }
}

// Every send lands in email_log, success or failure. Before this existed, a
// rejected send vanished: sendEmail RETURNS {ok:false} rather than throwing,
// so the callers' .catch() never fired and nothing was recorded anywhere.
// Logging must never break sending, hence the swallow at the end.
async function recordSend(to: string, subject: string, ok: boolean, error?: string) {
  if (!ok) console.error(`[smtp2go] send FAILED to=${to} subject="${subject}" error=${error}`);
  try {
    await createAdminClient().from("email_log").insert({
      to_email: to,
      template: subject,
      status: ok ? "sent" : "failed",
      error: error ? error.slice(0, 1000) : null,
    });
  } catch (logErr) {
    console.error("[smtp2go] could not write email_log:", logErr);
  }
}

export function adminNotifyAddress(): string {
  return ADMIN_NOTIFY_EMAIL;
}
