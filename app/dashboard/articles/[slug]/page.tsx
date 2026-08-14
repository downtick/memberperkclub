import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/access";
import { ARTICLES, getArticleBySlug } from "@/content/articles";
import PrintButton from "@/components/PrintButton";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  return { title: article?.title || "Article" };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireActiveMember();
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/articles" className="text-sm text-[var(--ink-3)] nav-link mb-4 inline-block">
        Back to guides
      </Link>
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-3xl">{article.title}</h1>
        {article.printable && <PrintButton />}
      </div>
      <article className={`prose-warm ${article.printable ? "print-sheet" : ""}`}>{article.body}</article>
    </div>
  );
}
