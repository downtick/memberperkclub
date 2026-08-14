import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/access";

// Sends a freshly-signed-in user to the right place based on their role.
// Used as the landing target for both password login and magic-link login.
export default async function PostLoginPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "producer") redirect("/producer/dashboard");
  redirect("/dashboard");
}
