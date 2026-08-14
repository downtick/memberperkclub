import { createClient } from "@/lib/supabase/server";

export default async function AdminProducersPage() {
  const supabase = await createClient();

  const { data: producerProfiles } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone, state, member_number, created_at")
    .eq("role", "producer")
    .order("created_at", { ascending: false });

  const { data: producerRows } = await supabase.from("producers").select("*");
  const producerMap = new Map((producerRows ?? []).map((p) => [p.id, p]));

  const { data: clientCounts } = await supabase
    .from("profiles")
    .select("producer_id")
    .eq("role", "member")
    .not("producer_id", "is", null);
  const countMap = new Map<string, number>();
  (clientCounts ?? []).forEach((c) => {
    if (c.producer_id) countMap.set(c.producer_id, (countMap.get(c.producer_id) || 0) + 1);
  });

  return (
    <div>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 20 }}>Producers</h1>

      <div className="card scroller" style={{ padding: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Mailing address</th>
              <th>Billing</th>
              <th>Payment method</th>
              <th>Memberships given</th>
            </tr>
          </thead>
          <tbody>
            {(producerProfiles ?? []).map((p) => {
              const row = producerMap.get(p.id);
              const address = row
                ? [row.address_line1, row.address_line2, [row.city, row.state, row.postal_code].filter(Boolean).join(" ")]
                    .filter(Boolean)
                    .join(", ")
                : "—";
              return (
                <tr key={p.id}>
                  <td>{row?.business_name || "—"}</td>
                  <td>{[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td>{p.email}</td>
                  <td className="mono">{p.phone}</td>
                  <td>{address}</td>
                  <td style={{ textTransform: "capitalize" }}>{(row?.billing_mode || "per_client").replace("_", " ")}</td>
                  <td>
                    {row?.stripe_payment_method_id ? (
                      <span className="pill on">On file</span>
                    ) : (
                      <span className="pill soon">None</span>
                    )}
                  </td>
                  <td className="mono">{countMap.get(p.id) || 0}</td>
                </tr>
              );
            })}
            {(!producerProfiles || producerProfiles.length === 0) && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 24, color: "var(--ink-3)" }}>
                  No producers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
