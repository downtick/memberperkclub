import type { Metadata } from "next";
import ProducerSignupForm from "@/components/ProducerSignupForm";

export const metadata: Metadata = { title: "Open a free producer account" };

export default function ProducerSignupPage() {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 620 }}>
        <span className="eyebrow">For producers</span>
        <h1 className="display" style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 8 }}>
          Open a free account
        </h1>
        <p className="lede" style={{ marginTop: 12, marginBottom: 28 }}>
          No contract and no monthly minimum. Add a payment method once, then enroll a client at
          the $12 wholesale rate and sell it on at whatever price you choose.
        </p>

        <div className="panel">
          <ProducerSignupForm />
        </div>

        <p className="fineprint" style={{ marginTop: 20 }}>
          Memberships purchased at the wholesale rate are non-refundable and fully earned at the
          time of purchase. Producer accounts are free; there is no commission paid, because your
          compensation is the margin you set.
        </p>
      </div>
    </section>
  );
}
