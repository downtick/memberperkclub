import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/emails";

// One resend per member per 5 minutes. Checked against member_events rather
// than lib/rate-limit.ts: that limiter is in-memory per serverless instance,
// so on Vercel it resets between requests and would not stop a spammed button.
const THROTTLE_MS = 5 * 60 * 1000;

// Lets a producer re-send the welcome email (with a fresh set-password link)
// to a client THEY enrolled. The ownership check below is the whole point of
// this route: without it any producer could trigger mail to any member.
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

  const { data: actor } = await admin.from("profiles").select("id, role").eq("id", user.id).single();
  if (!actor || (actor.role !== "producer" && actor.role !== "admin")) {
    return NextResponse.json({ error: "Producer account required." }, { status: 403 });
  }

  const { data: member } = await admin
    .from("profiles")
    .select("id, email, first_name, member_number, producer_id")
    .eq("id", memberId)
    .maybeSingle();

  // Same response for "doesn't exist" and "not yours", so this route cannot
  // be used to probe which member ids exist.
  if (!member || (actor.role !== "admin" && member.producer_id !== actor.id)) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  const since = new Date(Date.now() - THROTTLE_MS).toISOString();
  const { count } = await admin
    .from("member_events")
    .select("id", { count: "exact", head: true })
    .eq("member_id", member.id)
    .eq("event", "welcome_resent")
    .gte("created_at", since);
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "A welcome email was just sent to this client. Please wait a few minutes before sending another." },
      { status: 429 }
    );
  }

  let setPasswordLink: string | undefined;
  try {
    const { data: link } = await admin.auth.admin.generateLink({ type: "recovery", email: member.email });
    setPasswordLink = link?.properties?.action_link;
  } catch (err) {
    console.error("Resend: set-password link error:", err);
  }

  const result = await sendWelcomeEmail({
    to: member.email,
    firstName: member.first_name || "",
    memberNumber: member.member_number || "",
    setPasswordLink,
  });

  // Recorded even on failure, so the throttle also stops rapid retries
  // against a broken mail config, and the audit trail shows what happened.
  await admin.from("member_events").insert({
    member_id: member.id,
    actor_id: actor.id,
    event: "welcome_resent",
    detail: { ok: result.ok, error: result.ok ? null : (result.error || "").slice(0, 300) },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "The email could not be sent. Please try again later or contact us." },
      { status: 502 }
    );
  }
  return NextResponse.json({ success: true, sentTo: member.email });
}
