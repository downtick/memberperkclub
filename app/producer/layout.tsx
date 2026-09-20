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
                {/* A quiet dot, not a red alert: this is an unfinished setup
                    step, not an error the producer has made. */}
                {!hasPaymentMethod && (
                  <span
                    aria-label="Setup incomplete"
                    title="Add a payment method to start enrolling clients"
                    style={{
                      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                      background: "var(--violet)", marginLeft: 7, verticalAlign: "middle",
                    }}
                  />
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
