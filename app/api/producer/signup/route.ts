import { NextRequest, NextResponse } from "next/server";
import { ProducerSignupSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendProducerConfirmEmail, sendProducerAlreadyRegisteredEmail } from "@/lib/emails";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSignupToken } from "@/lib/signupToken";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://memberperkclub.com";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Step 1 of producer self-signup. Validates the form and emails a
// confirmation (magic) link. NOTHING is created here: the account is created
// only when the link is clicked (/api/producer/confirm), which proves the
// person controls the inbox. The response is the same whether or not the
// email is already registered, so the form cannot be used to probe accounts.
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
    referrer, pageUrl,
  } = parsed.data;

  const admin = createAdminClient();
  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();

  const result = existing
    ? await sendProducerAlreadyRegisteredEmail({ to: email })
    : await sendProducerConfirmEmail({
        to: email,
        firstName,
        link: `${SITE_URL}/api/producer/confirm?t=${createSignupToken({
          firstName, lastName, businessName, email, phone,
          addressLine1, addressLine2: addressLine2 || "", city, state, postalCode,
          referrer, pageUrl,
        })}`,
      });

  if (!result.ok) {
    console.error("Producer signup email error:", result.error);
    return NextResponse.json({ error: "We couldn't send the confirmation email. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true, email });
}
