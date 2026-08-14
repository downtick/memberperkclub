"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      className="text-xs font-semibold"
      style={{ color: "var(--danger)" }}
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this item?")) return;
        startTransition(async () => {
          await onDelete();
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
