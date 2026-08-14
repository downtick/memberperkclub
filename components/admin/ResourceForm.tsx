"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertResource, type ResourceInput } from "@/lib/admin/resourceActions";
import { RESOURCE_CATEGORIES } from "@/lib/data/resourcesSeed";
import Icon from "@/components/Icon";

export default function ResourceForm({ initial }: { initial?: ResourceInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<ResourceInput>(
    initial || {
      name: "",
      category: RESOURCE_CATEGORIES[0],
      description: "",
      affiliate_url: "",
      discount_code: "",
      code_instructions: "",
      featured: false,
      active: true,
      sort: 0,
    }
  );
  const [error, setError] = useState("");

  function set<K extends keyof ResourceInput>(k: K, v: ResourceInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await upsertResource(values);
        router.push("/admin/resources");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
      <div>
        <label className="form-label">Name</label>
        <input className="form-input" value={values.name} onChange={(e) => set("name", e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Category</label>
        <select className="form-input" value={values.category} onChange={(e) => set("category", e.target.value)}>
          {RESOURCE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea className="form-input" rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div>
        <label className="form-label">Affiliate URL</label>
        <input className="form-input" value={values.affiliate_url} onChange={(e) => set("affiliate_url", e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Discount code (optional)</label>
        <input className="form-input" value={values.discount_code || ""} onChange={(e) => set("discount_code", e.target.value)} />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={values.active} onChange={(e) => set("active", e.target.checked)} /> Active
        </label>
      </div>
      <div>
        <label className="form-label">Sort order</label>
        <input type="number" className="form-input w-28" value={values.sort} onChange={(e) => set("sort", Number(e.target.value))} />
      </div>
      {error && <p className="form-error"><Icon name="info" />{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save resource"}</button>
    </form>
  );
}
