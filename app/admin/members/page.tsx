import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { memberNumberDigits } from "@/lib/membership";
import { requireAdmin } from "@/lib/access";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q = "", status = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, member_number, role, membership_status, plan, created_at")
    .eq("role", "member")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("membership_status", status);
  if (q) query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,member_number.ilike.%${q}%`);

  const { data: members } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl">Members</h1>
        <Link href="/admin/members/new" className="btn-dark !py-2 !px-4 text-sm">+ Add member</Link>
      </div>

      <form className="flex flex-wrap gap-3 mb-6" method="GET">
        <input name="q" defaultValue={q} placeholder="Search name, email, member #…" className="form-input max-w-xs" />
        <select name="status" defaultValue={status} className="form-input max-w-[180px]">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="past_due">Past due</option>
          <option value="lapsed">Lapsed</option>
          <option value="canceled">Canceled</option>
          <option value="pending">Pending</option>
        </select>
        <button type="submit" className="btn-outline">Filter</button>
      </form>

      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b" style={{ borderColor: "var(--rule)" }}>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Member no.</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((m) => (
              <tr key={m.id} className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="p-3">
                  <Link href={`/admin/members/${m.id}`} className="nav-link font-semibold">
                    {[m.first_name, m.last_name].filter(Boolean).join(" ") || "—"}
                  </Link>
                </td>
                <td className="p-3">{m.email}</td>
                <td className="p-3 mono">{memberNumberDigits(m.member_number)}</td>
                <td className="p-3">{m.plan === "producer_enrolled" ? "Producer-enrolled" : "Retail"}</td>
                <td className="p-3 capitalize">{m.membership_status}</td>
              </tr>
            ))}
            {(!members || members.length === 0) && (
              <tr><td colSpan={5} className="p-6 text-center text-[var(--ink-3)]">No members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
