import type { Metadata } from "next";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import MarginCalculator from "@/components/MarginCalculator";
import { SITE } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "For producers",
  description:
    "Buy at wholesale, sell at your price, keep the difference. A non-insurance add-on you resell under your own agency — $12 wholesale per membership, no commissions, no renewals.",
};

const STEPS: { no: string; icon: IconName; title: string; body: string }[] = [
  {
    no: "STEP ONE",
    icon: "user",
    title: "Open a free account",
    body: "Your name, business name, mailing address, email, and phone. No contract, no monthly fee, no minimum.",
  },
  {
    no: "STEP TWO",
    icon: "wallet",
    title: "Add a payment method",
    body: "Stored once with our payment processor. We never see the number. You're billed $12 only when you enroll someone.",
  },
  {
    no: "STEP THREE",
    icon: "badge",
    title: "Enroll a client",
    body: "They get a welcome email and a full year of membership, with your agency name shown in their dashboard.",
  },
];

const WHY: { lead: string; body: string }[] = [
  {
    lead: "You set the retail price.",
    body: "Give it away to win a policy, bundle it into a service fee, or sell it outright at anything up to the $149 public price. We never tell you what to charge.",
  },
  {
    lead: "It isn't insurance.",
    body: "No carrier appointment, no licensing question, no coverage to explain. It's a consumer savings product you happen to be the retailer for.",
  },
  {
    lead: "Nothing recurring to manage.",
    body: "One charge per membership. It never auto-renews, so there's no residual billing chasing you or your client a year later.",
  },
  {
    lead: "Your name stays on it.",
    body: "Every client you enroll sees your agency as the provider each time they sign in, all year.",
  },
  {
    lead: "A reason to call back.",
    body: "New benefits land throughout the year, which gives you something to talk about that isn't a renewal or a rate increase.",
  },
];

export default function ProducersPage() {
  return (
    <section className="section">
      <div className="wrap">
        <span className="eyebrow">For producers</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.6vw,50px)", marginTop: 8 }}>
          Buy at wholesale. Sell at your price. Keep the difference.
        </h1>
        <p className="lede" style={{ marginTop: 14 }}>
          {SITE.name} is a non-insurance add-on you resell under your own agency. We bill you the
          wholesale rate of <strong>$12 per membership</strong>. You are the retail seller — you
          decide what, if anything, your client pays for it.
        </p>

        <div className="herocta" style={{ marginTop: 22 }}>
          <Link href="/producer-signup" className="btn btn-primary">
            <Icon name="user" /> Open a free producer account
          </Link>
          <Link href="#why" className="btn btn-ghost">See how it works</Link>
        </div>

        <MarginCalculator />

        <div className="three">
          {STEPS.map((s) => (
            <div key={s.no} className="step">
              <span className="stepno">{s.no}</span>
              <span className="icbox"><Icon name={s.icon} /></span>
              <h3 className="display">{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <div className="panel" id="why" style={{ marginTop: 30 }}>
          <h2 className="display" style={{ fontSize: 22 }}>Why producers use it</h2>
          <ul className="ticks">
            {WHY.map((w) => (
              <li key={w.lead}>
                <Icon name="check" />
                <span>
                  <strong>{w.lead}</strong> {w.body}
                </span>
              </li>
            ))}
          </ul>
          <p className="terms">
            Memberships purchased at the wholesale rate are non-refundable and fully earned at the
            time of purchase. Producer accounts are free; there is no commission paid, because
            your compensation is the margin you set. Whatever you charge your client is between
            you and your client.
          </p>
        </div>

        <p className="note" style={{ marginTop: 24 }}>
          <Icon name="info" />
          <span>
            <strong>Coming later:</strong> a flat monthly plan for agencies enrolling in volume —
            up to 500 new memberships a month for one fee instead of $12 each.
          </span>
        </p>

        <div className="herocta" style={{ marginTop: 30 }}>
          <Link href="/producer-signup" className="btn btn-primary">Open a free account</Link>
        </div>
      </div>
    </section>
  );
}
