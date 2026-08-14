import NewMemberForm from "@/components/admin/NewMemberForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewMemberPage() {
  const supabase = await createClient();
  const { data: producers } = await supabase
    .from("producers")
    .select("id, business_name")
    .order("business_name");

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl mb-2">Add a Member</h1>
      <p className="text-[var(--ink-3)] mb-8">
        Hand-create a comp or manually-managed member and send the welcome email.
      </p>
      <NewMemberForm producers={producers ?? []} />
    </div>
  );
}
