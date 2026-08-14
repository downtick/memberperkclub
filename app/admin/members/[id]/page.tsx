import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminMemberActions from "@/components/admin/AdminMemberActions";
import { memberNumberLabel } from "@/lib/membership";
import type { Profile, MemberEvent } from "@/lib/types";

const EVENT_LABELS: Record<string, string> = {
  joined: "Joined",
  member_created_by_admin: "Created by admin",
  welcome_email_sent: "Welcome email sent",
  payment_succeeded: "Payment succeeded",
  payment_failed: "Payment failed",
  renewed: "Renewed",
  plan_changed: "Plan changed",
  canceled: "Canceled",
  lapsed: "Lapsed",
  free_days_granted: "Free days granted",
  comp_started: "Comp started",
  comp_ended: "Comp ended",
  status_set: "Status changed",
  admin_granted: "Admin access granted",
  admin_revoked: "Admin access revoked",
};

export default async function AdminMemberDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!member) notFound();

  const { data: events } = await supabase
    .from("member_events")
    .select("*")
    .eq("member_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  const m = member as Profile;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="text-3xl mb-1">{[m.first_name, m.last_name].filter(Boolean).join(" ") || m.email}</h1>
        <p className="text-[var(--ink-3)] mb-6">{m.email} · {memberNumberLabel(m.member_number)}</p>

        <div className="card p-5 mb-6 space-y-2 text-sm">
          <p><span className="text-[var(--ink-3)]">Role:</span> <span className="capitalize font-semibold">{m.role}</span></p>
          <p><span className="text-[var(--ink-3)]">Plan:</span> <span className="font-semibold">{m.plan === "producer_enrolled" ? "Producer-enrolled" : m.plan || "—"}</span></p>
          <p><span className="text-[var(--ink-3)]">Status:</span> <span className="font-semibold capitalize">{m.membership_status}</span></p>
          <p><span className="text-[var(--ink-3)]">Billing source:</span> <span className="font-semibold capitalize">{m.billing_source}</span></p>
          <p><span className="text-[var(--ink-3)]">Comp until:</span> {m.comp_until ? new Date(m.comp_until).toLocaleDateString() : "—"}</p>
          <p><span className="text-[var(--ink-3)]">Current period end:</span> {m.current_period_end ? new Date(m.current_period_end).toLocaleDateString() : "—"}</p>
          <p><span className="text-[var(--ink-3)]">Producer:</span> {m.producer_id || "—"}</p>
          <p><span className="text-[var(--ink-3)]">Joined:</span> {new Date(m.created_at).toLocaleDateString()}</p>
        </div>

        <AdminMemberActions member={m} />
      </div>

      <div>
        <h2 className="text-xl mb-4">Timeline</h2>
        <div className="space-y-3">
          {(events ?? []).map((e: MemberEvent) => (
            <div key={e.id} className="card p-4">
              <p className="font-semibold text-sm">{EVENT_LABELS[e.event] || e.event}</p>
              {e.detail && <p className="text-xs text-[var(--ink-3)] mt-1">{JSON.stringify(e.detail)}</p>}
              <p className="text-xs text-[var(--ink-3)] mt-1">{new Date(e.created_at).toLocaleString()}{e.actor_id ? " · by admin" : ""}</p>
            </div>
          ))}
          {(!events || events.length === 0) && <p className="text-sm text-[var(--ink-3)]">No events yet.</p>}
        </div>
      </div>
    </div>
  );
}
