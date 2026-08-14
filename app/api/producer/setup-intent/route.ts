import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Creates a Stripe SetupIntent so a producer can store a payment method, used
// later for instant off-session $12 PaymentIntents per client enrollment.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || (profile.role !== "producer" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Producer account required." }, { status: 403 });
  }

  try {
    const stripe = getStripe();
    const admin = createAdminClient();
    const { data: producer } = await admin.from("producers").select("*").eq("id", user.id).single();

    let customerId = producer?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" "),
        metadata: { profile_id: user.id, role: "producer" },
      });
      customerId = customer.id;
      await admin.from("producers").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: "off_session",
      payment_method_types: ["card"],
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error("Producer setup-intent error:", err);
    return NextResponse.json({ error: "Unable to start card setup." }, { status: 500 });
  }
}
