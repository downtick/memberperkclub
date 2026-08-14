"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertArticle, type ArticleInput } from "@/lib/admin/resourceActions";
import Icon from "@/components/Icon";

const CATEGORIES = ["Home", "Budgeting", "Printable"];

export default function ArticleForm({ initial }: { initial?: ArticleInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<ArticleInput>(
    initial || { slug: "", title: "", summary: "", category: CATEGORIES[0], printable: false, published: true }
  );
  const [error, setError] = useState("");

  function set<K extends keyof ArticleInput>(k: K, v: ArticleInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await upsertArticle(values);
        router.push("/admin/articles");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
      <div>
        <label className="form-label">Title</label>
        <input className="form-input" value={values.title} onChange={(e) => set("title", e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Slug</label>
        <input className="form-input" value={values.slug} onChange={(e) => set("slug", e.target.value)} required />
        <p className="text-xs text-[var(--ink-3)] mt-1">
          Must match an entry in content/articles/index.tsx for the body to render.
        </p>
      </div>
      <div>
        <label className="form-label">Summary</label>
        <textarea className="form-input" rows={2} value={values.summary} onChange={(e) => set("summary", e.target.value)} />
      </div>
      <div>
        <label className="form-label">Category</label>
        <select className="form-input" value={values.category} onChange={(e) => set("category", e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={values.printable} onChange={(e) => set("printable", e.target.checked)} /> Printable
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={values.published} onChange={(e) => set("published", e.target.checked)} /> Published
        </label>
      </div>
      {error && <p className="form-error"><Icon name="info" />{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save article"}</button>
    </form>
  );
}
