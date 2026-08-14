import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client for client components (login form, magic
// link request, etc). Governed by RLS via the anon key.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
