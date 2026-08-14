import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/access";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin — MemberPerkClub" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <section className="section" style={{ borderBottom: 0 }}>
      <div className="wrap">
        <div className="app">
          <div className="appbar">
            <div className="tabs" style={{ border: 0, margin: 0, flex: 1 }}>
              <Link href="/admin" className="tab">Overview</Link>
              <Link href="/admin/members" className="tab">Members</Link>
              <Link href="/admin/producers" className="tab">Producers</Link>
              <Link href="/admin/resources" className="tab">Benefits</Link>
              <Link href="/admin/articles" className="tab">Guides</Link>
              <Link href="/admin/audit" className="tab">Audit log</Link>
            </div>
          </div>
          <div className="appbody">{children}</div>
        </div>
      </div>
    </section>
  );
}
