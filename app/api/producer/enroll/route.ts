import { NextRequest, NextResponse } from "next/server";
import { ClientEnrollSchema } from "@/lib/schemas";
import { getStripe, PRODUCER_ENROLLMENT_FEE_CENTS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/emails";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// The core producer-enrollment action: an instant ONE-TIME $12 charge to
// the producer's saved card (a PaymentIntent off the saved payment method,
// NOT a subscription) that creates a new member with a fixed 1-year,
// non-auto-renewing term. Non-refundable — fully earned at time of
// purchase. No commission is ever paid to the producer.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: producerProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!producerProfile || (producerProfile.role !== "producer" && producerProfile.role !== "admin")) {
    return NextResponse.json({ error: "Producer account required." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = ClientEnrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, phone, state } = parsed.data;
  const admin = createAdminClient();

  const { data: producer } = await admin.from("producers").select("*").eq("id", user.id).single();
  if (!producer?.stripe_customer_id || !producer?.stripe_payment_method_id) {
    return NextResponse.json(
      { error: "Add a payment method before enrolling clients." },
      { status: 400 }
    );
  }

  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "A member with this email already exists." }, { status: 409 });
  }

  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRODUCER_ENROLLMENT_FEE_CENTS,
      currency: "usd",
      customer: producer.stripe_customer_id,
      payment_method: producer.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      description: `MemberPerkClub client enrollment — ${firstName} ${lastName}`,
      metadata: { producer_id: user.id, client_email: email },
    });

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment could not be completed." }, { status: 402 });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createErr || !created.user) {
      console.error("Enroll auth user create error:", createErr);
      return NextResponse.json({ error: "Payment succeeded but account creation failed. Contact support." }, { status: 500 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ONE_YEAR_MS);

    const { data: memberProfile } = await admin
      .from("profiles")
      .update({
        role: "member",
        first_name: firstName,
        last_name: lastName,
        phone,
        state,
        plan: "producer_enrolled",
        membership_status: "active",
        billing_source: "producer",
        producer_id: user.id,
        enrolled_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        current_period_end: expiresAt.toISOString(),
      })
      .eq("id", created.user.id)
      .select()
      .single();

    await admin.from("member_events").insert({
      member_id: created.user.id,
      actor_id: user.id,
      event: "joined",
      detail: { plan: "producer_enrolled", stripe_payment_intent: paymentIntent.id, amount: PRODUCER_ENROLLMENT_FEE_CENTS },
    });

    if (memberProfile) {
      await sendWelcomeEmail({
        to: memberProfile.email,
        firstName: memberProfile.first_name || "",
        memberNumber: memberProfile.member_number || "",
      }).catch((err) => console.error("Welcome email error:", err));
    }

    return NextResponse.json({ success: true, memberNumber: memberProfile?.member_number });
  } catch (err) {
    console.error("Producer enroll error:", err);
    return NextResponse.json({ error: "Unable to process enrollment." }, { status: 500 });
  }
}
