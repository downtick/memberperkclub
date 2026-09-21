import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { BENEFIT_HIGHLIGHTS } from "@/lib/producerGuide";

// SEO landing page for agents/brokers searching for add-on / ancillary
// products and ways to earn more from an existing book. Copy passed the
// blog-writing checker (0 Tier 1). Deliberately avoids:
//   - earnings projections (margins shown are list-price arithmetic only)
//   - suggesting the membership be given away to win a policy: most states
//     regulate rebating/inducements, so the page tells agents to check first.
export const metadata: Metadata = {
  title: "Add-On & Ancillary Products for Insurance Agents",
  description:
    "An add-on product insurance agents and brokers can sell to their existing clients. Buy each savings membership for $12, set your own price up to $149, and keep the difference. No carrier appointment.",
  alternates: { canonical: "/add-on-products-for-insurance-agents" },
};

const MARGINS = [
  { charge: 29, keep: 17 },
  { charge: 49, keep: 37 },
  { charge: 99, keep: 87 },
];

const PLACES = [
  { title: "At renewal", body: "You're already on the phone reviewing the policy. The membership is one more thing to offer, and it has nothing to do with the premium." },
  { title: "With commercial clients", body: "Sixteen of the benefits are business tools: an AI answering service, call tracking, business texting, QuickBooks, a CRM, web hosting, LLC formation and a virtual mailbox. Small business owners use those every week." },
  { title: "Mid-year", body: "Most agencies only call a client about a renewal or a rate change. A savings membership gives you a reason to call about something good." },
  { title: "With clients you've lost touch with", body: "An offer that isn't a quote is an easier way to restart the conversation." },
];

const EASY = [
  { lead: "It isn't insurance.", body: "It's a consumer savings membership, so there's no carrier appointment and no coverage to explain." },
  { lead: "Enrolling takes about a minute.", body: "Enter the client's name, email, phone and state. We email them their member number and a link to set a password." },
  { lead: "Your name stays in front of them.", body: "Every client sees your agency in their dashboard all year." },
  { lead: "Nothing to chase.", body: "One charge per membership, and no residual billing a year later." },
];

const FAQ = [
  { q: "Is MemberPerkClub insurance?", a: "No. It's a savings membership. There's no policy, premium or coverage." },
  { q: "Do I need a carrier appointment?", a: "No. It isn't an insurance product." },
  { q: "What does a producer account cost?", a: "Nothing. You pay $12 only when you enroll or renew a client." },
  { q: "How much can I charge my client?", a: "Anything up to the $149 public price. You keep the difference." },
  { q: "Can I include it free with a policy?", a: "Check your state's rebating and inducement rules before offering it at no charge or at a discount as part of an insurance sale." },
  { q: "Is there a volume plan?", a: "A flat $295 monthly plan for up to 500 memberships a month is coming. Until then, each membership is $12." },
];

export default function AddOnProductsPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section className="section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="wrap" style={{ maxWidth: 860 }}>
        <span className="eyebrow">For insurance agents &amp; brokers</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.4vw,48px)", marginTop: 8 }}>
          An add-on product you can sell to the clients you already have
        </h1>
        <p className="lede" style={{ marginTop: 14 }}>
          MemberPerkClub is a savings membership that insurance agents and brokers resell under their own
          agency name. You buy each membership for <strong>$12</strong> and set your own price, up to the
          $149 public price. The difference is yours, collected the day you sell it, not months later when
          a carrier pays commission.
        </p>
        <div className="herocta" style={{ marginTop: 22 }}>
          <Link href="/producer-signup" className="btn btn-primary">Open a free producer account</Link>
          <Link href="/producers/getting-started" className="btn btn-ghost">See how to get started</Link>
        </div>

        <h2 className="display" style={{ fontSize: 26, marginTop: 48 }}>What an ancillary product is</h2>
        <p style={{ marginTop: 10, lineHeight: 1.7, color: "var(--ink-2)" }}>
          An ancillary product, sometimes called an add-on product, is something an agency sells alongside
          insurance that isn&apos;t insurance itself. Roadside plans, identity-theft services and discount
          memberships all fall in this group.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.7, color: "var(--ink-2)" }}>
          Agencies add one for a plain reason. The hardest part of any sale is finding the buyer, and your
          client list is already full of them. An add-on gives you something new to offer people who already
          trust you, without buying a single lead.
        </p>

        <h2 className="display" style={{ fontSize: 26, marginTop: 44 }}>How the margin works</h2>
        <div className="three" style={{ marginTop: 16 }}>
          {MARGINS.map((m) => (
            <div key={m.charge} className="panel" style={{ textAlign: "center" }}>
              <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 14 }}>You charge</p>
              <p className="display" style={{ margin: "4px 0", fontSize: 30 }}>${m.charge}</p>
              <p style={{ margin: 0, fontSize: 15 }}>You keep <strong style={{ color: "var(--violet)" }}>${m.keep}</strong></p>
            </div>
          ))}
        </div>
        <ul className="ticks" style={{ marginTop: 18 }}>
          {[
            "You pay $12 per membership. That's the whole cost. There's no sign-up fee, monthly fee or minimum.",
            "You choose what your client pays, anywhere up to $149.",
            "Your client pays you directly. We never bill your client and never see what you charged.",
            "Each membership runs one year. Nothing renews on its own. We email you 30 days and 7 days before it ends, and you decide whether to renew for another $12.",
          ].map((t) => (
            <li key={t}><Icon name="check" /><span>{t}</span></li>
          ))}
        </ul>
        <p style={{ marginTop: 10, color: "var(--ink-2)" }}>
          There&apos;s no commission to track and no carrier split, because you set the margin yourself. Try
          your own numbers in the{" "}
          <Link href="/producers" style={{ color: "var(--violet)", fontWeight: 600 }}>margin calculator</Link>.
        </p>

        <h2 className="display" style={{ fontSize: 26, marginTop: 44 }}>Four places it fits in an agency&apos;s week</h2>
        <div className="gs-benefits">
          {PLACES.map((p, i) => (
            <div key={p.title} className="gs-benefit">
              <h3>{i + 1}. {p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
        <p className="note" style={{ marginTop: 18 }}>
          <Icon name="info" />
          <span>
            Planning to include the membership at no charge, or at a discount, as part of selling a policy?
            Check your state&apos;s rebating and inducement rules first. Many states limit the value of anything
            given in connection with an insurance sale.
          </span>
        </p>

        <h2 className="display" style={{ fontSize: 26, marginTop: 44 }}>What your clients get</h2>
        <p style={{ color: "var(--ink-2)", marginTop: 6 }}>
          A full year of membership, with your agency named as the provider every time they sign in.
        </p>
        <div className="gs-benefits">
          {BENEFIT_HIGHLIGHTS.map((b) => (
            <div key={b.title} className="gs-benefit"><h3>{b.title}</h3><p>{b.body}</p></div>
          ))}
        </div>

        <h2 className="display" style={{ fontSize: 26, marginTop: 44 }}>Why agencies find it easy to add</h2>
        <ul className="ticks" style={{ marginTop: 14 }}>
          {EASY.map((e) => (
            <li key={e.lead}><Icon name="check" /><span><strong>{e.lead}</strong> {e.body}</span></li>
          ))}
        </ul>

        <div className="startcard" style={{ marginTop: 40 }}>
          <span className="startbadge">Start here <span className="nudge" aria-hidden="true">&rarr;</span></span>
          <h2 className="display" style={{ fontSize: 22, margin: "10px 0 6px" }}>Start in about five minutes</h2>
          <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 16px", lineHeight: 1.6 }}>
            Open a free producer account, add a payment method once, and enroll your first client. The
            getting-started guide walks through each step.
          </p>
          <div className="herocta">
            <Link href="/producer-signup" className="btn btn-primary">Open a free producer account</Link>
            <Link href="/producers/getting-started" className="btn btn-ghost">Read the guide</Link>
          </div>
        </div>

        <h2 className="display" style={{ fontSize: 26, marginTop: 44 }}>Common questions</h2>
        <div className="gs-faq">
          {FAQ.map((f) => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
      </div>
    </section>
  );
}
