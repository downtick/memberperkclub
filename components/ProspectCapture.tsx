"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status =
  | "sending"
  | "queued"
  | "sent"
  | "already_on_list"
  | "previously_unsubscribed"
  | "already_producer"
  | "error";

type Entry = { id: string; email: string; name: string; status: Status; error?: string; at: string };

const STORE = "mpc-prospects-v1";

// Kept on the phone so nothing typed at a booth is ever lost to bad Wi-Fi:
// failed sends stay queued and retry on their own. localStorage can be
// unavailable (private mode), so every access is guarded — the page still
// works, it just can't survive a reload.
function load(): Entry[] {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}
function save(entries: Entry[]) {
  try {
    localStorage.setItem(STORE, JSON.stringify(entries.slice(0, 5000)));
  } catch {
    /* storage full or blocked — in-memory still works */
  }
}

const LABEL: Record<Status, { text: string; tone: "ok" | "warn" | "muted" | "bad" }> = {
  sending: { text: "Sending…", tone: "muted" },
  queued: { text: "No signal — queued, will retry", tone: "warn" },
  sent: { text: "✓ Welcome email on its way", tone: "ok" },
  already_on_list: { text: "Already on the list — not re-sent", tone: "muted" },
  previously_unsubscribed: { text: "Unsubscribed before — not added", tone: "bad" },
  already_producer: { text: "Already a producer — skipped", tone: "muted" },
  error: { text: "Failed", tone: "bad" },
};
const TONE = { ok: "#1F7A45", warn: "#9A6700", muted: "var(--ink-3)", bad: "var(--danger)" };

export default function ProspectCapture({ configured }: { configured: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => setEntries(load()), []);

  const update = useCallback((id: string, patch: Partial<Entry>) => {
    setEntries((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
      save(next);
      return next;
    });
  }, []);

  const send = useCallback(
    async (entry: Entry) => {
      update(entry.id, { status: "sending", error: undefined });
      try {
        const res = await fetch("/api/admin/prospects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: entry.email, name: entry.name }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.outcome && data.outcome !== "error") {
          update(entry.id, { status: data.outcome as Status });
        } else if (res.status === 502) {
          // Sendy unreachable — transient, keep it queued.
          update(entry.id, { status: "queued", error: data.error });
        } else {
          update(entry.id, { status: "error", error: data.error || `HTTP ${res.status}` });
        }
      } catch {
        // fetch itself threw: no network. Queue and retry later.
        update(entry.id, { status: "queued" });
      }
    },
    [update]
  );

  // Retry queued entries when the connection returns, and every 30s.
  useEffect(() => {
    const retry = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      load().filter((e) => e.status === "queued").forEach((e) => void send(e));
    };
    window.addEventListener("online", retry);
    const t = setInterval(retry, 30000);
    return () => {
      window.removeEventListener("online", retry);
      clearInterval(t);
    };
  }, [send]);

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    const entry: Entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: clean,
      name: name.trim(),
      status: "sending",
      at: new Date().toISOString(),
    };
    setEntries((prev) => {
      const next = [entry, ...prev];
      save(next);
      return next;
    });
    setEmail("");
    setName("");
    emailRef.current?.focus();
    void send(entry);
  }

  function downloadCsv() {
    const rows = [["email", "name", "status", "entered_at"], ...entries.map((e) => [e.email, e.name, e.status, e.at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `memberperkclub-prospects-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const today = new Date().toDateString();
  const sentToday = entries.filter((e) => e.status === "sent" && new Date(e.at).toDateString() === today).length;
  const queued = entries.filter((e) => e.status === "queued").length;

  const input: React.CSSProperties = { fontSize: 18, padding: "14px 14px", width: "100%" };

  return (
    <div style={{ maxWidth: 560 }}>
      {!configured && (
        <p className="note" style={{ marginBottom: 18 }}>
          <span>
            <strong>Sendy isn&apos;t connected yet.</strong> Entries will be saved on this device and
            fail until SENDY_URL, SENDY_API_KEY and SENDY_PROSPECT_LIST_ID are set in Vercel.
          </span>
        </p>
      )}

      <form onSubmit={submit} className="card p-6" style={{ display: "grid", gap: 12 }}>
        <label className="form-label" htmlFor="pc-email">Email *</label>
        <input
          id="pc-email"
          ref={emailRef}
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          required
          className="form-input"
          style={input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@agency.com"
        />
        <label className="form-label" htmlFor="pc-name">First name (optional — personalises the email)</label>
        <input
          id="pc-name"
          autoComplete="off"
          className="form-input"
          style={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="David"
        />
        <button type="submit" className="btn btn-primary w-full justify-center" style={{ fontSize: 17, padding: "14px" }}>
          Send welcome email &rarr;
        </button>
      </form>

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", margin: "18px 0 10px" }}>
        <strong>{sentToday} sent today</strong>
        {queued > 0 && <span style={{ color: TONE.warn }}>{queued} queued</span>}
        {entries.length > 0 && (
          <button type="button" onClick={downloadCsv} className="btn-outline" style={{ fontSize: 13, padding: "6px 12px", marginLeft: "auto" }}>
            Download CSV ({entries.length})
          </button>
        )}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {entries.slice(0, 100).map((e) => {
          const l = LABEL[e.status];
          return (
            <li key={e.id} style={{ borderTop: "1px solid var(--rule)", padding: "10px 0", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, wordBreak: "break-all" }}>{e.email}</span>
              {e.name && <span style={{ color: "var(--ink-3)" }}>{e.name}</span>}
              <span style={{ marginLeft: "auto", fontSize: 13, color: TONE[l.tone] }}>
                {l.text}{e.status === "error" && e.error ? ` — ${e.error}` : ""}
              </span>
              {(e.status === "error" || e.status === "queued") && (
                <button type="button" onClick={() => void send(e)} className="btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}>
                  Retry
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
