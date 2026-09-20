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
