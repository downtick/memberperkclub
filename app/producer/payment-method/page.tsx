import type { Metadata } from "next";
import { requireProducer } from "@/lib/access";
import ProducerCardForm from "@/components/ProducerCardForm";

export const metadata: Metadata = { title: "Payment Method" };

export default async function ProducerCardPage() {
  await requireProducer();

  return (
    <div className="max-w-md">
      <h1 className="text-3xl mb-2">Payment Method</h1>
      <p className="text-[var(--ink-3)] mb-8">
        Add a payment method once. It's charged $12 only when you choose to enroll a client — never
        automatically, never on a schedule.
      </p>
      <div className="card p-6">
        <ProducerCardForm />
      </div>
    </div>
  );
}
