import Stripe from "stripe";

// Server-only Stripe client. Never import into a client component.
// STRIPE_SECRET_KEY is unset during Phase 1 scaffolding — routes that call
// this will fail at runtime until a real key is added, which is expected.
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local before using Stripe features."
    );
  }
  return new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
}

// Retail annual membership price ($149/yr subscription)
export const STRIPE_PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL || "";

// One-time producer-enrolled client fee, in cents ($12.00). Kept as a
// constant rather than a Stripe Price so the PaymentIntent amount can be
// created inline without a dashboard-managed price object.
export const PRODUCER_ENROLLMENT_FEE_CENTS = 1200;
