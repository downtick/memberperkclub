"use client";

import { useState } from "react";

// Per-row "Fix email" action on the producer dashboard. A corrected address is
// only useful if the sign-in link actually follows, so on success this offers
// the resend inline rather than leaving the producer to find a second button.
export default function ClientEmailEditor({
  memberId,
  email,
}: {
  memberId: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(email);
  const [current, setCurrent] = useState(email);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("saving");
    try {
      const res = await fetch("/api/producer/update-client-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, email: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not update the email.");
        setState("idle");
        return;
      }
      setCurrent(data.email);
      setValue(data.email);
      setState("saved");
    } catch {
      setError("Network error. Please try again.");
      setState("idle");
    }
  }

  async function sendSignIn() {
    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/producer/resend-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not send.");
        setState("saved");
        return;
      }
      setState("sent");
    } catch {
      setError("Network error. Please try again.");
      setState("saved");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline"
        style={{ fontSize: 13, padding: "6px 12px", whiteSpace: "nowrap" }}
      >
        Fix email
      </button>
    );
  }

  if (state === "sent") {
    return (
      <span style={{ fontSize: 13, color: "var(--ink-2)", display: "block", maxWidth: 260 }}>
        Updated and sign-in email sent to <strong>{current}</strong> &#10003;
      </span>
    );
  }

  if (state === "saved" || state === "sending") {
    return (
      <span style={{ display: "inline-flex", flexDirection: "column", gap: 6, maxWidth: 260 }}>
        <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
          Email updated to <strong>{current}</strong>.
        </span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
          They&rsquo;ll need a new sign-in link — the old one went to the previous address.
        </span>
        <span style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={sendSignIn}
            disabled={state === "sending"}
            className="btn-primary"
            style={{ fontSize: 13, padding: "6px 12px", whiteSpace: "nowrap" }}
          >
            {state === "sending" ? "Sending…" : "Send sign-in email"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setState("idle"); }}
            className="btn-outline"
            style={{ fontSize: 13, padding: "6px 12px" }}
          >
            Not now
          </button>
        </span>
        {error && <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>}
      </span>
    );
  }

  return (
    <form onSubmit={save} style={{ display: "inline-flex", flexDirection: "column", gap: 6, maxWidth: 260 }}>
      <label className="form-label" style={{ fontSize: 12 }} htmlFor={`email-${memberId}`}>
        Corrected email
      </label>
      <input
        id={`email-${memberId}`}
        type="email"
        required
        className="form-input"
        style={{ fontSize: 13, padding: "6px 10px" }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
      />
      <span style={{ display: "inline-flex", gap: 8 }}>
        <button
          type="submit"
          disabled={state === "saving"}
          className="btn-primary"
          style={{ fontSize: 13, padding: "6px 12px" }}
        >
          {state === "saving" ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setValue(current); setError(""); }}
          className="btn-outline"
          style={{ fontSize: 13, padding: "6px 12px" }}
        >
          Cancel
        </button>
      </span>
      {error && <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>}
    </form>
  );
}
