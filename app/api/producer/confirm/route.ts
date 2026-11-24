import { NextRequest, NextResponse } from "next/server";
import { ProducerSignupSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendProducerSignupAdminNotice, sendProducerWelcomeEmail } from "@/lib/emails";
import { verifySignupToken } from "@/lib/signupToken";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://memberperkclub.com";

// Step 2 of producer self-signup: the link from the confirmation email.
// A valid, unexpired token proves the clicker controls the inbox, so this is
// where the account is created (once) and the producer is signed in. Link
// scanners that open the URL first just create the account early; the real
// click still signs the producer in because the account-exists path signs in
// too.
export async function GET(request: NextRequest) {
  const raw = verifySignupToken<Record<string, unknown>>(request.nextUrl.searchParams.get("t"));
  const parsed = raw ? ProducerSignupSchema.safeParse(raw) : null;
  if (!parsed?.success) {
    return NextResponse.redirect(`${SITE_URL}/producer-signup?expired=1`);
  }

  const {
    firstName, lastName, businessName, email, phone,
    addressLine1, addressLine2, city, state, postalCode,
    referrer, pageUrl,
  } = parsed.data;
  const admin = createAdminClient();

  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();

  if (!existing) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createErr || !created.user) {
      // A concurrent click may have just created it; fall through to sign-in
      // only if the profile now exists.
      const { data: again } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
      if (!again) {
        console.error("Producer auth user create error:", createErr);
        return NextResponse.redirect(`${SITE_URL}/producer-signup?failed=1`);
      }
    } else {
      const userId = created.user.id;

      // The handle_new_auth_user() trigger already inserted a bare profiles
      // row; fill in the producer's details here.
      const { data: producerProfile } = await admin
        .from("profiles")
        .update({ role: "producer", first_name: firstName, last_name: lastName, phone, state })
        .eq("id", userId)
        .select("member_number")
        .single();

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

      await sendProducerWelcomeEmail({ to: email, firstName, businessName, signedIn: true })
        .catch((err) => console.error("Producer welcome email error:", err));

      await sendProducerSignupAdminNotice({
        firstName, lastName, businessName, email, phone,
        addressLine1, addressLine2: addressLine2 || undefined, city, state, postalCode,
        memberNumber: producerProfile?.member_number ?? undefined,
        referrer, pageUrl,
      }).catch((err) => console.error("Producer admin notice error:", err));
    }
  }

  // Sign the producer in on this browser: mint a one-time magic-link token
  // server-side and redeem it immediately, which sets the session cookies.
  try {
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (linkErr || !link?.properties?.hashed_token) throw linkErr || new Error("No token");
    const supabase = await createClient();
    const { error: otpErr } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: link.properties.hashed_token,
    });
    if (otpErr) throw otpErr;
  } catch (err) {
    console.error("Producer confirm sign-in error:", err);
    return NextResponse.redirect(`${SITE_URL}/login`);
  }

  return NextResponse.redirect(`${SITE_URL}/post-login`);
}
