"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Icon from "./Icon";

// Starts Stripe Checkout for the $149/yr retail plan. If the visitor isn't
// signed in yet, creates a bare Supabase auth account first (email +
// password from this same form) so Checkout has a profile_id to attach to.
export default function JoinButton({ email, password }: { email: string; password: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleJoin() {
    setStatus("loading");
    setError("");

    if (!email || !password) {
      setError("Enter an email and password to continue.");
      setStatus("error");
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const { error: signUpErr } = await supabase.auth.signUp({ email, password });
        if (signUpErr && !signUpErr.message.toLowerCase().includes("already registered")) {
          setError(signUpErr.message);
          setStatus("error");
          return;
        }
        // If the account already existed, try signing in instead
        if (signUpErr) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            setError("An account with this email already exists. Try logging in instead.");
            setStatus("error");
            return;
          }
        }
      }

      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Unable to start checkout.");
        setStatus("error");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div>
      <button onClick={handleJoin} disabled={status === "loading"} className="btn-primary w-full justify-center">
        {status === "loading" ? "Redirecting to checkout…" : "Continue to payment — $149/year"}
      </button>
      {error && <p className="form-error mt-3"><Icon name="info" />{error}</p>}
    </div>
  );
}
