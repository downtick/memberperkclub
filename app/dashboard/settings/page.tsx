import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/access";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const profile = await requireActiveMember();

  return (
    <div className="max-w-md">
      <h1 className="text-3xl mb-2">Account Settings</h1>
      <p className="text-[var(--ink-3)] mb-8">
        {profile.plan === "producer_enrolled"
          ? "Your account settings only let you update your email and password."
          : "Update your email and password."}
      </p>
      <SettingsForm currentEmail={profile.email} />
    </div>
  );
}
