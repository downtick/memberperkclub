import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import { SITE } from "@/lib/siteConfig";

const TILES: { icon: IconName; title: string; body: string }[] = [
  { icon: "bed", title: "Hotels & rental cars", body: "Member rates, often under public pricing" },
  { icon: "home", title: "Home & auto savings", body: "Warranty, tires, pet prescriptions" },
  { icon: "leaf", title: "Health & beauty codes", body: "Supplements, grooming, wellness" },
];

const INSIDE: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "plane",
    title: "Travel that costs less",
    body: "Member pricing on hotel rooms and rental cars, plus cruise shore excursions booked directly instead of at the ship's excursion desk.",
  },
  {
    icon: "case",
    title: "Business and personal services",
    body: "Discounts on phone systems, web hosting, bookkeeping, virtual assistants, secure email, credit monitoring, and more — added to all year.",
  },
  {
    icon: "printer",
    title: "Guides worth printing",
    body: "Plain-language articles and printable checklists for the home and money maintenance everyone forgets until it costs them.",
  },
];

const TICKS = [
  "Every member benefit, discount code, and printable guide",
  "New benefits and articles added throughout the year",
  "Your own member number, issued the moment you join",
  "Manage or cancel your membership yourself, anytime",
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="section">
        <div className="wrap hero">
          <div className="stack">
            <span className="eyebrow">A members-only savings club</span>
            <h1 className="display" style={{ fontSize: "clamp(34px,5.2vw,58px)", lineHeight: 1.06 }}>
              A membership that pays for itself on what your household already buys.
            </h1>
            <p className="lede">
              Members get travel rates below public pricing, cruise excursions, business services,
              and home and auto savings — plus printable guides for the maintenance everyone
              forgets until it costs money.
            </p>
            <div className="herocta">
              <Link href="/join" className="btn btn-primary">Become a member — $149 a year</Link>
              <Link href="#inside" className="btn btn-ghost">See what members get</Link>
            </div>
            <p className="fineprint">
              There&apos;s nothing to carry and nothing to activate. You sign in and your benefits
              are there. Cancel free within 7 days; non-refundable after that. Renews annually
              until you cancel.
            </p>
          </div>

          <div className="fan">
            <div>
              {TILES.map((t) => (
                <div className="tile rise" key={t.title}>
                  <span className="icbox"><Icon name={t.icon} /></span>
                  <span>
                    <b>{t.title}</b>
                    <em>{t.body}</em>
                  </span>
                </div>
              ))}
              <div className="rise" style={{ textAlign: "center" }}>
                <span className="statchip">
                  Over <b>30</b> member benefits, with more added all year
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What's inside ── */}
      <section className="section" id="inside">
        <div className="wrap">
          <span className="eyebrow">Behind the login</span>
          <h2 className="display" style={{ marginTop: 8, fontSize: "clamp(25px,3vw,35px)" }}>
            What your membership opens up
          </h2>
          <div className="three">
            {INSIDE.map((f) => (
              <div key={f.title} className="perk">
                <span className="icbox"><Icon name={f.icon} /></span>
                <h3 style={{ fontSize: 19 }}>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Membership pricing: one public option only ── */}
      <section className="section" id="join">
        <div className="wrap">
          <span className="eyebrow">Membership</span>
          <h2 className="display" style={{ marginTop: 8, fontSize: "clamp(25px,3vw,35px)" }}>
            One membership. Everything unlocked.
          </h2>
          <p className="lede" style={{ marginTop: 14 }}>
            {SITE.name} is a savings club, not an insurance product. Membership is entirely
            online — sign in from your phone or laptop and every benefit is one tap away.
          </p>

          <div className="panel pricebox" style={{ marginTop: 28 }}>
            <span className="badge">Annual membership</span>
            <div className="price">
              <span className="amt">$149</span>
              <span className="per">per year</span>
            </div>
            <ul className="ticks">
              {TICKS.map((t) => (
                <li key={t}><Icon name="check" />{t}</li>
              ))}
            </ul>
            <Link href="/join" className="btn btn-primary" style={{ width: "fit-content" }}>Become a member</Link>
            <p className="terms">
              Cancel within 7 days of purchase for a full refund. After 7 days the membership is
              non-refundable. Renews automatically each year unless you cancel.
            </p>
          </div>
        </div>
      </section>

      {/* ── Producer program (producer-facing, not a consumer price option) ── */}
      <section className="section">
        <div className="wrap">
          <span className="eyebrow">For producers</span>
          <h2 className="display" style={{ marginTop: 8, fontSize: "clamp(25px,3vw,35px)" }}>
            Buy at wholesale. Sell at your price. Keep the difference.
          </h2>
          <p className="lede" style={{ marginTop: 14 }}>
            {SITE.name} is a non-insurance add-on you resell under your own agency. We bill you
            the wholesale rate of $12 per membership — you decide what, if anything, your client
            pays for it.
          </p>
          <div className="herocta" style={{ marginTop: 22 }}>
            <Link href="/producers" className="btn btn-primary">See how the producer program works</Link>
            <Link href="/producer-signup" className="btn btn-ghost">Open a free account</Link>
          </div>
        </div>
      </section>
    </>
  );
}
