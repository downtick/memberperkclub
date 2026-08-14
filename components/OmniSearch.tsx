"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

interface SearchIndexEntry {
  type: "resource" | "article";
  title: string;
  href: string;
  subtitle: string;
}

// Client-side fuzzy-ish search across benefits + guides. Loads a small
// preloaded JSON index (built server-side, see app/api/search-index/route.ts)
// rather than standing up a search-index service — fine for a v1 catalog
// this size.
export default function OmniSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<SearchIndexEntry[]>([]);

  useEffect(() => {
    if (open && index.length === 0) {
      fetch("/api/search-index")
        .then((r) => r.json())
        .then((data) => setIndex(data.items || []))
        .catch(() => setIndex([]));
    }
  }, [open, index.length]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.trim().toLowerCase();
    return index
      .filter(
        (i) => i.title.toLowerCase().includes(needle) || i.subtitle.toLowerCase().includes(needle)
      )
      .slice(0, 8);
  }, [q, index]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Search benefits, codes, and guides"
        aria-expanded={open}
        className="btn btn-ghost"
        style={{ padding: "9px 13px" }}
      >
        <Icon name="search" />
        <span className="hidden sm:inline" style={{ fontWeight: 500, color: "var(--ink-3)" }}>Search</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 panel"
          style={{ width: 320, zIndex: 50, padding: 14, gap: 8 }}
          role="dialog"
          aria-label="Search"
        >
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search benefits, codes, and guides"
            className="form-input"
          />
          <div style={{ maxHeight: 288, overflowY: "auto" }}>
            {q.trim() && results.length === 0 && (
              <p className="fineprint" style={{ padding: "8px 4px" }}>No matches.</p>
            )}
            {results.map((r) => (
              <Link
                key={r.href + r.title}
                href={r.href}
                onClick={() => setOpen(false)}
                className="block"
                style={{ padding: "8px 8px", borderRadius: 9, textDecoration: "none" }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: 0 }}>{r.title}</p>
                <p className="fineprint" style={{ margin: 0 }}>{r.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
