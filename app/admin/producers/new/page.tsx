import NewProducerForm from "@/components/admin/NewProducerForm";

export default function NewProducerPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-3xl mb-2">Add a Producer</h1>
      <p className="text-[var(--ink-3)] mb-8">
        Set up a producer account by hand — for an agent who signs up by phone or in person
        instead of through the public form.
      </p>
      <NewProducerForm />
    </div>
  );
}
