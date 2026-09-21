import Link from "next/link";
import { requireProducer } from "@/lib/access";
import { producerHasPaymentMethod } from "@/lib/producer";

export default async function ProducerLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProducer();
  const hasPaymentMethod = await producerHasPaymentMethod(profile.id);

  return (
    <section className="section" style={{ borderBottom: 0 }}>
      <div className="wrap">
        <div className="app">
          <div className="appbar">
            <div className="tabs" style={{ border: 0, margin: 0, flex: 1 }}>
              <Link href="/producer/dashboard" className="tab">Clients</Link>
              <Link href="/producer/enroll" className="tab">Enroll a client</Link>
              <Link href="/producer/payment-method" className="tab">
                Payment method
                {/* Points back at the tab label it sits beside. Shown only
                    until a card is on file, then it disappears for good. */}
                {!hasPaymentMethod && (
                  <span className="tabnudge" aria-label="Start here">
                    <span className="nudge-left" aria-hidden="true">&larr;</span> Start here
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div className="appbody">{children}</div>
        </div>
      </div>
    </section>
  );
}
