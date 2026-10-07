"use client";

import { useState } from "react";
import Link from "next/link";
import JoinButton from "@/components/JoinButton";
import Icon from "@/components/Icon";
import { OFFERS } from "@/lib/offers";

// Small business member rate: $19 a year, every year. No introductory price
// that jumps later, which keeps the page honest and avoids the renewal
// surprises regulators have been active about.
//
// The offer is open to ANY small business, not only insurance clients. Tying
// a discount to buying a policy would raise state rebating and inducement
// questions; telling your clients about an offer anyone can take does not.
const BUSINESS_PERKS = [
  "AI answering service so calls get picked up when you cannot",
  "Call tracking that shows which ads bring the phone calls",
  "Business texting from a real business number",
  "QuickBooks for bookkeeping, invoices and payroll",
  "A CRM for leads, deals and follow ups",
  "Website hosting built for speed and uptime",
  "Virtual assistants and a freelance marketplace",
  "LLC formation and a virtual mailbox",
];

const EVERYDAY_PERKS = [
  "Member rates on hotel rooms and rental cars",
  "Cruise shore excursions booked directly",
  "FICO score access and identity monitoring",
  "Home warranty, pet medications and tires",
  "Supplements, grooming, private email and a VPN",
  "Home, budgeting and wellness guides with printable checklists",
];

export default function SmallBusinessOfferPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const offer = OFFERS.business;

  return (
    <section className="section">
      <div className="wrap">
        <span className="eyebrow">Small business rate</span>
        <h1 className="display" style={{ fontSize: "clamp(28px,4.2vw,44px)", marginTop: 8 }}>
          Every member benefit, {offer.priceLabel}
        </h1>
        <p className="lede" style={{ marginTop: 14 }}>
          The same membership that costs $149 to the public is {offer.priceLabel} for small
          business owners. Same benefits, same member dashboard, no catch. It stays{" "}
          {offer.priceLabel} every year you keep it.
        </p>

        <div className="grid gap-8 lg:grid-cols-2 items-start" style={{ marginTop: 36 }}>
          <div className="panel pricebox" style={{ maxWidth: "none" }}>
            <span className="badge">Small business rate</span>
            <div className="price">
              <span className="amt">$19</span>
              <span className="per">per year</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 14px" }}>
              Public price is $149 a year. You pay $19, and $19 is what it renews at.
            </p>
            <ul className="ticks">
              {[
                "Every benefit in the directory, business and personal",
                "New benefits and guides added through the year",
                "Your own member number the moment you join",
                "Cancel yourself any time from your dashboard",
              ].map((t) => (
                <li key={t}><Icon name="check" />{t}</li>
              ))}
            </ul>
            <p className="terms">
              Cancel within 7 days for a full refund. After 7 days the membership is
              non-refundable. Renews at $19 a year until you cancel. This is a savings
              membership, not insurance.
            </p>
          </div>

          <div className="panel">
            <h2 className="display" style={{ fontSize: 21 }}>Start your membership</h2>
            <div>
              <label className="form-label" htmlFor="o-email">Email</label>
              <input id="o-email" type="email" autoComplete="email" className="form-input"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="form-label" htmlFor="o-password">Create a password</label>
              <input id="o-password" type="password" autoComplete="new-password" className="form-input"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <JoinButton email={email} password={password} offer={offer.slug} priceLabel="$19/year" />

            <p className="fineprint">
              You will get a confirmation email first. Click the link in it and you come straight
              back here to finish.
            </p>
          </div>
        </div>

        <h2 className="display" style={{ fontSize: 26, marginTop: 48 }}>Built for a business owner</h2>
        <p style={{ color: "var(--ink-2)", marginTop: 6 }}>
          Sixteen of the benefits are tools you would otherwise pay for separately.
        </p>
        <ul className="ticks" style={{ marginTop: 14 }}>
          {BUSINESS_PERKS.map((t) => (<li key={t}><Icon name="check" /><span>{t}</span></li>))}
        </ul>

        <h2 className="display" style={{ fontSize: 26, marginTop: 40 }}>And the rest of the club</h2>
        <ul className="ticks" style={{ marginTop: 14 }}>
          {EVERYDAY_PERKS.map((t) => (<li key={t}><Icon name="check" /><span>{t}</span></li>))}
        </ul>

        <div className="startcard" style={{ marginTop: 44 }}>
          <span className="startbadge">{offer.priceLabel}</span>
          <h2 className="display" style={{ fontSize: 22, margin: "10px 0 6px" }}>
            Join at the small business rate
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 16px", lineHeight: 1.6 }}>
            Open to any small business owner. Takes about a minute.
          </p>
          <Link href="#top" className="btn btn-primary" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            Start my membership <span className="nudge" aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <p className="text-center fineprint" style={{ marginTop: 28 }}>
          Already a member?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--violet)" }}>Log in</Link>
        </p>
      </div>
    </section>
  );
}
