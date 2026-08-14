"use client";
import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Icon from "./Icon";

export default function SettingsForm({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    const supabase = createClient();
    const updates: { email?: string; password?: string } = {};
    if (email && email !== currentEmail) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) {
      setStatus("idle");
      return;
    }

    const { error: err } = await supabase.auth.updateUser(updates);
    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }
    setPassword("");
    setStatus("done");
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <div className="mb-4">
        <label className="form-label" htmlFor="s-email">Email</label>
        <input id="s-email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="form-label" htmlFor="s-password">New password</label>
        <input id="s-password" type="password" className="form-input" placeholder="Leave blank to keep current password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="form-error mb-3"><Icon name="info" />{error}</p>}
      {status === "done" && <p className="text-sm mb-3" style={{ color: "var(--good)" }}>Saved. If you changed your email, check your inbox to confirm it.</p>}
      <button type="submit" disabled={status === "saving"} className="btn-primary">
        {status === "saving" ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
