import type { Metadata } from "next";
import { SITE } from "@/lib/siteConfig";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <section className="section">
      <div className="max-w-3xl mx-auto px-6 py-16 prose-warm">
        <h1>Terms of Service</h1>
        <p className="text-sm text-[var(--ink-3)]">Last updated: August 12, 2026</p>

        <p>
          These Terms of Service ("Terms") govern your use of memberperkclub.com (the "Site")
          and the {SITE.name} membership program, operated by {SITE.legalEntity} ("we,"
          "us," or "our"). By creating an account, purchasing a membership, or using the Site, you
          agree to these Terms. If you do not agree, do not use the Site.
        </p>

        <h2>1. What {SITE.name} Is</h2>
        <p>
          {SITE.name} is a paid membership club — a savings club, not an insurance product — that gives members access to a directory of
          discounts and affiliate offers from third-party travel, business, financial, and
          consumer service providers, plus educational articles. We are not a travel agency,
          insurer, financial advisor, or the provider of any discounted product or service listed
          in the member directory — those products and services are provided by independent third
          parties under their own terms.
        </p>

        <h2>2. Two Ways to Become a Member</h2>
        <p>Membership is available in exactly two ways. There is no free membership tier.</p>
        <h3>2a. Retail membership</h3>
        <p>
          Individuals may join directly at <a href="/join">/join</a> for <strong>$149 per year</strong>,
          billed to a payment method on file via our payment processor (Stripe) and{" "}
          <strong>auto-renewing annually</strong> until canceled. You may cancel free of charge
          within <strong>7 days of your original signup date</strong> for a full refund. After
          that 7-day window, <strong>membership fees are non-refundable</strong>, including for
          partial or unused periods. You can view your billing history and cancel future renewal
          at any time from your account's billing page (Stripe Customer Portal).
        </p>
        <h3>2b. Producer-enrolled membership</h3>
        <p>
          Insurance agents and other client-facing businesses ("Producers") may create a free
          Producer account and enroll their own clients as members for a{" "}
          <strong>one-time fee of $12 per client</strong>, charged to the Producer's own saved
          payment method — never to the client. A Producer-enrolled membership runs for a fixed
          term (currently one year from the enrollment date), does{" "}
          <strong>not auto-renew</strong>, and simply lapses at the end of the term unless the
          Producer or {SITE.name} renews it. This fee is{" "}
          <strong>fully earned and non-refundable at the time of purchase</strong>, because the
          membership is issued and access is granted immediately. {SITE.name} does not pay
          Producers any commission, referral fee, or other compensation for enrollments, ever.
        </p>
        <p>
          A Producer-enrolled member cannot view what was paid for their account and cannot cancel
          or modify billing themselves — their account settings are limited to updating their
          email address and password. Producer accounts themselves are free; Producers are not
          members and do not receive member benefits by virtue of having a Producer account alone.
        </p>

        <h2>3. Eligibility</h2>
        <p>
          You must be at least 18 years old and able to form a binding contract to create an
          account. The information you provide (including for anyone you enroll as a Producer)
          must be accurate and belong to a real person who has agreed to receive the membership.
        </p>

        <h2>4. Member Directory and Third-Party Offers</h2>
        <p>
          The perks directory contains <strong>affiliate links</strong> — {SITE.name} may
          receive a commission when you use a link or discount code, at no extra cost to you.
          Discounts, pricing, and availability are set and controlled entirely by the third-party
          provider and may change or end without notice. We do our best to keep listings accurate
          but do not guarantee any specific discount, price, or availability. Some listed products
          (for example, dietary supplements) make general wellness claims that have not been
          evaluated by the FDA and are not intended to diagnose, treat, cure, or prevent any
          disease.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Share your login credentials or member benefits with non-members;</li>
          <li>Submit false information or enroll a "client" without that person's knowledge and consent;</li>
          <li>Use bots, scrapers, or automated means to access the Site except standard search indexing;</li>
          <li>Attempt to gain unauthorized access to, probe, or disrupt the Site or its systems;</li>
          <li>Use the Site for any unlawful or fraudulent purpose.</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          The Site and its content (text, graphics, logos, design) are owned by MemberPerkClub,
          LLC or its licensors. You may not copy, reproduce, or redistribute Site content except
          for your own personal, non-commercial use (for example, printing a checklist article for
          your own household).
        </p>

        <h2>7. Disclaimers</h2>
        <p>
          THE SITE AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF
          ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED,
          ERROR-FREE, OR SECURE, OR THAT ANY THIRD-PARTY DISCOUNT, OFFER, OR PRODUCT WILL BE
          AVAILABLE, ACCURATE, OR SUITABLE FOR YOU.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, {SITE.legalEntity.toUpperCase()} AND ITS OFFICERS,
          EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SITE, YOUR MEMBERSHIP,
          OR ANY THIRD-PARTY OFFER. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SITE OR YOUR
          MEMBERSHIP WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM
          AROSE.
        </p>

        <h2>9. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless {SITE.legalEntity} from any claims,
          damages, or expenses (including reasonable attorneys' fees) arising from your misuse of
          the Site or violation of these Terms.
        </p>

        <h2>10. Governing Law and Disputes</h2>
        <p>
          These Terms are governed by the laws of the State of Nevada, without regard to
          conflict-of-law rules. Any dispute will be resolved in the state or federal courts
          located in Clark County, Nevada. <em>[Counsel: confirm venue and whether arbitration is preferred.]</em>
        </p>

        <h2>11. Changes to These Terms</h2>
        <p>
          We may update these Terms at any time. Changes are effective when posted with a new
          "Last updated" date. Continued use of the Site after changes means you accept the
          updated Terms.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          {SITE.legalEntity}
          <br />
          Email: <a href="mailto:support@memberperkclub.com">support@memberperkclub.com</a>
          <br />
          Or use our <a href="/contact">contact form</a>.
        </p>
      </div>
    </section>
  );
}
