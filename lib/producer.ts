import { createAdminClient } from "@/lib/supabase/admin";

// Whether this producer has a card on file. The enroll API rejects the
// request without one, but until this was checked up front the producer only
// found out AFTER filling in a client's details and pressing the charge
// button — the failure arrived at the worst possible moment.
export async function producerHasPaymentMethod(producerId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("producers")
    .select("stripe_customer_id, stripe_payment_method_id")
    .eq("id", producerId)
    .maybeSingle();

  return Boolean(data?.stripe_customer_id && data?.stripe_payment_method_id);
}

// Renewal is offered only inside this window (or after expiry). Outside it a
// stray click would silently stack another year and charge $12 early.
export const RENEWAL_WINDOW_DAYS = 60;

// The renewed term starts from the LATER of now and the current end date, so
// renewing early never costs the client days and renewing late never
// back-dates a term that already lapsed.
export function nextExpiry(currentExpiresAt: string | null, now: Date = new Date()): Date {
  const base = currentExpiresAt && new Date(currentExpiresAt) > now ? new Date(currentExpiresAt) : now;
  const next = new Date(base);
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function canRenew(expiresAt: string | null, now: Date = new Date()): boolean {
  if (!expiresAt) return true;
  const days = (new Date(expiresAt).getTime() - now.getTime()) / 86400000;
  return days <= RENEWAL_WINDOW_DAYS;
}
