import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveMember } from "@/lib/access";
import { ARTICLES } from "@/content/articles";

export const metadata: Metadata = { title: "Articles" };

const CATEGORIES = ["Home", "Budgeting", "Printable"] as const;

export default async function ArticlesPage() {
  await requireActiveMember();

  return (
    <div>
      <h1 className="text-3xl mb-2">Articles &amp; Guides</h1>
      <p className="text-[var(--ink-3)] mb-8">
        Practical, plain-language guides for your home and your budget — including printable
        checklists and worksheets.
      </p>

      {CATEGORIES.map((cat) => {
        const items = ARTICLES.filter((a) => a.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mb-10">
            <h2 className="text-xl mb-3">{cat === "Printable" ? "Printables" : cat}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <Link key={a.slug} href={`/dashboard/articles/${a.slug}`} className="card card-hover p-5 block">
                  {a.printable && <span className="badge !py-0.5 !px-2 text-[10px] mb-2 inline-flex">Printable</span>}
                  <h3 className="font-semibold mb-1">{a.title}</h3>
                  <p className="text-sm text-[var(--ink-3)]">{a.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
