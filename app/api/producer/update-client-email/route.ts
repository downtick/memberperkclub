import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BodySchema = z.object({
  memberId: z.string().min(1),
  email: z.string().email("A valid email is required").max(255).trim().toLowerCase(),
});

// Lets a producer correct the email on a client THEY enrolled — the common
// case being a typo taken down over the phone, which leaves the member unable
// to receive their sign-in link.
//
// Two guards carry this route. The ownership check stops a producer touching
// anyone else's member, and the plan check stops a producer changing the login
// of a member who has since bought their own retail membership and now owns
// that account. Admins bypass both.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.email?.[0] || "Invalid request." },
      { status: 400 }
    );
  }
  const { memberId, email } = parsed.data;

  const admin = createAdminClient();

  const { data: actor } = await admin.from("profiles").select("id, role").eq("id", user.id).single();
  if (!actor || (actor.role !== "producer" && actor.role !== "admin")) {
    return NextResponse.json({ error: "Producer account required." }, { status: 403 });
  }

  const { data: member } = await admin
    .from("profiles")
    .select("id, email, first_name, plan, producer_id")
    .eq("id", memberId)
    .maybeSingle();

  // Identical response for "doesn't exist" and "not yours", so this cannot be
  // used to probe which member ids exist.
  if (!member || (actor.role !== "admin" && member.producer_id !== actor.id)) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  if (actor.role !== "admin" && member.plan !== "producer_enrolled") {
    return NextResponse.json(
      { error: "This member now manages their own account, so their email can only be changed by them." },
      { status: 403 }
    );
  }

  if (member.email?.toLowerCase() === email) {
    return NextResponse.json({ error: "That is already their email address." }, { status: 400 });
  }

  const { data: clash } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .neq("id", member.id)
    .maybeSingle();
  if (clash) {
    return NextResponse.json(
      { error: "Another account already uses that email address." },
      { status: 409 }
    );
  }

  const previousEmail = member.email;

  // email_confirm marks the new address confirmed immediately. Without it the
  // member would be stuck waiting on a confirmation mail sent to an address
  // that may itself be the typo being fixed.
  const { error: authError } = await admin.auth.admin.updateUserById(member.id, {
    email,
    email_confirm: true,
  });
  if (authError) {
    console.error("Client email change (auth) error:", authError);
    return NextResponse.json({ error: "The email could not be updated." }, { status: 500 });
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ email })
    .eq("id", member.id);
  if (profileError) {
    // The auth record moved but the profile did not, so the two are now out of
    // step. Say so plainly rather than reporting success.
    console.error("Client email change (profile) error:", profileError);
    return NextResponse.json(
      { error: "The login email changed but the member record did not update. Please contact us." },
      { status: 500 }
    );
  }

  await admin.from("member_events").insert({
    member_id: member.id,
    actor_id: actor.id,
    event: "email_changed",
    detail: { from: previousEmail, to: email, by: actor.role },
  });

  return NextResponse.json({
    success: true,
    email,
    previousEmail,
    firstName: member.first_name || "",
  });
}
