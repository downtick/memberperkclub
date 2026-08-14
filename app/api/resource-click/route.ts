import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Logs an outbound perk click for reporting ("members saved $X / most-used
// perks"). Best-effort: never blocks the redirect, never errors loudly if
// Supabase isn't configured yet in Phase 1.
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: true });

    const { data: resource } = await supabase
      .from("resources")
      .select("id")
      .eq("affiliate_url", url)
      .maybeSingle();

    if (resource) {
      await supabase.from("resource_clicks").insert({ resource_id: resource.id, profile_id: user.id });
    }
  } catch {
    // best-effort only
  }
  return NextResponse.json({ ok: true });
}
