import type { Metadata } from "next";
import { SITE } from "@/lib/siteConfig";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <section className="section">
      <div className="max-w-3xl mx-auto px-6 py-16 prose-warm">
        <h1>Disclaimer</h1>
        <p className="text-sm text-[var(--ink-3)]">Last updated: August 12, 2026</p>

        <h2>General Information Disclaimer</h2>
        <p>
          The information published on this website, including all articles, checklists,
          worksheets, and educational content (collectively, "Content"), is provided solely for
          general educational and informational purposes. The Content does not constitute, and
          shall not be construed as, financial, legal, tax, medical, or professional advice of any
          kind.
        </p>

        <h2>Affiliate Relationships</h2>
        <p>
          {SITE.name} participates in affiliate and referral programs. Many links in the
          member perks directory are affiliate links, and we may earn a commission when you click
          through and make a purchase or sign up, at no extra cost to you. Discounts, codes, and
          offers are set and controlled by the third-party provider and may change or expire
          without notice. We do not control, and are not responsible for, the products, services,
          pricing, or business practices of any third party listed in the directory.
        </p>

        <h2>No Guarantee of Savings</h2>
        <p>
          References to "discounts," "savings," or "member pricing" describe offers as provided by
          third parties at the time of listing. We do not guarantee any specific price, discount
          amount, or availability, which is determined solely by the third-party provider.
        </p>

        <h2>Health and Wellness Content</h2>
        <p>
          Any supplement, wellness, or grooming products referenced in the perks directory are not
          evaluated or endorsed by {SITE.name} for medical use. Statements about such
          products have not been evaluated by the Food and Drug Administration. These products are
          not intended to diagnose, treat, cure, or prevent any disease. Consult a physician before
          starting any supplement or wellness regimen.
        </p>

        <h2>Financial and Budgeting Content</h2>
        <p>
          Budgeting worksheets, savings guides, and related articles are general educational tools
          and are not personalized financial advice. Your own financial situation, income, debts,
          and goals may differ, and you should consult a licensed financial professional before
          making significant financial decisions.
        </p>

        <h2>No Guarantee of Accuracy or Currency</h2>
        <p>
          Content is provided as of its publication date and may not reflect subsequent changes.
          We make no representation or warranty, express or implied, regarding the accuracy,
          completeness, or fitness for a particular purpose of any Content.
        </p>

        <h2>Independent Professional Advice Required</h2>
        <p>
          Nothing on this website is a substitute for the advice of a licensed professional with
          knowledge of your specific facts and circumstances.
        </p>

        <h2>External Links</h2>
        <p>
          This website may link to third-party websites, including travel booking and affiliate
          partner sites. We do not control and are not responsible for the content, accuracy, or
          practices of any linked site.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, {SITE.legalEntity} disclaims all liability
          for any loss or damage arising from reliance on Content published on this website.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this disclaimer can be sent via our{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </section>
  );
}
