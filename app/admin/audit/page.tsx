import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAuditPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("member_events")
    .select("*, member:profiles!member_events_member_id_fkey(email, first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-3xl mb-6">Site-Wide Audit Log</h1>
      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b" style={{ borderColor: "var(--rule)" }}>
              <th className="p-3">When</th>
              <th className="p-3">Member</th>
              <th className="p-3">Event</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((e) => (
              <tr key={e.id} className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="p-3 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                <td className="p-3">
                  <Link href={`/admin/members/${e.member_id}`} className="nav-link font-semibold">
                    {e.member?.email || e.member_id}
                  </Link>
                </td>
                <td className="p-3">{e.event}</td>
                <td className="p-3">{e.actor_id ? "Admin" : "System"}</td>
                <td className="p-3 text-xs text-[var(--ink-3)] max-w-xs truncate">{e.detail ? JSON.stringify(e.detail) : ""}</td>
              </tr>
            ))}
            {(!events || events.length === 0) && (
              <tr><td colSpan={5} className="p-6 text-center text-[var(--ink-3)]">No events yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
