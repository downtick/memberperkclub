import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

// Called client-side right after a producer's SetupIntent confirms
// successfully, to persist the resulting default payment method id so
// /api/producer/enroll can charge it off-session later. The id comes from
// the browser, so it is only saved if Stripe confirms the card is attached
// to THIS producer's own Stripe customer.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let paymentMethodId: unknown;
  try {
    ({ paymentMethodId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof paymentMethodId !== "string" || !/^pm_[A-Za-z0-9]{6,64}$/.test(paymentMethodId)) {
    return NextResponse.json({ error: "Missing payment method." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: producer } = await admin.from("producers").select("stripe_customer_id").eq("id", user.id).single();
  if (!producer?.stripe_customer_id) {
    return NextResponse.json({ error: "Producer account required." }, { status: 403 });
  }

  try {
    const pm = await getStripe().paymentMethods.retrieve(paymentMethodId);
    const owner = typeof pm.customer === "string" ? pm.customer : pm.customer?.id;
    if (owner !== producer.stripe_customer_id) {
      return NextResponse.json({ error: "That card isn't on your account." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unable to verify the card." }, { status: 400 });
  }

  await admin.from("producers").update({ stripe_payment_method_id: paymentMethodId }).eq("id", user.id);

  return NextResponse.json({ success: true });
}
