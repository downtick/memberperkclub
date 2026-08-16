import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { MemberAccess, Profile } from "./types";

// Reads the signed-in user's profile (server-side, session-based). Returns
// null if not signed in. This is the single place every gate should read
// from — never trust client-provided role/status.
/**
 * True once the Supabase environment variables are present. The public
 * marketing pages render the Header, which asks for the current profile, so
 * without this check an unconfigured deploy 500s on every page instead of
 * simply showing a logged-out site.
 */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isAuthConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
}

export async function getCurrentAccess(): Promise<MemberAccess | null> {
  if (!isAuthConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("member_access").select("*").eq("id", user.id).single();
  return (data as MemberAccess) ?? null;
}

// Gate for /dashboard/* member-only pages: must be signed in AND have
// has_access (active/past_due Stripe status OR a valid comp_until).
export async function requireActiveMember(): Promise<MemberAccess> {
  const access = await getCurrentAccess();
  if (!access) redirect("/login");
  if (access.role === "admin") return access; // admins can preview member pages
  if (!access.has_access) redirect("/dashboard/billing?renew=1");
  return access;
}

// Gate for /producer/* pages
export async function requireProducer(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "producer" && profile.role !== "admin") redirect("/dashboard");
  return profile;
}

// Gate for /admin/* pages
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}
