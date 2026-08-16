import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteArticle } from "@/lib/admin/resourceActions";
import DeleteButton from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/access";

export default async function AdminArticlesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: articles } = await supabase.from("articles").select("*").order("category").order("title");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">Articles</h1>
        <Link href="/admin/articles/new" className="btn-dark !py-2 !px-4 text-sm">+ Add article</Link>
      </div>

      {(!articles || articles.length === 0) && (
        <p className="text-sm text-[var(--ink-3)] mb-6">
          No articles in the database yet — run <code>supabase/seed.sql</code> to load the starter
          library.
        </p>
      )}

      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b" style={{ borderColor: "var(--rule)" }}>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Printable</th>
              <th className="p-3">Published</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(articles ?? []).map((a) => (
              <tr key={a.id} className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="p-3 font-semibold">{a.title}</td>
                <td className="p-3">{a.category}</td>
                <td className="p-3">{a.printable ? "Yes" : "—"}</td>
                <td className="p-3">{a.published ? "Yes" : "No"}</td>
                <td className="p-3 flex gap-3">
                  <Link href={`/admin/articles/${a.id}`} className="text-xs font-semibold nav-link" style={{ color: "var(--violet)" }}>Edit</Link>
                  <DeleteButton onDelete={deleteArticle.bind(null, a.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
