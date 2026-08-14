import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/access";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const profile = await requireActiveMember();

  // Producer-enrolled members never see what was paid and can't manage
  // billing themselves — bounce them to settings instead. (The dashboard
  // nav already hides this link for them; this is the server-side backstop.)
  if (profile.plan === "producer_enrolled") {
    redirect("/dashboard/settings");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl mb-2">Billing</h1>
      <p className="text-[var(--ink-3)] mb-8">
        Manage your payment method, view receipts, or cancel your membership.
      </p>

      <div className="card p-6 mb-6">
        <p className="text-sm text-[var(--ink-3)] mb-1">Plan</p>
        <p className="font-semibold mb-4">Retail Membership — $149/year, auto-renewing</p>
        <p className="text-sm text-[var(--ink-3)] mb-1">Next renewal</p>
        <p className="font-semibold mb-4">
          {profile.current_period_end
            ? new Date(profile.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "—"}
        </p>
        <form action="/api/stripe/portal" method="POST">
          <button type="submit" className="btn-dark">Manage billing &amp; cancel (Stripe)</button>
        </form>
      </div>

      <p className="text-xs text-[var(--ink-3)]">
        Free cancellation within 7 days of your original signup date for a full refund. After that
        window, membership fees are non-refundable, but you can cancel future renewals anytime
        from this page.
      </p>
    </div>
  );
}
