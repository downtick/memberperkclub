import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAccess } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import ResumeCheckoutButton from "@/components/ResumeCheckoutButton";

export const metadata: Metadata = { title: "Your membership", robots: { index: false } };
export const dynamic = "force-dynamic";

// Where a signed-in member WITHOUT access lands. Deliberately outside
// /dashboard: the dashboard layout requires access, so any status page inside
// it would redirect to itself forever. Three situations, three messages.
export default async function MembershipStatusPage() {
  const access = await getCurrentAccess();
  if (!access) redirect("/login");
  if (access.role === "admin") redirect("/admin");
  if (access.role === "producer") redirect("/producer/dashboard");
  if (access.has_access) redirect("/dashboard");

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

  // 1. Producer-provided membership whose one-year term has ended. The member
  //    cannot renew it themselves — their producer does — so point them there.
  if (access.plan === "producer_enrolled") {
    let agency: string | null = null;
    let contactEmail: string | null = null;
    if (access.producer_id) {
      const admin = createAdminClient();
      const [{ data: producer }, { data: producerProfile }] = await Promise.all([
        admin.from("producers").select("business_name").eq("id", access.producer_id).maybeSingle(),
        admin.from("profiles").select("email").eq("id", access.producer_id).maybeSingle(),
      ]);
      agency = producer?.business_name ?? null;
      contactEmail = producerProfile?.email ?? null;
    }
    return (
      <Shell title="Your membership has ended">
        <p>
          Your MemberPerkClub membership{agency ? <> through <strong>{agency}</strong></> : null}
          {fmt(access.expires_at) ? <> ended on <strong>{fmt(access.expires_at)}</strong></> : " has ended"}.
        </p>
        <p>
          Your membership was provided by {agency || "your insurance agency"}, so they are the one who
          can renew it.
          {contactEmail ? (
            <> Contact them at <a href={`mailto:${contactEmail}`} style={{ color: "var(--violet)", fontWeight: 600 }}>{contactEmail}</a>.</>
          ) : null}
        </p>
        <p style={{ color: "var(--ink-3)", fontSize: 14 }}>
          Prefer not to wait? You can also join on your own for $149 a year.
        </p>
        <ResumeCheckoutButton label="Join on my own — $149/year" />
      </Shell>
    );
  }

  // 2. Created an account but never completed payment.
  if (access.membership_status === "pending") {
    return (
      <Shell title="One step left">
        <p>Your account is set up — the last step is payment. Membership is $149 a year and renews automatically until you cancel.</p>
        <ResumeCheckoutButton label="Continue to payment — $149/year" />
      </Shell>
    );
  }

  // 3. A retail membership that lapsed or was cancelled.
  return (
    <Shell title="Your membership isn't active">
      <p>Your MemberPerkClub membership is no longer active. Rejoin to get your benefits back.</p>
      <ResumeCheckoutButton label="Rejoin — $149/year" />
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 620 }}>
        <div className="card p-6" style={{ display: "grid", gap: 14, lineHeight: 1.6 }}>
          <h1 className="display" style={{ fontSize: 30 }}>{title}</h1>
          {children}
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 8 }}>
            Questions? <Link href="/contact" style={{ color: "var(--violet)" }}>Contact us</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
