import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/siteConfig";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="section">
      <div className="max-w-3xl mx-auto px-6 py-16 prose-warm">
        <h1>About {SITE.name}</h1>
        <p>
          {SITE.name} is a membership club built around a simple idea: everyday people and
          the businesses that serve them should have access to the kind of group discounts usually
          reserved for large companies.
        </p>
        <p>
          Members get real, ongoing value — hotel and rental car discounts, cruise excursion
          pricing, and a growing directory of vetted deals on phone systems, web hosting, credit
          monitoring, supplements, home warranties, and more. We also publish plain-language
          articles and printable checklists to help with practical home and money decisions.
        </p>
        <h2>Two ways in</h2>
        <p>
          Anyone can join directly for $149 a year. We also work with insurance producers and other
          client-facing businesses ("Producers") who want to offer membership to their own clients
          as a low-cost, high-value benefit — a one-time $12 per client, no subscriptions, no
          commissions.
        </p>
        <h2>How we make money</h2>
        <p>
          Membership dues fund the club, and many perks in the directory are affiliate
          partnerships — we may earn a commission when a member uses a listed offer, at no extra
          cost to the member. See our <Link href="/disclaimer">disclaimer</Link> for details.
        </p>
        <p>
          Have a question we didn't answer here? Visit our <Link href="/faq">FAQ</Link> or{" "}
          <Link href="/contact">contact us</Link>.
        </p>
      </div>
    </section>
  );
}
