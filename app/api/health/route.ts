import { NextResponse } from "next/server";

// Reports which integrations are configured on THIS deployment. Reports
// presence only — never a key, a prefix, or a length — so it is safe to hit
// from anywhere. Saves guessing which env var is missing when something that
// should send an email quietly doesn't.
export const dynamic = "force-dynamic";

export function GET() {
  const has = (v?: string) => Boolean(v && v.trim().length > 0);

  const supabase =
    has(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    has(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json({
    supabase: {
      publicKeys: supabase,
      serviceRole: has(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    email: {
      smtp2go: has(process.env.SMTP2GO_API_KEY),
      from: has(process.env.EMAIL_FROM),
      adminNotify: has(process.env.ADMIN_NOTIFY_EMAIL),
    },
    stripe: {
      secret: has(process.env.STRIPE_SECRET_KEY),
      publishable: has(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      annualPrice: has(process.env.STRIPE_PRICE_ANNUAL),
      webhookSecret: has(process.env.STRIPE_WEBHOOK_SECRET),
    },
    site: {
      url: process.env.NEXT_PUBLIC_SITE_URL || null,
    },
  });
}
