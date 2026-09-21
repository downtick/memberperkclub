import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendProducerExpiryReminder } from "@/lib/emails";

export const dynamic = "force-dynamic";

const DAY = 86400000;

// Daily (vercel.json). Emails each producer ONE digest of their clients whose
// membership ends within 30 days, and again inside the last 7. Each reminder
// is recorded against the member WITH the end date it was about, so:
//   - the same reminder never goes twice for the same term, and
//   - after a renewal (new end date) the next year's reminders fire again.
// Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Without the secret
// configured this refuses to run — fail closed, never open to the world.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const horizon = new Date(now.getTime() + 30 * DAY);

  const { data: members, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, email, member_number, producer_id, expires_at")
    .eq("plan", "producer_enrolled")
    .eq("membership_status", "active")
    .not("producer_id", "is", null)
    .gt("expires_at", now.toISOString())
    .lte("expires_at", horizon.toISOString());
  if (error) {
    console.error("[cron] expiry query failed:", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
  if (!members?.length) return NextResponse.json({ reminded: 0, producers: 0 });

  const { data: sent } = await admin
    .from("member_events")
    .select("member_id, event, detail")
    .in("member_id", members.map((m) => m.id))
    .in("event", ["expiry_reminder_30", "expiry_reminder_7"]);

  type Due = { id: string; name: string; memberNumber: string; expiresAt: string; daysLeft: number; event: string };
  const byProducer = new Map<string, Due[]>();

  for (const m of members) {
    const daysLeft = Math.ceil((new Date(m.expires_at!).getTime() - now.getTime()) / DAY);
    const event = daysLeft <= 7 ? "expiry_reminder_7" : "expiry_reminder_30";
    const already = (sent ?? []).some(
      (e) => e.member_id === m.id && e.event === event && (e.detail as { expires_at?: string } | null)?.expires_at === m.expires_at
    );
    if (already) continue;
    const list = byProducer.get(m.producer_id!) ?? [];
    list.push({
      id: m.id,
      name: [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email,
      memberNumber: m.member_number || "",
      expiresAt: m.expires_at!,
      daysLeft,
      event,
    });
    byProducer.set(m.producer_id!, list);
  }

  let reminded = 0;
  let producers = 0;
  for (const [producerId, due] of byProducer) {
    const { data: p } = await admin.from("profiles").select("email, first_name").eq("id", producerId).single();
    if (!p?.email) continue;
    const res = await sendProducerExpiryReminder({
      to: p.email,
      producerFirstName: p.first_name || "",
      clients: due.sort((a, b) => a.daysLeft - b.daysLeft),
    });
    // Record only what actually went out, so a failed send retries tomorrow.
    if (res.ok) {
      producers++;
      reminded += due.length;
      await admin.from("member_events").insert(
        due.map((d) => ({
          member_id: d.id,
          actor_id: null,
          event: d.event,
          detail: { expires_at: d.expiresAt, days_left: d.daysLeft },
        }))
      );
    }
  }

  return NextResponse.json({ reminded, producers });
}
