import Link from "next/link";
import { requireActiveMember } from "@/lib/access";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireActiveMember();

  return (
    <section className="section" style={{ borderBottom: 0 }}>
      <div className="wrap">
        <div className="app">
          <div className="appbar">
            <div className="tabs" style={{ border: 0, margin: 0, flex: 1 }}>
              <Link href="/dashboard" className="tab">Overview</Link>
              <Link href="/dashboard/perks" className="tab">Benefits</Link>
              <Link href="/dashboard/articles" className="tab">Guides</Link>
              {/* Producer-provided members never see billing — no price, no cancel control. */}
              {profile.plan !== "producer_enrolled" && (
                <Link href="/dashboard/billing" className="tab">Billing</Link>
              )}
              <Link href="/dashboard/settings" className="tab">Settings</Link>
            </div>
          </div>
          <div className="appbody">{children}</div>
        </div>
      </div>
    </section>
  );
}
