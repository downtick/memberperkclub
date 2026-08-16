import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { SITE } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "You're unsubscribed",
  description: "You've been removed from the member email list.",
  robots: { index: false, follow: false },
};

// Landing page for Sendy's per-list "unsubscribe redirect" setting.
// Someone arrives here having already been removed — the job of this page is
// to tell them what they just gave up (and what they didn't), not to argue.
export default function UnsubscribedPage() {
  return (
    <section className="section">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <span className="icbox" style={{ marginBottom: 18 }}><Icon name="check" /></span>

        <h1 className="display" style={{ fontSize: 34, marginBottom: 14 }}>
          You&rsquo;re unsubscribed
        </h1>

        <p style={{ fontSize: 18, marginBottom: 26 }}>
          We&rsquo;ve removed you from the {SITE.name} member email list. You won&rsquo;t
          get any more updates from us about new benefits or new guides.
        </p>

        <div className="card p-6" style={{ marginBottom: 26 }}>
          <h2 className="display" style={{ fontSize: 20, marginBottom: 10 }}>
            Your membership is still active
          </h2>
          <p style={{ marginBottom: 14 }}>
            Unsubscribing only stops the emails. It does not cancel your membership,
            and nothing behind the login has changed &mdash; every benefit, discount
            code, and printable guide is exactly where it was.
          </p>
          <p style={{ marginBottom: 18 }}>
            We add new benefits and articles throughout the year. Since you won&rsquo;t
            hear about them by email now, sign in whenever you like and check the
            dashboard &mdash; anything new is listed there first.
          </p>
          <Link href="/login" className="btn-primary">Sign in to your account</Link>
        </div>

        <div className="card p-6" style={{ marginBottom: 26 }}>
          <h2 className="display" style={{ fontSize: 20, marginBottom: 10 }}>
            A few emails will still reach you
          </h2>
          <p>
            Messages about your own account &mdash; your welcome email, password
            resets, receipts, and renewal notices &mdash; aren&rsquo;t marketing, so
            they keep sending. Without them you could be locked out of something
            you paid for. There are only a handful, and they only go out when
            something happens on your account.
          </p>
        </div>

        <p className="text-sm text-[var(--ink-3)]">
          Changed your mind, or unsubscribed by accident?{" "}
          <Link href="/contact" style={{ color: "var(--violet)", fontWeight: 600 }}>
            Let us know
          </Link>{" "}
          and we&rsquo;ll add you back.
        </p>
      </div>
    </section>
  );
}
