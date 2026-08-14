"use client";
import { useState } from "react";
import Link from "next/link";
import JoinButton from "@/components/JoinButton";
import Icon from "@/components/Icon";
import { SITE } from "@/lib/siteConfig";

export default function JoinPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section className="section">
      <div className="wrap">
        <span className="eyebrow">Membership</span>
        <h1 className="display" style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 8 }}>
          One membership. Everything unlocked.
        </h1>
        <p className="lede" style={{ marginTop: 14 }}>
          {SITE.name} is a savings club, not an insurance product. Membership is entirely
          online — sign in from your phone or laptop and every benefit is one tap away.
        </p>

        <div className="grid gap-8 lg:grid-cols-2 items-start" style={{ marginTop: 36 }}>
          {/* What you get */}
          <div className="panel pricebox" style={{ maxWidth: "none" }}>
            <span className="badge">Annual membership</span>
            <div className="price">
              <span className="amt">$149</span>
              <span className="per">per year</span>
            </div>
            <ul className="ticks">
              {[
                "Every member benefit, discount code, and printable guide",
                "New benefits and articles added throughout the year",
                "Your own member number, issued the moment you join",
                "Manage or cancel your membership yourself, anytime",
              ].map((t) => (
                <li key={t}><Icon name="check" />{t}</li>
              ))}
            </ul>
            <p className="terms">
              Cancel within 7 days of purchase for a full refund. After 7 days the membership is
              non-refundable. Renews automatically each year unless you cancel.
            </p>
          </div>

          {/* Sign-up */}
          <div className="panel">
            <h2 className="display" style={{ fontSize: 21 }}>Become a member</h2>
            <div>
              <label className="form-label" htmlFor="j-email">Email</label>
              <input id="j-email" type="email" autoComplete="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="form-label" htmlFor="j-password">Create a password</label>
              <input id="j-password" type="password" autoComplete="new-password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <JoinButton email={email} password={password} />

            <p className="fineprint">
              There&apos;s nothing to carry and nothing to activate. You sign in and your benefits
              are there.
            </p>
          </div>
        </div>

        <p className="text-center fineprint" style={{ marginTop: 28 }}>
          Already a member?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--violet)" }}>Log in</Link>
        </p>
      </div>
    </section>
  );
}
