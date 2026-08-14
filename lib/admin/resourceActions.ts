"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ResourceInput {
  id?: string;
  name: string;
  category: string;
  description: string;
  affiliate_url: string;
  discount_code?: string;
  code_instructions?: string;
  featured: boolean;
  active: boolean;
  sort: number;
}

export async function upsertResource(input: ResourceInput) {
  await requireAdmin();
  const db = createAdminClient();
  const { id, ...rest } = input;
  if (id) {
    await db.from("resources").update(rest).eq("id", id);
  } else {
    await db.from("resources").insert(rest);
  }
  revalidatePath("/admin/resources");
}

export async function deleteResource(id: string) {
  await requireAdmin();
  const db = createAdminClient();
  await db.from("resources").delete().eq("id", id);
  revalidatePath("/admin/resources");
}

export interface ArticleInput {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  printable: boolean;
  published: boolean;
}

export async function upsertArticle(input: ArticleInput) {
  await requireAdmin();
  const db = createAdminClient();
  const { id, ...rest } = input;
  if (id) {
    await db.from("articles").update(rest).eq("id", id);
  } else {
    await db.from("articles").insert(rest);
  }
  revalidatePath("/admin/articles");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  const db = createAdminClient();
  await db.from("articles").delete().eq("id", id);
  revalidatePath("/admin/articles");
}
