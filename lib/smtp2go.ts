// SMTP2GO HTTPS API email sender — shared by all outbound mail. Stubbed
// behind env vars per websites/CLAUDE.md: real code path, no live key yet.
const SMTP2GO_API_URL = "https://api.smtp2go.com/v3/email/send";
const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY;

// On-theme sender — NOT hello@. "members@" reads as the club's own voice.
const SENDER = process.env.EMAIL_FROM || "members@memberperkclub.com";

// Back-end only — never rendered on any page. Admin notifications (producer
// signups, contact form) go here.
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "admin@memberperkclub.com";

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
    return { ok: false, error: "SMTP2GO_API_KEY not configured" };
  }

  try {
    const res = await fetch(SMTP2GO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        api_key: SMTP2GO_API_KEY,
        to: [to],
        sender: SENDER,
        subject,
        html_body: html,
        text_body: text,
        ...(replyTo ? { custom_headers: [{ header: "Reply-To", value: replyTo }] } : {}),
      }),
    });
    const data = await res.json();
    const ok = res.ok && data?.data?.succeeded >= 1;
    return { ok, error: ok ? undefined : JSON.stringify(data) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function adminNotifyAddress(): string {
  return ADMIN_NOTIFY_EMAIL;
}
