import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendyConfigured, prospectListId } from "@/lib/sendy";
import { sendyStatus, subscribeWithConsent } from "@/lib/sendyConsent";

const Body = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().max(80).optional().default(""),
});

// Outcome codes the capture page renders. "sent" means Sendy accepted the
// subscription, which triggers the list's autoresponder — Sendy sends the
// welcome within a few minutes, on its own schedule.
type Outcome =
  | "sent"
  | "already_on_list"
  | "previously_unsubscribed"
  | "already_producer"
  | "error";

// Admin-only: adds a prospect met in person (e.g. at a convention) to the
// Sendy "Producer prospects" list.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const admin = createAdminClient();
  const { data: actor } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (actor?.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  if (!sendyConfigured()) {
    return NextResponse.json(
      { outcome: "error" as Outcome, error: "Sendy isn't configured yet (SENDY_URL, SENDY_API_KEY, SENDY_PROSPECT_LIST_ID)." },
      { status: 503 }
    );
  }

  let parsed;
  try {
    parsed = Body.safeParse(await request.json());
  } catch {
    return NextResponse.json({ outcome: "error" as Outcome, error: "Invalid request." }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ outcome: "error" as Outcome, error: "That doesn't look like a valid email." }, { status: 400 });
  }
  const { email, name } = parsed.data;

  // Already a producer? Sending them "here's how to sign up" would be noise.
  const { data: existing } = await admin
    .from("profiles")
    .select("role")
    .eq("email", email)
    .maybeSingle();
  if (existing?.role === "producer") {
    return NextResponse.json({ outcome: "already_producer" as Outcome });
  }

  const listId = prospectListId();
  try {
    // Sendy's /subscribe silently RE-ACTIVATES an address that unsubscribed,
    // bounced or complained. For a list built from convention badges that is
    // both a legal problem (ignoring an opt-out) and a deliverability one, so
    // this goes through the shared consent module in lead mode, which leaves
    // opted-out addresses off. An unreadable status is reported as an error
    // (not "unsubscribed") so the capture page keeps the entry queued to retry.
    if ((await sendyStatus(email, listId)) === null) {
      return NextResponse.json({ outcome: "error" as Outcome, error: "Could not reach Sendy." }, { status: 502 });
    }
    const result = await subscribeWithConsent({ email, name, listId, mode: "lead" });
    if (result === "subscribed") return NextResponse.json({ outcome: "sent" as Outcome });
    if (result === "already") return NextResponse.json({ outcome: "already_on_list" as Outcome });
    if (result === "skipped") return NextResponse.json({ outcome: "previously_unsubscribed" as Outcome });
    return NextResponse.json({ outcome: "error" as Outcome, error: "Sendy rejected the subscribe (see logs)." }, { status: 502 });
  } catch (err) {
    console.error("[sendy] request failed:", err);
    return NextResponse.json({ outcome: "error" as Outcome, error: "Could not reach Sendy." }, { status: 502 });
  }
}
