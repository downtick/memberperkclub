"use client";
import { useState, FormEvent } from "react";
import { formatPhoneInput } from "@/lib/phone";
import { STATES } from "@/lib/schemas";
import Icon from "./Icon";

export default function ContactForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [leadingOneNotice, setLeadingOneNotice] = useState(false);

  function set(name: string, value: string) {
    setValues((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => { const e = { ...p }; delete e[name]; return e; });
  }

  function setPhone(raw: string) {
    const { formatted, hadLeadingOne } = formatPhoneInput(raw);
    setLeadingOneNotice(hadLeadingOne);
    set("phone", formatted);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          company_website: honeypot,
          referrer: typeof document !== "undefined" ? document.referrer : "",
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) setErrors(data.details);
        setSubmitError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <span className="icbox" style={{ margin: "0 auto 14px" }}><Icon name="check" /></span>
        <h3 className="text-xl mb-2" style={{ color: "var(--violet)" }}>Message sent!</h3>
        <p className="text-[var(--ink-2)]">Thanks for reaching out — we&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  const eb = (n: string) => (errors[n] ? "var(--danger)" : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />

      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div>
          <label className="form-label" htmlFor="c-first">First Name *</label>
          <input id="c-first" className="form-input" autoComplete="given-name" value={values.firstName || ""} onChange={(e) => set("firstName", e.target.value)} style={{ borderColor: eb("firstName") }} />
          {errors.firstName && <p className="form-error"><Icon name="info" />{errors.firstName[0]}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="c-last">Last Name *</label>
          <input id="c-last" className="form-input" autoComplete="family-name" value={values.lastName || ""} onChange={(e) => set("lastName", e.target.value)} style={{ borderColor: eb("lastName") }} />
          {errors.lastName && <p className="form-error"><Icon name="info" />{errors.lastName[0]}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="c-email">Email *</label>
          <input id="c-email" type="email" className="form-input" autoComplete="email" value={values.email || ""} onChange={(e) => set("email", e.target.value)} style={{ borderColor: eb("email") }} />
          {errors.email && <p className="form-error"><Icon name="info" />{errors.email[0]}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="c-phone">Phone *</label>
          <input id="c-phone" type="tel" inputMode="tel" className="form-input" autoComplete="tel" placeholder="xxx-xxx-xxxx" maxLength={12}
            value={values.phone || ""} onChange={(e) => setPhone(e.target.value)} style={{ borderColor: eb("phone") }} />
          {leadingOneNotice && <p className="text-xs text-[var(--ink-3)] mt-1">We dropped the leading 1 — just enter the 10-digit number.</p>}
          {errors.phone && <p className="form-error"><Icon name="info" />{errors.phone[0]}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="c-state">State</label>
          <select id="c-state" className="form-input" value={values.state || ""} onChange={(e) => set("state", e.target.value)}>
            <option value="">—</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="form-label" htmlFor="c-msg">How can we help you? *</label>
        <textarea id="c-msg" className="form-input" rows={5} style={{ resize: "vertical", borderColor: eb("message") }}
          placeholder="Tell us what's on your mind…"
          value={values.message || ""} onChange={(e) => set("message", e.target.value)} />
        {errors.message && <p className="form-error"><Icon name="info" />{errors.message[0]}</p>}
      </div>

      {submitError && (
        <div className="mb-5 p-3.5 rounded-lg text-sm" style={{ background: "var(--danger-wash)", border: "1px solid var(--danger)", color: "var(--danger)" }}>
          <Icon name="info" />{submitError}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center" style={{ opacity: submitting ? 0.7 : 1 }}>
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
