"use client";

import { useState } from "react";

// For a SIGNED-IN member without access: starts Stripe Checkout directly.
// (JoinButton is the signed-out path; it creates the account first.)
export default function ResumeCheckoutButton({ label }: { label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Unable to start checkout.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }
  return (
    <div>
      <button type="button" onClick={go} disabled={busy} className="btn btn-primary">
        {busy ? "Redirecting to checkout…" : label}
      </button>
      {error && <p className="form-error" style={{ marginTop: 10 }}>{error}</p>}
    </div>
  );
}
