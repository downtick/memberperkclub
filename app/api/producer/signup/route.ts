import { NextRequest, NextResponse } from "next/server";
import { ProducerSignupSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendProducerSignupAdminNotice, sendProducerWelcomeEmail } from "@/lib/emails";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Free producer account creation. Creates a Supabase Auth user (no
// password — producers use magic-link login only, triggered client-side
// right after this call succeeds), a profiles row (role='producer'), and a
// producers row (billing_mode defaults to 'per_client'). Sends the
// back-end-only admin notification email — never shown on any page.
export async function POST(request: NextRequest) {
  if (!checkRateLimit(getClientIp(request)).allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = ProducerSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const {
    firstName, lastName, businessName, email, phone,
    addressLine1, addressLine2, city, state, postalCode,
  } = parsed.data;
  const admin = createAdminClient();

  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 409 });
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (createErr || !created.user) {
    console.error("Producer auth user create error:", createErr);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }

  const userId = created.user.id;

  // The handle_new_auth_user() trigger already inserted a bare profiles row;
  // fill in the producer's details here.
  await admin
    .from("profiles")
    .update({ role: "producer", first_name: firstName, last_name: lastName, phone, state })
    .eq("id", userId);

  await admin.from("producers").insert({
    id: userId,
    business_name: businessName,
    address_line1: addressLine1,
    address_line2: addressLine2 || null,
    city,
    state,
    postal_code: postalCode,
    billing_mode: "per_client",
  });

  await admin.from("member_events").insert({ member_id: userId, event: "joined", detail: { role: "producer" } });

  // The producer's own welcome — how the wholesale model works and, above all,
  // the link to add a payment method, without which they cannot enroll anyone.
  // No credentials here: they sign in with the magic link sent by the auth
  // provider immediately after this call.
  await sendProducerWelcomeEmail({
    to: email,
    firstName,
    businessName,
  }).catch((err) => console.error("Producer welcome email error:", err));

  await sendProducerSignupAdminNotice({
    firstName, lastName, businessName, email, phone,
    addressLine1, addressLine2: addressLine2 || undefined, city, state, postalCode,
  }).catch((err) => console.error("Producer admin notice error:", err));

  return NextResponse.json({ success: true, email });
}
