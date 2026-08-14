"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProducerByAdmin } from "@/lib/admin/actions";
import { formatPhoneInput, formatZipInput } from "@/lib/phone";
import { STATES } from "@/lib/schemas";
import Icon from "@/components/Icon";

export default function NewProducerForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [strippedOne, setStrippedOne] = useState(false);
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
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
        const res = await createProducerByAdmin({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          businessName: values.businessName,
          phone: values.phone,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2 || undefined,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          sendWelcome: values.sendWelcome,
          passwordMode: values.passwordMode,
        });
        setResult(res.businessName);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create producer.");
      }
    });
  }

  if (result) {
    return (
      <div className="card p-6 text-center">
        <span className="icbox" style={{ margin: "0 auto 12px" }}><Icon name="check" /></span>
        <p className="font-semibold mb-1">Producer account created — {result}</p>
        <p className="text-sm text-[var(--ink-3)]">
          {values.sendWelcome
            ? "A welcome email has been sent with sign-in details and a link to add a payment method."
            : "No welcome email was sent — they'll need their sign-in details another way."}
        </p>
        <p className="text-sm text-[var(--ink-3)] mt-3">
          They can't enroll a client until they add their own payment method.
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
        <label className="form-label">Business name</label>
        <input className="form-input" value={values.businessName} onChange={(e) => set("businessName", e.target.value)} required />
        <p className="text-xs text-[var(--ink-3)] mt-1">
          Shown to every client they enroll, in the “provided by” band on the client dashboard.
        </p>
      </div>

      <div>
        <label className="form-label">Email (their login)</label>
        <input type="email" className="form-input" value={values.email} onChange={(e) => set("email", e.target.value)} required />
      </div>

      <div>
        <label className="form-label">Phone</label>
        <input
          className="form-input"
          inputMode="tel"
          placeholder="702-555-1234"
          value={values.phone}
          onChange={(e) => {
            const { formatted, hadLeadingOne } = formatPhoneInput(e.target.value);
            set("phone", formatted);
            setStrippedOne(hadLeadingOne);
          }}
          required
        />
        {strippedOne && (
          <p className="text-xs text-[var(--ink-3)] mt-1">
            We removed the leading 1 — it isn’t needed.
          </p>
        )}
      </div>

      <div>
        <label className="form-label">Street address</label>
        <input className="form-input" value={values.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Suite / unit (optional)</label>
        <input className="form-input" value={values.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="form-label">City</label>
          <input className="form-input" value={values.city} onChange={(e) => set("city", e.target.value)} required />
        </div>
        <div>
          <label className="form-label">State</label>
          <select className="form-input" value={values.state} onChange={(e) => set("state", e.target.value)} required>
            <option value="">—</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">ZIP</label>
          <input
            className="form-input"
            inputMode="numeric"
            maxLength={5}
            value={values.postalCode}
            onChange={(e) => set("postalCode", formatZipInput(e.target.value))}
            required
          />
        </div>
      </div>

      <div>
        <label className="form-label">Password handling</label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="ppw" checked={values.passwordMode === "link"} onChange={() => set("passwordMode", "link")} />
            Send set-password link (recommended)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="ppw" checked={values.passwordMode === "temp"} onChange={() => set("passwordMode", "temp")} />
            Generate temp password
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.sendWelcome} onChange={(e) => set("sendWelcome", e.target.checked)} />
        Send the producer welcome email now
      </label>

      <p className="text-xs text-[var(--ink-3)]">
        No payment method is collected here — we never take an agent’s card on their behalf.
        The welcome email links them to the page where they add their own, which they must do
        before they can enroll anyone.
      </p>

      {error && <p className="form-error"><Icon name="info" />{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Creating…" : "Create producer account"}
      </button>
    </form>
  );
}
