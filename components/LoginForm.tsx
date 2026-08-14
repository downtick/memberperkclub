"use client";
import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Icon from "./Icon";

type Mode = "password" | "magic";

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }
    window.location.href = "/post-login";
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="text-center py-4">
        <span className="icbox" style={{ margin: "0 auto 12px" }}><Icon name="doc" /></span>
        <p className="font-semibold mb-1">Check your email</p>
        <p className="text-sm text-[var(--ink-3)]">We sent a login link to {email}. It also works as a password reset — click it and you&apos;ll be signed in.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex mb-6 rounded-lg overflow-hidden border" style={{ borderColor: "var(--rule)" }}>
        <button
          type="button"
          onClick={() => setMode("password")}
          className="flex-1 py-2 text-sm font-semibold"
          style={{ background: mode === "password" ? "var(--ink)" : "#fff", color: mode === "password" ? "#fff" : "var(--ink)" }}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className="flex-1 py-2 text-sm font-semibold"
          style={{ background: mode === "magic" ? "var(--ink)" : "#fff", color: mode === "magic" ? "#fff" : "var(--ink)" }}
        >
          Log in with a link
        </button>
      </div>

      <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}>
        <div className="mb-4">
          <label className="form-label" htmlFor="l-email">Email</label>
          <input id="l-email" type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {mode === "password" && (
          <div className="mb-2">
            <label className="form-label" htmlFor="l-password">Password</label>
            <input id="l-password" type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        )}

        {mode === "password" && (
          <button type="button" onClick={() => setMode("magic")} className="text-xs text-[var(--ink-3)] nav-link mb-4 inline-block">
            Forgot your password? Email me a login link instead.
          </button>
        )}

        {error && <p className="form-error mb-3"><Icon name="info" />{error}</p>}

        <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center mt-2">
          {status === "loading" ? "Please wait…" : mode === "password" ? "Log In" : "Email me a login link"}
        </button>
      </form>
    </div>
  );
}
