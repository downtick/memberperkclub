import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <section className="section flex-1 flex items-center justify-center py-16 px-6">
      <div className="max-w-md w-full">
        <h1 className="text-3xl mb-2 text-center">Log In</h1>
        <p className="text-[var(--ink-3)] text-center mb-8">
          Members, producers, and admins all log in here.
        </p>
        <div className="card p-8">
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
