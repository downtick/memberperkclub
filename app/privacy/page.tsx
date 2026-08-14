import type { Metadata } from "next";
import { SITE } from "@/lib/siteConfig";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="max-w-3xl mx-auto px-6 py-16 prose-warm">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-[var(--ink-3)]">Last updated: August 12, 2026</p>

        <p>
          {SITE.legalEntity} ("we," "us," or "our") operates memberperkclub.com (the "Site").
          This Privacy Policy explains what information we collect, how we use and share it, and
          the choices you have. By using the Site or creating an account, you agree to this
          Policy.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          <strong>Account information.</strong> When you join, sign up as a Producer, or are
          enrolled as a member by a Producer or admin, we collect name, email address, phone
          number, and state.
        </p>
        <p>
          <strong>Payment information.</strong> Retail members' subscription payments and
          Producers' saved payment methods are processed by our payment processor, Stripe. We do not store
          full card numbers on our servers — Stripe handles and stores that data under its own
          security standards.
        </p>
        <p>
          <strong>Usage information.</strong> When you visit the Site or use your member
          dashboard, we may collect IP address, browser type, device information, pages viewed,
          referring URL, and which perks/resources you click through to, via cookies and similar
          technologies.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To create and manage your account and membership;</li>
          <li>To process payments and renewals;</li>
          <li>To send account, billing, and service emails (welcome email, receipts, renewal notices);</li>
          <li>To respond to support and contact-form requests;</li>
          <li>To operate, secure, and improve the Site;</li>
          <li>To comply with legal obligations and enforce our Terms.</li>
        </ul>

        <h2>3. How We Share Your Information</h2>
        <p>We share information only as needed to run the membership program:</p>
        <ul>
          <li><strong>Payment processing</strong> — Stripe processes all subscription and one-time charges;</li>
          <li><strong>Email delivery</strong> — SMTP2GO sends transactional email on our behalf;</li>
          <li><strong>Your enrolling Producer</strong> — if you were enrolled by a Producer, that Producer can see your name, member number, status, and expiration date in their dashboard, but cannot see what was paid for your account;</li>
          <li>As required by law, subpoena, or to protect rights and safety;</li>
          <li>In connection with a business transfer (merger, acquisition, sale of assets).</li>
        </ul>
        <p>
          We do <strong>not</strong> sell your personal information to third parties for their own
          marketing, and we do not publish a public directory of members — there is no public
          listing of who is a {SITE.name} member.
        </p>

        <h2>4. Cookies and Tracking</h2>
        <p>
          We use cookies for site functionality (staying signed in), analytics, and to remember
          your accessibility preferences (text size, high-contrast mode). You can control cookies
          through your browser settings.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain account and billing records for as long as your account is active and for a
          reasonable period afterward to comply with tax, accounting, and legal obligations,
          resolve disputes, and enforce agreements.
        </p>

        <h2>6. Data Security</h2>
        <p>
          We use reasonable administrative, technical, and physical safeguards, including
          encryption in transit (HTTPS), role-based access controls, and database-level access
          policies restricting who can view billing and membership data. No method of transmission
          or storage is 100% secure.
        </p>

        <h2>7. Your Privacy Rights</h2>
        <p>
          Depending on where you live, you may have the right to access, correct, delete, or
          restrict use of your information.
        </p>
        <ul>
          <li><strong>California (CCPA/CPRA)</strong> and other U.S. states with privacy laws: you may request access to, deletion of, and correction of your personal information. We do not discriminate against you for exercising these rights.</li>
          <li>To exercise any right, contact us at <a href="mailto:privacy@memberperkclub.com">privacy@memberperkclub.com</a>.</li>
        </ul>

        <h2>8. Children's Privacy</h2>
        <p>The Site is not directed to children under 16 and we do not knowingly collect their information.</p>

        <h2>9. Third-Party Links</h2>
        <p>
          The Site links to third-party affiliate offers and travel booking partners. We are not
          responsible for their privacy practices — review their policies before providing
          information to them.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this Policy. Changes are effective when posted with a new "Last updated" date.</p>

        <h2>11. Contact Us</h2>
        <p>
          {SITE.legalEntity}
          <br />
          Email: <a href="mailto:privacy@memberperkclub.com">privacy@memberperkclub.com</a>
        </p>
      </div>
    </section>
  );
}
