import type { NextConfig } from "next";

// Supabase origin for connect-src, pinned to this project's ref at build time.
// Falls back to the wildcard if the env var is missing or malformed.
function supabaseOrigin(): string {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    if (u.protocol === "https:" && /^[a-z0-9-]+\.supabase\.co$/i.test(u.hostname)) return u.origin;
  } catch {
    /* fall through */
  }
  return "https://*.supabase.co";
}

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.stripe.com",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin()} https://api.stripe.com`,
  "frame-src 'self' https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://billing.stripe.com https://checkout.stripe.com",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
        ],
      },
    ];
  },
};

export default nextConfig;
