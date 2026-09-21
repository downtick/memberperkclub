import type { Metadata } from "next";
import ProspectCapture from "@/components/ProspectCapture";
import CopyHtmlBox from "@/components/CopyHtmlBox";
import { sendyConfigured } from "@/lib/sendy";
import { buildProspectEmailHtml } from "@/lib/emails";

export const metadata: Metadata = { title: "Convention prospects" };
export const dynamic = "force-dynamic";

export default function ProspectsPage() {
  const configured = sendyConfigured();
  const html = buildProspectEmailHtml();

  return (
    <div>
      <h1 className="text-3xl mb-2">Convention prospects</h1>
      <p className="text-[var(--ink-3)] mb-6" style={{ maxWidth: 620 }}>
        Type an email and press Send. The person is added to the Sendy prospect list, and Sendy&apos;s
        autoresponder emails them the welcome within a few minutes. Anyone who unsubscribed before is
        never re-added.
      </p>

      <ProspectCapture configured={configured} />

      <details style={{ marginTop: 40 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          The welcome email (HTML to paste into the Sendy autoresponder)
        </summary>
        <p style={{ fontSize: 14, color: "var(--ink-3)", margin: "10px 0" }}>
          Replace <code>[YOUR NAME]</code> and <code>[YOUR MAILING ADDRESS]</code> before pasting. The
          mailing address is required by law in commercial email.
        </p>
        <CopyHtmlBox html={html} />
      </details>
    </div>
  );
}
