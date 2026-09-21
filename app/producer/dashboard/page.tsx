import Link from "next/link";
import type { Metadata } from "next";
import { requireProducer } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  // Service-role read, on purpose. RLS on profiles allows only "own row" and
  // "admins", so the user-scoped client returned ZERO clients here and the
  // dashboard said "No memberships given yet" after a successful enrollment.
  // A producer-reads-their-clients policy was the other option, but RLS cannot
  // restrict columns and would have handed producers every field of every
  // client row. This stays safe because the filter is the authenticated
  // producer's own id from requireProducer() — never request input — and the
  // select names only what the table below renders.
  const admin = createAdminClient();
  const { data: clients } = await admin
    .from("profiles")
    .select("id, first_name, last_name, email, member_number, state, enrolled_at, expires_at, membership_status, comp_until, created_at")
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
          {hasPaymentMethod ? (
            <Link href="/producer/enroll" className="btn btn-primary">Enroll a client</Link>
          ) : (
            <Link href="/producer/payment-method" className="btn btn-primary">Add a payment method</Link>
          )}
        </div>
      </div>

      {/* A producer with no card cannot enroll anyone, so this is the first
          step, not a footnote. It used to be a one-line .note with a small
          inline link, and it went unnoticed in real use. */}
      {!hasPaymentMethod && (
        <div className="startcard" style={{ marginBottom: 24 }}>
          <span className="startbadge">
            Start here <span className="nudge" aria-hidden="true">&rarr;</span>
          </span>
          <h2 className="display" style={{ fontSize: 22, margin: "10px 0 6px" }}>
            Step 1: Add a payment method
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 18px", lineHeight: 1.6 }}>
            You only do this once, and you can&apos;t enroll clients until it&apos;s done. Your card
            is stored by Stripe, never by us, and it&apos;s charged $12 only when you choose to
            enroll a client &mdash; never automatically.
          </p>
          <Link href="/producer/payment-method" className="btn btn-primary">
            Add a payment method <span className="nudge" aria-hidden="true">&rarr;</span>
          </Link>
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
