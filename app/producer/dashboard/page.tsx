import Link from "next/link";
import type { Metadata } from "next";
import { requireProducer } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { memberNumberDigits } from "@/lib/membership";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Producer portal" };

function statusPill(m: Profile) {
  const now = new Date();
  const hasAccess =
    m.membership_status === "active" ||
    m.membership_status === "past_due" ||
    (m.comp_until && new Date(m.comp_until) > now);

  if (!hasAccess) return <span className="pill off">Lapsed</span>;

  const expiry = m.expires_at ? new Date(m.expires_at) : null;
  const daysLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / 86400000) : null;
  if (daysLeft !== null && daysLeft <= 30) return <span className="pill soon">Expires soon</span>;
  return <span className="pill on">Active</span>;
}

export default async function ProducerDashboard() {
  const profile = await requireProducer();
  const supabase = await createClient();

  const { data: producer } = await supabase.from("producers").select("*").eq("id", profile.id).maybeSingle();
  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("producer_id", profile.id)
    .order("created_at", { ascending: false });

  const hasPaymentMethod = !!producer?.stripe_payment_method_id;
  const list = (clients ?? []) as Profile[];

  const now = new Date();
  const expiringSoon = list.filter((c) => {
    if (!c.expires_at) return false;
    const d = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    return d > 0 && d <= 30;
  }).length;

  return (
    <div>
      <div className="welcome">
        <div>
          <h1 className="display" style={{ fontSize: 28 }}>{producer?.business_name || "Producer portal"}</h1>
          <p style={{ fontSize: 14, color: "var(--ink-2)" }}>
            {list.length} membership{list.length === 1 ? "" : "s"} given
          </p>
        </div>
        <div className="status">
          {expiringSoon > 0 && (
            <span className="pill soon">
              {expiringSoon} membership{expiringSoon === 1 ? "" : "s"} expire in 30 days
            </span>
          )}
          <Link href="/producer/enroll" className="btn btn-primary">Enroll a client</Link>
        </div>
      </div>

      {!hasPaymentMethod && (
        <div className="note" style={{ marginBottom: 24 }}>
          <strong>Add a payment method to start enrolling clients.</strong> You add it once — it&apos;s
          only charged $12 when you actively enroll someone.{" "}
          <Link href="/producer/payment-method" style={{ color: "var(--violet)", fontWeight: 600 }}>Add a payment method</Link>
        </div>
      )}

      <div className="card scroller" style={{ padding: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Member no.</th>
              <th>State</th>
              <th>Enrolled</th>
              <th>Expires</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.email}</td>
                <td className="mono">{memberNumberDigits(c.member_number)}</td>
                <td>{c.state || "—"}</td>
                <td>{c.enrolled_at ? new Date(c.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—"}</td>
                <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—"}</td>
                <td>{statusPill(c)}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--ink-3)" }}>
                  No memberships given yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
