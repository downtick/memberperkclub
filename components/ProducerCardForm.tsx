"use client";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import Icon from "./Icon";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function InnerForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    const { error: confirmError, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: `${window.location.origin}/producer/dashboard` },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Unable to save payment method.");
      setSubmitting(false);
      return;
    }

    const paymentMethodId =
      typeof setupIntent?.payment_method === "string" ? setupIntent.payment_method : setupIntent?.payment_method?.id;

    if (paymentMethodId) {
      await fetch("/api/producer/card-confirmed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      }).catch(() => {});
    }

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return <p className="text-sm" style={{ color: "var(--good)" }}>Payment method saved. You're ready to enroll clients.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="form-error mt-3"><Icon name="info" />{error}</p>}
      <button type="submit" disabled={!stripe || submitting} className="btn-primary mt-5">
        {submitting ? "Saving…" : "Save payment method"}
      </button>
    </form>
  );
}

export default function ProducerCardForm() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/producer/setup-intent", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setError(data.error || "Unable to start payment setup.");
      })
      .catch(() => setError("Unable to start payment setup."));
  }, []);

  if (!stripePromise) {
    return (
      <p className="text-sm text-[var(--ink-3)]">
        Payment setup isn't configured yet — add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and
        STRIPE_SECRET_KEY to enable this.
      </p>
    );
  }

  if (error) return <p className="form-error"><Icon name="info" />{error}</p>;
  if (!clientSecret) return <p className="text-sm text-[var(--ink-3)]">Loading payment form…</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <InnerForm />
    </Elements>
  );
}
