"use client";
import { useState, FormEvent } from "react";
import { formatPhoneInput } from "@/lib/phone";
import { STATES } from "@/lib/schemas";
import Icon from "./Icon";

export default function EnrollClientForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [memberNumber, setMemberNumber] = useState<string | null>(null);

  function set(name: string, value: string) {
    setValues((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => { const e = { ...p }; delete e[name]; return e; });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/producer/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) setErrors(data.details);
        setSubmitError(data.error || "Something went wrong.");
        return;
      }
      setMemberNumber(data.memberNumber || "assigned");
      setValues({});
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (memberNumber) {
    return (
      <div className="text-center py-6">
        <span className="icbox" style={{ margin: "0 auto 12px" }}><Icon name="check" /></span>
        <h3 className="text-xl mb-2">Client enrolled</h3>
        <p className="text-[var(--ink-3)] mb-4">Member number {memberNumber}. A welcome email has been sent.</p>
        <button onClick={() => setMemberNumber(null)} className="btn-outline">Enroll another client</button>
      </div>
    );
  }

  const eb = (n: string) => (errors[n] ? "var(--danger)" : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div>
          <label className="form-label" htmlFor="e-first">First Name *</label>
          <input id="e-first" className="form-input" value={values.firstName || ""} onChange={(e) => set("firstName", e.target.value)} style={{ borderColor: eb("firstName") }} />
          {errors.firstName && <p className="form-error"><Icon name="info" />{errors.firstName[0]}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="e-last">Last Name *</label>
          <input id="e-last" className="form-input" value={values.lastName || ""} onChange={(e) => set("lastName", e.target.value)} style={{ borderColor: eb("lastName") }} />
          {errors.lastName && <p className="form-error"><Icon name="info" />{errors.lastName[0]}</p>}
        </div>
      </div>
      <div className="mb-4">
        <label className="form-label" htmlFor="e-email">Client Email *</label>
        <input id="e-email" type="email" className="form-input" value={values.email || ""} onChange={(e) => set("email", e.target.value)} style={{ borderColor: eb("email") }} />
        {errors.email && <p className="form-error"><Icon name="info" />{errors.email[0]}</p>}
      </div>
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div>
          <label className="form-label" htmlFor="e-phone">Phone *</label>
          <input id="e-phone" type="tel" inputMode="tel" maxLength={12} className="form-input" placeholder="xxx-xxx-xxxx"
            value={values.phone || ""} onChange={(e) => set("phone", formatPhoneInput(e.target.value).formatted)} style={{ borderColor: eb("phone") }} />
          {errors.phone && <p className="form-error"><Icon name="info" />{errors.phone[0]}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="e-state">State *</label>
          <select id="e-state" className="form-input" value={values.state || ""} onChange={(e) => set("state", e.target.value)} style={{ borderColor: eb("state") }}>
            <option value="">Select…</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="form-error"><Icon name="info" />{errors.state[0]}</p>}
        </div>
      </div>

      {submitError && <div className="mb-5 p-3.5 rounded-lg text-sm" style={{ background: "var(--danger-wash)", border: "1px solid var(--danger)", color: "var(--danger)" }}><Icon name="info" />{submitError}</div>}

      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
        {submitting ? "Charging $12 & enrolling…" : "Enroll client — charge $12"}
      </button>
      <p className="text-xs text-[var(--ink-3)] mt-3 text-center">
        This is a one-time, non-refundable $12 wholesale charge to your saved payment method. The membership does not
        auto-renew.
      </p>
    </form>
  );
}
