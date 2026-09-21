"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Per-row "Renew — $12" on the producer dashboard. Always confirms first,
// naming the client and the new end date, because it charges a real card.
export default function RenewButton({
  memberId, clientName, newEndLabel,
}: { memberId: string; clientName: string; newEndLabel: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function renew() {
    const ok = window.confirm(
      `Renew ${clientName} through ${newEndLabel}?\n\nYour saved payment method will be charged $12.`
    );
    if (!ok) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/producer/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Renewal failed.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <button type="button" onClick={renew} disabled={busy} className="btn btn-primary"
        style={{ fontSize: 13, padding: "6px 12px", whiteSpace: "nowrap" }}>
        {busy ? "Renewing…" : "Renew — $12"}
      </button>
      {error && <span style={{ fontSize: 12, color: "var(--danger)", maxWidth: 220 }}>{error}</span>}
    </span>
  );
}
