import type { Metadata } from "next";
import { SITE } from "@/lib/siteConfig";

export const metadata: Metadata = { title: "FAQ" };

const FAQS: { q: string; a: string }[] = [
  { q: `What is ${SITE.name}?`, a: "A paid membership club that gives you access to travel rates, business and personal service deals, and a library of home and money guides. It is a savings club, not an insurance product. Membership is entirely online — there is nothing to carry and nothing to activate." },
  { q: "How much does membership cost?", a: "$149 per year, billed annually and renewing automatically until you cancel." },
  { q: "Can I cancel my retail membership?", a: "Yes. You can cancel free of charge within 7 days of signing up for a full refund. After 7 days, membership fees are non-refundable, but you can cancel future renewals anytime from your dashboard billing page so you're not charged again." },
  { q: "My membership was provided by my producer — what can I change?", a: "Nothing was charged to you, and there is no recurring charge on your end, so there is nothing to cancel. Your account settings let you update your email address and password." },
  { q: "Does my membership renew automatically?", a: "A membership you buy yourself renews automatically each year until you cancel. A membership provided for you by a producer does not auto-renew — it runs for a fixed term and simply lapses unless it is renewed for you." },
  { q: "What discounts are included?", a: "Hotel and rental car rates, cruise shore excursions, and a directory of business, personal, financial, home & auto, and health & beauty deals — see the full list once you are signed in." },
  { q: "Is there a free membership?", a: "No. Every membership is a paid membership." },
  { q: "I'm a producer — do I get paid for enrolling clients?", a: "No, and none is needed. You buy memberships at a $12 wholesale rate and set your own retail price — your compensation is the margin you keep, not a commission we pay you." },
  { q: "Is there a public member directory?", a: `No. ${SITE.name} does not publish a public list of members — membership is private.` },
];

export default function FaqPage() {
  return (
    <section className="section">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl mb-8">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q} className="card p-6">
              <h2 className="text-lg mb-2">{f.q}</h2>
              <p className="text-[var(--ink-3)]">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
