import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteResource } from "@/lib/admin/resourceActions";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const { data: resources } = await supabase.from("resources").select("*").order("category").order("sort");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">Resources (Perks Directory)</h1>
        <Link href="/admin/resources/new" className="btn-dark !py-2 !px-4 text-sm">+ Add resource</Link>
      </div>

      {(!resources || resources.length === 0) && (
        <p className="text-sm text-[var(--ink-3)] mb-6">
          No resources in the database yet — run <code>supabase/seed.sql</code> to load the starter
          directory from websites/_reference/non-insurance-affiliate-links.md.
        </p>
      )}

      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b" style={{ borderColor: "var(--rule)" }}>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(resources ?? []).map((r) => (
              <tr key={r.id} className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3">{r.category}</td>
                <td className="p-3">{r.featured ? "Yes" : "—"}</td>
                <td className="p-3">{r.active ? "Yes" : "No"}</td>
                <td className="p-3 flex gap-3">
                  <Link href={`/admin/resources/${r.id}`} className="text-xs font-semibold nav-link" style={{ color: "var(--violet)" }}>Edit</Link>
                  <DeleteButton onDelete={deleteResource.bind(null, r.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
