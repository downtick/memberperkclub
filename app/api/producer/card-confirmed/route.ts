import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Called client-side right after a producer's SetupIntent confirms
// successfully, to persist the resulting default payment method id so
// /api/producer/enroll can charge it off-session later.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { paymentMethodId } = await request.json();
  if (!paymentMethodId) return NextResponse.json({ error: "Missing payment method." }, { status: 400 });

  const admin = createAdminClient();
  await admin.from("producers").update({ stripe_payment_method_id: paymentMethodId }).eq("id", user.id);

  return NextResponse.json({ success: true });
}
