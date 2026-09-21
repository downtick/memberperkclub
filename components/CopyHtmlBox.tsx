"use client";

import { useState } from "react";

// Preview + one-click copy of an email's HTML, for pasting into Sendy.
export default function CopyHtmlBox({ html }: { html: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div>
      <button type="button" onClick={copy} className="btn btn-primary" style={{ marginBottom: 12 }}>
        {copied ? "Copied ✓" : "Copy HTML"}
      </button>
      <iframe
        title="Email preview"
        srcDoc={html}
        sandbox=""
        style={{ width: "100%", maxWidth: 680, height: 900, border: "1px solid var(--rule)", borderRadius: 12, background: "#fff" }}
      />
    </div>
  );
}
