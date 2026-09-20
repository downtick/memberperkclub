import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Reports which integrations are configured on THIS deployment. Reports
// presence only — never a key, a prefix, or a length — so it is safe to hit
// from anywhere. Saves guessing which env var is missing when something that
// should send an email quietly doesn't.
export const dynamic = "force-dynamic";

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
        stripeDeep.priceErrorType =
          err instanceof Error ? err.constructor.name : "UnknownError";
      }
    }
  } catch (err) {
    stripeDeep.keyErrorType =
      err instanceof Error ? err.constructor.name : "UnknownError";
  }

  return NextResponse.json({ ...shallow, deep: { stripe: stripeDeep } });
}
