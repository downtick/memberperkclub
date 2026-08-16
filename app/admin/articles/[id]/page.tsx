import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "@/components/admin/ArticleForm";
import { requireAdmin } from "@/lib/access";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from("articles").select("*").eq("id", id).single();
  if (!article) notFound();

  return (
    <div>
      <h1 className="text-3xl mb-6">Edit Article</h1>
      <ArticleForm initial={article} />
    </div>
  );
}
