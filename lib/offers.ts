// Server-side allowlist of special-price offers.
//
// The browser sends only a SLUG. The price id is read from the environment
// here, never from the request, so nobody can point checkout at a price of
// their choosing by editing the URL.
//
// A business member is stored as a normal retail subscriber, because that is
// what they are: the same yearly auto-renewing membership at a different
// price. Only the Stripe price differs, so no database change is needed. The
// offer they used is recorded in Stripe metadata and in member_events.
export type Offer = {
  slug: string;
  /** Env var holding the Stripe Price id for this offer. */
  priceEnv: string;
  /** Shown on the page and in checkout. */
  priceLabel: string;
  label: string;
};

export const OFFERS: Record<string, Offer> = {
  business: {
    slug: "business",
    priceEnv: "STRIPE_PRICE_BUSINESS",
    priceLabel: "$19 a year",
    label: "Small business member rate",
  },
};

export function getOffer(slug: unknown): Offer | null {
  if (typeof slug !== "string") return null;
  return OFFERS[slug] ?? null;
}

export function offerPriceId(offer: Offer): string {
  return process.env[offer.priceEnv]?.trim() || "";
}
