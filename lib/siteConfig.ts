// Single source of truth for brand identity.
//
// Every user-facing occurrence of the name resolves through here (or through
// NEXT_PUBLIC_SITE_NAME / NEXT_PUBLIC_SITE_DOMAIN) so a rebrand is a one-line
// change rather than a 40-file sweep. Do not hardcode the brand name in new
// components; import SITE instead.
export const SITE = {
  /** Display name used in copy, headings, the header/footer, and emails. */
  name: process.env.NEXT_PUBLIC_SITE_NAME || "MemberPerkClub",
  /** Bare domain, no protocol. */
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || "memberperkclub.com",
  /** Full origin, used for metadataBase, Stripe redirects, and email links. */
  get url() {
    return process.env.NEXT_PUBLIC_SITE_URL || `https://${this.domain}`;
  },
  /** Registered entity named in the legal pages. */
  legalEntity: process.env.NEXT_PUBLIC_SITE_LEGAL_ENTITY || "MemberPerkClub, LLC",
  /** Single letter/short mark fallback; the brand mark itself is the i-spark icon. */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@memberperkclub.com",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@memberperkclub.com",
} as const;
