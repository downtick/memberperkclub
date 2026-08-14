import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/emails";

// Stripe webhook — retail ($149/yr subscription) lifecycle only. Producer
// enrollments are one-time PaymentIntents handled synchronously in
// /api/producer/enroll, not through this webhook.
export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 501 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency guard
  const { data: existing } = await admin.from("stripe_events").select("id").eq("id", event.id).maybeSingle();
  if (existing) return NextResponse.json({ received: true });
  await admin.from("stripe_events").insert({ id: event.id, type: event.type });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const profileId = session.metadata?.profile_id || (session.client_reference_id ?? undefined);
      if (!profileId) break;

      const subscription = session.subscription
        ? await getStripe().subscriptions.retrieve(session.subscription as string)
        : null;

      const { data: profile } = await admin
        .from("profiles")
        .update({
          role: "member",
          plan: "retail_annual",
          membership_status: "active",
          billing_source: "stripe",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription?.id ?? null,
          current_period_end: subscription
            ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
            : null,
        })
        .eq("id", profileId)
        .select()
        .single();

      await admin.from("member_events").insert({
        member_id: profileId,
        event: "joined",
        detail: { stripe_event: event.id, plan: "retail_annual" },
      });

      if (profile) {
        await sendWelcomeEmail({
          to: profile.email,
          firstName: profile.first_name || "",
          memberNumber: profile.member_number || "",
        }).catch((err) => console.error("Welcome email error:", err));
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "lapsed";
      await admin
        .from("profiles")
        .update({
          membership_status: status,
          current_period_end: new Date(sub.items.data[0].current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: profile } = await admin
        .from("profiles")
        .update({ membership_status: "canceled" })
        .eq("stripe_subscription_id", sub.id)
        .select()
        .single();
      if (profile) {
        await admin.from("member_events").insert({ member_id: profile.id, event: "canceled", detail: { stripe_event: event.id } });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as unknown as { subscription?: string }).subscription;
      if (subId) {
        const { data: profile } = await admin
          .from("profiles")
          .update({ membership_status: "past_due" })
          .eq("stripe_subscription_id", subId)
          .select()
          .single();
        if (profile) {
          await admin.from("member_events").insert({ member_id: profile.id, event: "payment_failed", detail: { stripe_event: event.id } });
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
