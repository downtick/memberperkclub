"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMemberByAdmin } from "@/lib/admin/actions";
import { STATES } from "@/lib/schemas";
import Icon from "@/components/Icon";

export default function NewMemberForm({
  producers,
}: {
  producers: { id: string; business_name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState({
    email: "",
    firstName: "",
    lastName: "",
    state: "",
    compDays: "365",
    producerId: "",
    passwordMode: "link" as "link" | "temp",
    sendWelcome: true,
  });
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function set<K extends keyof typeof values>(k: K, v: (typeof values)[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await createMemberByAdmin({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          state: values.state,
          compDays: Number(values.compDays),
          sendWelcome: values.sendWelcome,
          passwordMode: values.passwordMode,
          producerId: values.producerId || undefined,
        });
        setResult(res.memberNumber || "created");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create member.");
      }
    });
  }

  if (result) {
    return (
      <div className="card p-6 text-center">
        <span className="icbox" style={{ margin: "0 auto 12px" }}><Icon name="check" /></span>
        <p className="font-semibold mb-1">Member created — {result}</p>
        <p className="text-sm text-[var(--ink-3)]">
          {values.sendWelcome ? "A welcome email has been sent." : "No welcome email was sent."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="form-label">First name</label>
          <input className="form-input" value={values.firstName} onChange={(e) => set("firstName", e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Last name</label>
          <input className="form-input" value={values.lastName} onChange={(e) => set("lastName", e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="form-label">Email (their login)</label>
        <input type="email" className="form-input" value={values.email} onChange={(e) => set("email", e.target.value)} required />
      </div>
      <div>
        <label className="form-label">State</label>
        <select className="form-input" value={values.state} onChange={(e) => set("state", e.target.value)}>
          <option value="">—</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label">Comp access length (days, 0 = no access yet)</label>
        <input type="number" min={0} className="form-input" value={values.compDays} onChange={(e) => set("compDays", e.target.value)} />
      </div>
      <div>
        <label className="form-label">Credit to a producer (optional)</label>
        <select
          className="form-input"
          value={values.producerId}
          onChange={(e) => set("producerId", e.target.value)}
        >
          <option value="">No producer — direct comp member</option>
          {producers.map((p) => (
            <option key={p.id} value={p.id}>{p.business_name}</option>
          ))}
        </select>
        <p className="text-xs text-[var(--ink-3)] mt-1">
          {values.producerId
            ? "This member will see “provided by” that producer, won’t see a price, and can’t cancel — and the producer is not charged the $12 wholesale rate."
            : "The member manages their own account and sees no producer attribution."}
        </p>
      </div>
      <div>
        <label className="form-label">Password handling</label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="pw" checked={values.passwordMode === "link"} onChange={() => set("passwordMode", "link")} />
            Send set-password link (recommended)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="pw" checked={values.passwordMode === "temp"} onChange={() => set("passwordMode", "temp")} />
            Generate temp password
          </label>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.sendWelcome} onChange={(e) => set("sendWelcome", e.target.checked)} />
        Send welcome email now
      </label>

      {error && <p className="form-error"><Icon name="info" />{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Creating…" : "Create member"}
      </button>
    </form>
  );
}
