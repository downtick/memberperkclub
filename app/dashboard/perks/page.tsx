import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/access";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { RESOURCES_SEED, RESOURCE_CATEGORIES } from "@/lib/data/resourcesSeed";
import ResourceClickLink from "@/components/ResourceClickLink";
import CopyCodeButton from "@/components/CopyCodeButton";
import Icon, { type IconName } from "@/components/Icon";

export const metadata: Metadata = { title: "Member benefits" };

// One icon per category, drawn from the custom set — no emoji anywhere.
const CATEGORY_ICON: Record<string, IconName> = {
  Business: "case",
  Personal: "user",
  "Health & Beauty": "leaf",
  Financial: "bars",
  "Home & Auto": "home",
};

// A discount_code value is either a bare code ("CLUB15") or a human phrase
// ("$50 off", "10% off with this link"). Only a bare code is copyable.
function bareCode(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return /^[A-Z0-9][A-Z0-9._-]{2,23}$/.test(trimmed) ? trimmed : null;
}

export default async function PerksPage() {
  await requireActiveMember();

  return (
    <div>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 6 }}>Your member benefits</h1>
      <p className="lede" style={{ marginBottom: 20 }}>
        Travel rates and a directory of business, personal, and everyday savings.
      </p>

      <AffiliateDisclosure className="mb-6" />

      {/* ── Travel ── */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="display" style={{ fontSize: 20, marginBottom: 14 }}>Travel</h2>
        <div className="three" style={{ marginTop: 0 }}>
          <div className="perk">
            <div className="perkhead">
              <span className="icbox"><Icon name="bed" /></span>
              <div>
                <span className="cat">Travel</span>
                <h4>Hotel &amp; rental car rates</h4>
              </div>
            </div>
            <p>Member pricing on hotel rooms, frequently below the rate shown to the public.</p>
            <div className="perkfoot">
              <span className="fineprint">Opens with your member link</span>
              <ResourceClickLink href="https://book.hotelroomdiscounters.com/signup?affliateLink=c1de0512-c6c3-4b70-b3c3-12ecfdd9ce25" />
            </div>
          </div>
          <div className="perk">
            <div className="perkhead">
              <span className="icbox"><Icon name="anchor" /></span>
              <div>
                <span className="cat">Travel</span>
                <h4>Cruise shore excursions</h4>
              </div>
            </div>
            <p>Book excursions directly instead of through the ship&apos;s excursion desk.</p>
            <div className="perkfoot">
              <span className="fineprint">Opens with your member link</span>
              <ResourceClickLink href="https://www.ventureashore.com/account/affiliate-link?linkid=1040564" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Category directory ── */}
      {RESOURCE_CATEGORIES.map((cat) => {
        const items = RESOURCES_SEED.filter((r) => r.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} style={{ marginBottom: 40 }}>
            <h2 className="display" style={{ fontSize: 20, marginBottom: 14 }}>{cat}</h2>
            <div className="three" style={{ marginTop: 0 }}>
              {items.map((r) => {
                const code = bareCode(r.discount_code);
                return (
                  <div key={r.name} className="perk">
                    <div className="perkhead">
                      <span className="icbox"><Icon name={CATEGORY_ICON[cat] ?? "tag"} /></span>
                      <div>
                        <span className="cat">{r.featured ? `${cat} · Featured` : cat}</span>
                        <h4>{r.name}</h4>
                      </div>
                    </div>
                    <p>{r.description}</p>
                    <div className="perkfoot">
                      {code ? (
                        <>
                          <span className="codechip">{code}</span>
                          <CopyCodeButton code={code} />
                        </>
                      ) : (
                        <span className="fineprint">
                          {r.discount_code || "Opens with your member link"}
                        </span>
                      )}
                      {!code && <ResourceClickLink href={r.affiliate_url} />}
                    </div>
                    {code && (
                      <div className="perkfoot" style={{ marginTop: 0 }}>
                        <span className="fineprint">Opens with your member link</span>
                        <ResourceClickLink href={r.affiliate_url} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
