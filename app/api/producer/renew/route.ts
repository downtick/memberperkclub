import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, PRODUCER_ENROLLMENT_FEE_CENTS, logStripeError } from "@/lib/stripe";
import { canRenew, nextExpiry, RENEWAL_WINDOW_DAYS } from "@/lib/producer";
import {
  sendProducerRenewalConfirmation,
  sendMemberRenewedEmail,
  sendMemberAdminNotice,
} from "@/lib/emails";

// Producer renews one of their clients for another year at the $12 wholesale
// rate, charged off-session to their saved card — same mechanics as
// enrollment. Ownership-checked; double-charge-proof via a Stripe idempotency
// key tied to the member AND their current end date.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let memberId: unknown;
  try {
    ({ memberId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof memberId !== "string" || !memberId) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: actor } = await admin
    .from("profiles")
    .select("id, role, email, first_name, last_name")
    .eq("id", user.id)
    .single();
  if (!actor || (actor.role !== "producer" && actor.role !== "admin")) {
    return NextResponse.json({ error: "Producer account required." }, { status: 403 });
  }

  const { data: member } = await admin
    .from("profiles")
    .select("id, email, first_name, last_name, phone, state, member_number, plan, producer_id, expires_at")
    .eq("id", memberId)
    .maybeSingle();
  // Same answer for "doesn't exist" and "not yours" — no probing member ids.
  if (!member || (actor.role !== "admin" && member.producer_id !== actor.id)) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }
  if (member.plan !== "producer_enrolled" || !member.producer_id) {
    return NextResponse.json({ error: "Only producer-provided memberships can be renewed here." }, { status: 400 });
  }
  if (!canRenew(member.expires_at)) {
    return NextResponse.json(
      { error: `Renewal opens ${RENEWAL_WINDOW_DAYS} days before the membership ends.` },
      { status: 409 }
    );
  }

  // The card that pays is the PRODUCER's who owns the client (an admin
  // renewing on a producer's behalf still bills that producer).
  const { data: producer } = await admin
    .from("producers")
    .select("business_name, stripe_customer_id, stripe_payment_method_id")
    .eq("id", member.producer_id)
    .single();
  if (!producer?.stripe_customer_id || !producer?.stripe_payment_method_id) {
    return NextResponse.json({ error: "Add a payment method before renewing clients." }, { status: 400 });
  }

  const previousExpiresAt = member.expires_at;
  const newExpiresAt = nextExpiry(previousExpiresAt).toISOString();

  let paymentIntentId: string;
  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: PRODUCER_ENROLLMENT_FEE_CENTS,
        currency: "usd",
        customer: producer.stripe_customer_id,
        payment_method: producer.stripe_payment_method_id,
        off_session: true,
        confirm: true,
        description: `MemberPerkClub renewal — ${[member.first_name, member.last_name].filter(Boolean).join(" ")}`,
        metadata: { producer_id: member.producer_id, member_id: member.id, kind: "renewal" },
      },
      // A double-click or retry for the SAME term returns the same
      // PaymentIntent instead of charging twice. After a successful renewal
      // expires_at changes, so the next year's renewal gets a fresh key.
      { idempotencyKey: `renew-${member.id}-${previousExpiresAt ?? "none"}` }
    );
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment could not be completed." }, { status: 402 });
    }
    paymentIntentId = paymentIntent.id;
  } catch (err) {
    const friendly = logStripeError("producer renew", err);
    return NextResponse.json({ error: friendly || "Unable to process renewal." }, { status: 500 });
  }

  await admin
    .from("profiles")
    .update({ membership_status: "active", expires_at: newExpiresAt, current_period_end: newExpiresAt })
    .eq("id", member.id);

  await admin.from("member_events").insert({
    member_id: member.id,
    actor_id: actor.id,
    event: "renewed",
    detail: {
      stripe_payment_intent: paymentIntentId,
      amount: PRODUCER_ENROLLMENT_FEE_CENTS,
      previous_expires_at: previousExpiresAt,
      new_expires_at: newExpiresAt,
    },
  });

  const clientName = [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email;
  const { data: owner } = await admin
    .from("profiles").select("email, first_name, last_name").eq("id", member.producer_id).single();

  await Promise.allSettled([
    owner && sendProducerRenewalConfirmation({
      to: owner.email, producerFirstName: owner.first_name || "", clientName,
      memberNumber: member.member_number || "", newExpiresAt,
    }),
    sendMemberRenewedEmail({
      to: member.email, firstName: member.first_name || "", agency: producer.business_name ?? null, newExpiresAt,
    }),
    sendMemberAdminNotice({
      event: "renewed",
      member: {
        firstName: member.first_name, lastName: member.last_name, email: member.email,
        phone: member.phone, state: member.state, memberNumber: member.member_number,
      },
      expiresAt: newExpiresAt,
      previousExpiresAt,
      producer: {
        businessName: producer.business_name,
        name: owner ? [owner.first_name, owner.last_name].filter(Boolean).join(" ") : null,
        email: owner?.email ?? null,
      },
      payment: { amountCents: PRODUCER_ENROLLMENT_FEE_CENTS, reference: paymentIntentId },
    }),
  ]);

  return NextResponse.json({ success: true, newExpiresAt });
}
