import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_PRICE_ANNUAL, logStripeError } from "@/lib/stripe";
import { getOffer, offerPriceId } from "@/lib/offers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Starts a Stripe Checkout subscription for the $149/yr retail plan. Real
// integration code against env vars — inert until STRIPE_SECRET_KEY and
// STRIPE_PRICE_ANNUAL are set (Phase 1: no live keys yet).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to join." }, { status: 401 });
  }

  // An offer slug may arrive in the body; the price it maps to comes from the
  // server-side allowlist, never from the request.
  let offerSlug = "";
  try {
    const body = await request.json();
    if (body && typeof body.offer === "string") offerSlug = body.offer;
  } catch {
    /* no body is the normal full-price path */
  }
  const offer = getOffer(offerSlug);
  const priceId = offer ? offerPriceId(offer) : STRIPE_PRICE_ANNUAL;

  if (offer && !priceId) {
    return NextResponse.json(
      { error: `This offer isn't available yet. Set ${offer.priceEnv}.` },
      { status: 501 }
    );
  }
  if (!priceId) {
    return NextResponse.json(
      { error: "Membership checkout isn't configured yet. Set STRIPE_PRICE_ANNUAL." },
      { status: 501 }
    );
  }

  try {
    const stripe = getStripe();
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single();

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://memberperkclub.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: user.id,
      customer_email: profile?.email || user.email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?welcome=1`,
      cancel_url: offer ? `${origin}/small-business-offer` : `${origin}/join`,
      metadata: { profile_id: user.id, plan: "retail_annual", offer: offer?.slug ?? "" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const friendly = logStripeError("checkout session", err);
    return NextResponse.json(
      { error: friendly || "Unable to start checkout." },
      { status: 500 }
    );
  }
}
