import type { Metadata } from "next";
import { requireProducer } from "@/lib/access";
import EnrollClientForm from "@/components/EnrollClientForm";

export const metadata: Metadata = { title: "Enroll a Client" };

export default async function EnrollPage() {
  await requireProducer();

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl mb-2">Enroll a Client</h1>
      <p className="text-[var(--ink-3)] mb-8">
        One-time $12 wholesale charge to your saved payment method. Membership is active immediately for one year.
      </p>
      <div className="card p-6">
        <EnrollClientForm />
      </div>
    </div>
  );
}
