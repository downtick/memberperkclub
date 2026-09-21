"use client";

import { useState } from "react";

// Per-row "Resend welcome" action on the producer dashboard.
export default function ResendWelcomeButton({ memberId }: { memberId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function resend() {
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/producer/resend-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(data.error || "Could not send.");
        return;
      }
      setState("sent");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (state === "sent") {
    return <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Sent &#10003;</span>;
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <button
        type="button"
        onClick={resend}
        disabled={state === "sending"}
        className="btn-outline"
        style={{ fontSize: 13, padding: "6px 12px", whiteSpace: "nowrap" }}
      >
        {state === "sending" ? "Sending…" : "Resend welcome"}
      </button>
      {state === "error" && (
        <span style={{ fontSize: 12, color: "var(--danger)", maxWidth: 220 }}>{message}</span>
      )}
    </span>
  );
}
