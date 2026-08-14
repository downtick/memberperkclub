import Link from "next/link";
import Icon from "./Icon";
import { SITE } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ borderTop: "1px solid var(--rule)", background: "var(--ground-2)" }}>
      <div className="wrap py-12 grid gap-10 md:grid-cols-4">
        <div>
          <span className="logo mb-3">
            <span className="mark"><Icon name="spark" /></span>
            <span>{SITE.name}</span>
          </span>
          <p className="text-sm mt-3" style={{ color: "var(--ink-3)" }}>
            A members-only savings club: travel rates, business services, and everyday savings —
            all online, all behind one login.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-3">Membership</p>
          <ul className="space-y-2 text-sm" style={{ color: "var(--ink-2)" }}>
            <li><Link href="/join" className="navlink !px-0">Become a member</Link></li>
            <li><Link href="/login" className="navlink !px-0">Log in</Link></li>
            <li><Link href="/faq" className="navlink !px-0">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">For producers</p>
          <ul className="space-y-2 text-sm" style={{ color: "var(--ink-2)" }}>
            <li><Link href="/producers" className="navlink !px-0">Producer program</Link></li>
            <li><Link href="/producer-signup" className="navlink !px-0">Open a free account</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">Company</p>
          <ul className="space-y-2 text-sm" style={{ color: "var(--ink-2)" }}>
            <li><Link href="/about" className="navlink !px-0">About</Link></li>
            <li><Link href="/contact" className="navlink !px-0">Contact</Link></li>
            <li><Link href="/terms" className="navlink !px-0">Terms of Service</Link></li>
            <li><Link href="/privacy" className="navlink !px-0">Privacy Policy</Link></li>
            <li><Link href="/disclaimer" className="navlink !px-0">Disclaimer</Link></li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--rule)" }}>
        <div className="wrap py-5 text-xs flex flex-wrap gap-2 justify-between" style={{ color: "var(--ink-3)" }}>
          <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Membership is $149 a year, renewing annually until you cancel. See Terms for cancellation details.</p>
        </div>
      </div>
    </footer>
  );
}
