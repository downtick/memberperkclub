"use client";
import { useState, FormEvent } from "react";
import { formatPhoneInput, formatZipInput } from "@/lib/phone";
import { STATES } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";
import Icon from "./Icon";

export default function ProducerSignupForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);
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
      const res = await fetch("/api/producer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company_website: honeypot }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) setErrors(data.details);
        setSubmitError(data.error || "Something went wrong.");
        return;
      }
      // Send a login link so the producer can sign straight in.
      const supabase = createClient();
      await supabase.auth.signInWithOtp({
        email: values.email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setDone(true);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <span className="icbox" style={{ margin: "0 auto 12px" }}><Icon name="check" /></span>
        <h3 className="display" style={{ fontSize: 21, marginBottom: 8 }}>You&apos;re in</h3>
        <p style={{ color: "var(--ink-2)" }}>
          We sent a login link to {values.email}. Click it to sign in and add a payment method so
          you can start enrolling clients.
        </p>
      </div>
    );
  }

  const eb = (n: string) => (errors[n] ? { borderColor: "var(--danger)" } : undefined);
  const err = (n: string) => errors[n] && <p className="form-error"><Icon name="info" />{errors[n][0]}</p>;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        type="text" name="company_website" tabIndex={-1} autoComplete="off" value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />

      <p className="eyebrow" style={{ marginBottom: 10 }}>Your details</p>
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        <div>
          <label className="form-label" htmlFor="p-first">First name *</label>
          <input id="p-first" className="form-input" autoComplete="given-name" value={values.firstName || ""} onChange={(e) => set("firstName", e.target.value)} style={eb("firstName")} />
          {err("firstName")}
        </div>
        <div>
          <label className="form-label" htmlFor="p-last">Last name *</label>
          <input id="p-last" className="form-input" autoComplete="family-name" value={values.lastName || ""} onChange={(e) => set("lastName", e.target.value)} style={eb("lastName")} />
          {err("lastName")}
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label" htmlFor="p-business">Business name *</label>
        <input id="p-business" className="form-input" autoComplete="organization" placeholder="e.g. Sunridge Insurance Group"
          value={values.businessName || ""} onChange={(e) => set("businessName", e.target.value)} style={eb("businessName")} />
        <p className="fineprint" style={{ marginTop: 5 }}>
          This is what your clients see on their dashboard as the business that provided their membership.
        </p>
        {err("businessName")}
      </div>

      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        <div>
          <label className="form-label" htmlFor="p-email">Email *</label>
          <input id="p-email" type="email" className="form-input" autoComplete="email" value={values.email || ""} onChange={(e) => set("email", e.target.value)} style={eb("email")} />
          {err("email")}
        </div>
        <div>
          <label className="form-label" htmlFor="p-phone">Phone *</label>
          <input id="p-phone" type="tel" inputMode="tel" maxLength={12} className="form-input" autoComplete="tel" placeholder="xxx-xxx-xxxx"
            value={values.phone || ""} onChange={(e) => setPhone(e.target.value)} style={eb("phone")} />
          {leadingOneNotice && (
            <p className="fineprint" style={{ marginTop: 5 }}>
              We dropped the leading 1 — just the 10-digit number is needed.
            </p>
          )}
          {err("phone")}
        </div>
      </div>

      <p className="eyebrow" style={{ marginBottom: 10 }}>Mailing address</p>
      <div className="mb-4">
        <label className="form-label" htmlFor="p-addr1">Street address *</label>
        <input id="p-addr1" className="form-input" autoComplete="address-line1" value={values.addressLine1 || ""} onChange={(e) => set("addressLine1", e.target.value)} style={eb("addressLine1")} />
        {err("addressLine1")}
      </div>
      <div className="mb-4">
        <label className="form-label" htmlFor="p-addr2">Address line 2</label>
        <input id="p-addr2" className="form-input" autoComplete="address-line2" placeholder="Suite, unit, floor (optional)"
          value={values.addressLine2 || ""} onChange={(e) => set("addressLine2", e.target.value)} />
      </div>
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
        <div>
          <label className="form-label" htmlFor="p-city">City *</label>
          <input id="p-city" className="form-input" autoComplete="address-level2" value={values.city || ""} onChange={(e) => set("city", e.target.value)} style={eb("city")} />
          {err("city")}
        </div>
        <div>
          <label className="form-label" htmlFor="p-state">State *</label>
          <select id="p-state" className="form-input" autoComplete="address-level1" value={values.state || ""} onChange={(e) => set("state", e.target.value)} style={eb("state")}>
            <option value="">—</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {err("state")}
        </div>
        <div>
          <label className="form-label" htmlFor="p-zip">ZIP *</label>
          <input id="p-zip" inputMode="numeric" maxLength={5} className="form-input" autoComplete="postal-code" placeholder="12345"
            value={values.postalCode || ""} onChange={(e) => set("postalCode", formatZipInput(e.target.value))} style={eb("postalCode")} />
          {err("postalCode")}
        </div>
      </div>

      {submitError && <div className="form-alert mb-5"><Icon name="info" />{submitError}</div>}

      <button type="submit" disabled={submitting} className="btn btn-primary w-full justify-center">
        {submitting ? "Creating account…" : "Open a free account"}
      </button>
    </form>
  );
}
