import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { memberNumberDigits } from "@/lib/membership";
import { requireAdmin } from "@/lib/access";

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ count: active }, { count: lapsed }, { count: producerEnrolled }, { count: producers }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "member").eq("membership_status", "active"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "member").in("membership_status", ["lapsed", "canceled"]),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "member").eq("plan", "producer_enrolled"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "producer"),
  ]);

  const { data: recent } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, member_number, role, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { label: "Active members", value: active ?? 0 },
    { label: "Lapsed / canceled", value: lapsed ?? 0 },
    { label: "Producer-enrolled", value: producerEnrolled ?? 0 },
    { label: "Producers", value: producers ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-3xl mb-8">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-3xl font-display">{s.value}</p>
            <p className="text-sm text-[var(--ink-3)]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">Recent sign-ups</h2>
        <Link href="/admin/members" className="text-sm nav-link" style={{ color: "var(--violet)" }}>View all members</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b" style={{ borderColor: "var(--rule)" }}>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Member no.</th>
              <th className="p-3">Role</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(recent ?? []).map((p) => (
              <tr key={p.id} className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="p-3">
                  <Link href={`/admin/members/${p.id}`} className="nav-link font-semibold">
                    {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                  </Link>
                </td>
                <td className="p-3">{p.email}</td>
                <td className="p-3 mono">{memberNumberDigits(p.member_number)}</td>
                <td className="p-3 capitalize">{p.role}</td>
                <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
