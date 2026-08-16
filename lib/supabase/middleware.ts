import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session cookie on every request. Wired into
// the root middleware.ts. Does NOT do route gating itself — page-level
// requireMember()/requireAdmin()/requireProducer() helpers do that — this
// just keeps the session cookie alive so those helpers see a valid user.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // The matcher runs this on every route, so a missing/blank Supabase config
  // would crash the entire site — including the public marketing pages that
  // need no auth at all. Pass the request through untouched instead; the
  // page-level require*() helpers still refuse access to gated routes.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
