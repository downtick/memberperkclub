import type { Metadata } from "next";
import ProducerSignupForm from "@/components/ProducerSignupForm";

export const metadata: Metadata = { title: "Open a free producer account" };

export default async function ProducerSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string; failed?: string }>;
}) {
  const { expired, failed } = await searchParams;
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

        {(expired || failed) && (
          <div className="form-alert mb-5" role="alert">
            {expired
              ? "That confirmation link has expired or isn't valid. Fill in the form again and we'll send a new one."
              : "We couldn't finish creating your account. Please try again."}
          </div>
        )}

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
