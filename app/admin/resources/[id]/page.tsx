import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResourceForm from "@/components/admin/ResourceForm";
import { requireAdmin } from "@/lib/access";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data: resource } = await supabase.from("resources").select("*").eq("id", id).single();
  if (!resource) notFound();

  return (
    <div>
      <h1 className="text-3xl mb-6">Edit Resource</h1>
      <ResourceForm initial={resource} />
    </div>
  );
}
