"use client";
import { useState } from "react";
import Link from "next/link";

export default function MobileNav({ loggedIn, dashboardHref }: { loggedIn: boolean; dashboardHref: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="btn btn-ghost"
        style={{ padding: "9px 11px" }}
      >
        {/* Menu/close control drawn inline to match the sprite's 1.6 stroke
            style — the sprite has no hamburger glyph, and this is chrome
            rather than content. */}
        <svg
          className="ic"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          style={{ width: 18, height: 18 }}
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 px-6 py-4 flex flex-col gap-3"
          style={{ top: 68, background: "var(--ground-2)", borderBottom: "1px solid var(--rule)", color: "var(--ink-2)" }}
        >
          <Link href="/join" onClick={() => setOpen(false)}>Membership</Link>
          <Link href="/producers" onClick={() => setOpen(false)}>For producers</Link>
          <Link href="/#inside" onClick={() => setOpen(false)}>What members get</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/faq" onClick={() => setOpen(false)}>FAQ</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
          {loggedIn ? (
            <Link href={dashboardHref} onClick={() => setOpen(false)} className="font-semibold" style={{ color: "var(--violet)" }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
              <Link href="/join" onClick={() => setOpen(false)} className="font-semibold" style={{ color: "var(--violet)" }}>
                Join
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
