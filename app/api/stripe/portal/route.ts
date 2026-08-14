import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

// Redirects the member into the Stripe Customer Portal to manage/cancel
// their own retail subscription. Producer-enrolled members never reach this
// route (gated at /dashboard/billing).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();
  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(new URL("/dashboard/billing", request.url));
  }

  try {
    const stripe = getStripe();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://memberperkclub.com";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/dashboard/billing`,
    });
    return NextResponse.redirect(portalSession.url);
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.redirect(new URL("/dashboard/billing?error=portal", request.url));
  }
}
