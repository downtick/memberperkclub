import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sendyConfigured, prospectListId, activeSubscriberCount } from "@/lib/sendy";

// Reports which integrations are configured on THIS deployment. Reports
// presence only — never a key, a prefix, or a length — so it is safe to hit
// from anywhere. Saves guessing which env var is missing when something that
// should send an email quietly doesn't.
export const dynamic = "force-dynamic";

// Stripe's own `type`/`code` survive minification; `err.constructor.name`
// does not — it comes back as a single mangled letter in production.
function stripeErrorType(err: unknown): string {
  const e = err as { type?: string; code?: string };
  return e?.type || e?.code || "UnknownError";
}

export async function GET(request: Request) {
  const has = (v?: string) => Boolean(v && v.trim().length > 0);

  const supabase =
    has(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    has(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const shallow = {
    supabase: {
      publicKeys: supabase,
      serviceRole: has(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    email: {
      smtp2go: has(process.env.SMTP2GO_API_KEY),
      from: has(process.env.EMAIL_FROM),
      adminNotify: has(process.env.ADMIN_NOTIFY_EMAIL),
    },
    stripe: {
      secret: has(process.env.STRIPE_SECRET_KEY),
      publishable: has(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      annualPrice: has(process.env.STRIPE_PRICE_ANNUAL),
      webhookSecret: has(process.env.STRIPE_WEBHOOK_SECRET),
    },
    site: {
      url: process.env.NEXT_PUBLIC_SITE_URL || null,
    },
  };

  // ?deep=1 actually CALLS Stripe instead of checking for a non-empty string.
  // Presence is not validity: a revoked key, a key from another account, and a
  // leftover placeholder all read as "present" above while every charge fails.
  // Returns outcomes and error TYPES only — never a key, an account id, or a
  // customer — so it stays safe to hit from anywhere.
  if (new URL(request.url).searchParams.get("deep") !== "1") {
    return NextResponse.json(shallow);
  }

  const stripeDeep: Record<string, unknown> = {
    keyValid: false,
    keyErrorType: null as string | null,
    priceValid: false,
    priceErrorType: null as string | null,
    priceIsLive: null as boolean | null,
    priceIsRecurring: null as boolean | null,
    priceAmount: null as number | null,
  };

  try {
    const stripe = getStripe();
    // Cheapest authenticated call there is — proves the key works at all.
    await stripe.balance.retrieve();
    stripeDeep.keyValid = true;

    const priceId = process.env.STRIPE_PRICE_ANNUAL;
    if (priceId) {
      try {
        const price = await stripe.prices.retrieve(priceId);
        stripeDeep.priceValid = true;
        stripeDeep.priceIsLive = price.livemode;
        stripeDeep.priceIsRecurring = price.type === "recurring";
        stripeDeep.priceAmount = price.unit_amount;
      } catch (err) {
        stripeDeep.priceErrorType = stripeErrorType(err);
      }
    }
  } catch (err) {
    stripeDeep.keyErrorType = stripeErrorType(err);
  }

  // SMTP2GO: a read-only stats call validates the API key without sending
  // anything. The key being present has never meant it works.
  const emailDeep: Record<string, unknown> = { keyValid: false, error: null };
  const smtpKey = process.env.SMTP2GO_API_KEY?.trim();
  if (smtpKey) {
    try {
      const res = await fetch("https://api.smtp2go.com/v3/stats/email_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ api_key: smtpKey }),
      });
      const body = await res.json().catch(() => ({}));
      emailDeep.keyValid = res.ok && !body?.data?.error;
      if (!emailDeep.keyValid) {
        const code = body?.data?.error_code || `HTTP ${res.status}`;
        emailDeep.error = code;
        emailDeep.hint =
          code === "E_ApiResponseCodes.INVALID_IN_PAYLOAD"
            ? "Value is not a well-formed SMTP2GO API key (should start with api-). Likely the SMTP username/password was pasted instead."
            : code === "E_ApiResponseCodes.API_EXCEPTION"
              ? "Well-formed key, but SMTP2GO does not recognise it (revoked or from another account)."
              : code === "E_ApiResponseCodes.ENDPOINT_PERMISSION_DENIED"
                ? "Key is RECOGNISED — it just lacks the Stats permission this check uses. Sending may still work; add Stats to the key in SMTP2GO to make this check go green."
                : null;
        // A recognised key without Stats permission is not a broken key.
        emailDeep.keyRecognised = code === "E_ApiResponseCodes.ENDPOINT_PERMISSION_DENIED";
      }
    } catch (err) {
      emailDeep.error = err instanceof Error ? err.message : "fetch failed";
    }
  } else {
    emailDeep.error = "not set";
  }

  // Sendy: the active-subscriber count call needs a valid key AND list id, so
  // a numeric answer proves both. Anything else is Sendy's error text.
  const sendyDeep: Record<string, unknown> = { configured: sendyConfigured(), listValid: false, error: null };
  if (sendyConfigured()) {
    try {
      const r = await activeSubscriberCount(prospectListId());
      if (/^\d+$/.test(r)) {
        sendyDeep.listValid = true;
        sendyDeep.prospects = Number(r);
      } else {
        sendyDeep.error = r.slice(0, 120);
      }
    } catch (err) {
      sendyDeep.error = err instanceof Error ? err.message : "fetch failed";
    }
  }

  return NextResponse.json({ ...shallow, deep: { stripe: stripeDeep, email: emailDeep, sendy: sendyDeep } });
}
