import Link from "next/link";
import { requireProducer } from "@/lib/access";

export default async function ProducerLayout({ children }: { children: React.ReactNode }) {
  await requireProducer();

  return (
    <section className="section" style={{ borderBottom: 0 }}>
      <div className="wrap">
        <div className="app">
          <div className="appbar">
            <div className="tabs" style={{ border: 0, margin: 0, flex: 1 }}>
              <Link href="/producer/dashboard" className="tab">Clients</Link>
              <Link href="/producer/enroll" className="tab">Enroll a client</Link>
              <Link href="/producer/payment-method" className="tab">Payment method</Link>
            </div>
          </div>
          <div className="appbody">{children}</div>
        </div>
      </div>
    </section>
  );
}
