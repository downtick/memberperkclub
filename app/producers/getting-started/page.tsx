import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  PRODUCER_STEPS,
  WHAT_HAPPENS_NEXT,
  BENEFIT_HIGHLIGHTS,
  PRODUCER_FAQ,
} from "@/lib/producerGuide";

export const metadata: Metadata = {
  title: "Producer getting-started guide",
  description:
    "How to open a free producer account, add a payment method, enroll your first client, and answers to common questions.",
};

// Public how-to page. Its job is to answer a producer's questions before they
// have to call or email: the FAQ below is the part that prevents support
// contacts, so keep it current with lib/producerGuide.ts.
export default function GettingStartedPage() {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <span className="eyebrow">For producers</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.4vw,46px)", marginTop: 8 }}>
          Getting started in 4 steps
        </h1>
        <p className="lede" style={{ marginTop: 12 }}>
          About five minutes from start to your first enrolled client. Your account is free — you
          pay nothing until you choose to enroll someone.
        </p>

        <ol className="gs-steps">
          {PRODUCER_STEPS.map((s, i) => (
            <li key={s.n}>
              <div className={s.required ? "gs-step gs-step--required" : "gs-step"}>
                <span className="gs-num" aria-hidden="true">{s.n}</span>
                <div>
                  {s.required && <p className="gs-flag">&#9733; Required before you can enroll</p>}
                  <h2 className="display gs-title">{s.title}</h2>
                  <p className="gs-body">{s.body}</p>
                  <Link href={s.url.replace(/^https?:\/\/[^/]+/, "")} className="btn btn-primary">
                    {s.cta} <span className="nudge" aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
              {i < PRODUCER_STEPS.length - 1 && (
                <div className="gs-arrow" aria-hidden="true">&darr;</div>
              )}
            </li>
          ))}
        </ol>

        <div className="panel" style={{ marginTop: 36 }}>
          <h2 className="display" style={{ fontSize: 22 }}>What happens after you enroll a client</h2>
          <ol className="gs-flow">
            {WHAT_HAPPENS_NEXT.map((t, i) => (
              <li key={t}>
                <span className="gs-flownum">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 14 }}>
            You also get an email confirming each enrollment, and every client appears on your{" "}
            <Link href="/producer/dashboard" style={{ color: "var(--violet)", fontWeight: 600 }}>
              producer dashboard
            </Link>
            .
          </p>
        </div>

        <h2 className="display" style={{ fontSize: 26, marginTop: 44 }}>What your clients get</h2>
        <p style={{ color: "var(--ink-2)", marginTop: 6 }}>
          A full year of membership, with your agency shown as the provider.
        </p>
        <div className="gs-benefits">
          {BENEFIT_HIGHLIGHTS.map((b) => (
            <div key={b.title} className="gs-benefit">
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </div>
          ))}
        </div>

        <h2 className="display" style={{ fontSize: 26, marginTop: 44 }}>Common questions</h2>
        <div className="gs-faq">
          {PRODUCER_FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <p className="note" style={{ marginTop: 32 }}>
          <Icon name="info" />
          <span>
            Still stuck? Email <strong>club@memberperkclub.com</strong> or use our{" "}
            <Link href="/contact" style={{ color: "var(--violet)", fontWeight: 600 }}>contact page</Link>.
          </span>
        </p>

        <div className="herocta" style={{ marginTop: 28 }}>
          <Link href="/producer-signup" className="btn btn-primary">Open a free producer account</Link>
          <Link href="/producers" className="btn btn-ghost">How the pricing works</Link>
        </div>
      </div>
    </section>
  );
}
