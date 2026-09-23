import { NextResponse } from "next/server";
import { buildProspectEmailHtml } from "@/lib/emails";

export const dynamic = "force-dynamic";

// Serves the convention prospect email's HTML so it can be pulled straight
// into Sendy's autoresponder editor (and re-copied later if the copy ever
// needs updating). CORS is open because Sendy runs on another domain.
// Marketing copy only — no secrets, no member data.
export async function GET() {
  return new NextResponse(buildProspectEmailHtml(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
