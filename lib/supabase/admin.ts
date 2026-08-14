import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client. NEVER import this into a client component or
// expose SUPABASE_SERVICE_ROLE_KEY to the browser. Use only in:
//   - the Stripe webhook route (no user session to authorize against)
//   - admin server actions, after requireAdmin() has already checked the
//     caller's session role
//   - the producer enrollment / signup server actions (creating auth users,
//     writing profiles/producers rows that RLS would otherwise block)
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
