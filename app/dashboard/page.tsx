import Link from "next/link";
import { requireActiveMember } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { getMembershipDisplay, fullName, memberNumberLabel } from "@/lib/membership";
import { ARTICLES } from "@/content/articles";
import { RESOURCES_SEED } from "@/lib/data/resourcesSeed";
import Icon, { type IconName } from "@/components/Icon";

export default async function DashboardHome() {
  const profile = await requireActiveMember();
  const status = getMembershipDisplay(profile);

  // Producer-provided memberships surface the enrolling agency's business name
  // here and ONLY here — never on a public page, and never alongside a price.
  let providedBy: string | null = null;
  if (profile.plan === "producer_enrolled" && profile.producer_id) {
    const supabase = await createClient();
    const { data: producer } = await supabase
      .from("producers")
      .select("business_name")
      .eq("id", profile.producer_id)
      .maybeSingle();
    providedBy = producer?.business_name ?? null;
  }

  const pct =
    status.daysLeft !== null ? Math.max(0, Math.min(100, Math.round((status.daysLeft / 365) * 100))) : 100;

  const whatsNew: { title: string; href: string; kind: string; icon: IconName }[] = [
    ...RESOURCES_SEED.filter((r) => r.featured).slice(0, 2).map((r) => ({
      title: r.name,
      href: "/dashboard/perks",
      kind: "Benefit",
      icon: "tag" as IconName,
    })),
    ...ARTICLES.slice(0, 2).map((a) => ({
      title: a.title,
      href: `/dashboard/articles/${a.slug}`,
      kind: "Guide",
      icon: "doc" as IconName,
    })),
  ];

  return (
    <div>
      <div className="welcome">
        <div>
          <h1 className="display" style={{ fontSize: 25 }}>Welcome back, {fullName(profile)}</h1>
          <p style={{ fontSize: 14 }}>
            {whatsNew.length} benefits and guides added since your last visit.
          </p>
          {providedBy && (
            <div className="viaagent">
              <Icon name="badge" />
              <span>
                Your membership is provided by <b>{providedBy}</b>
              </span>
            </div>
          )}
        </div>

        <div className="status">
          <span className={`pill ${status.statusClass}`}>{status.label}</span>
          {status.daysLeft !== null && (
            <div
              className="meter"
              role="img"
              aria-label={`${status.daysLeft} membership days remaining`}
            >
              <i style={{ width: `${pct}%` }} />
            </div>
          )}
          <span className="fineprint mono">
            {status.daysLeft !== null ? `${status.daysLeft} days remaining · ` : ""}
            {memberNumberLabel(profile.member_number)}
          </span>
        </div>
      </div>

      <div className="three" style={{ marginTop: 0, marginBottom: 30, gridTemplateColumns: "repeat(2, 1fr)" }}>
        <Link href="/dashboard/perks" className="perk" style={{ textDecoration: "none" }}>
          <div className="perkhead">
            <span className="icbox"><Icon name="tag" /></span>
            <div>
              <span className="cat">Benefits</span>
              <h4>Browse your member benefits</h4>
            </div>
          </div>
          <p>Travel rates and a full directory of business, financial, and everyday savings.</p>
        </Link>
        <Link href="/dashboard/articles" className="perk" style={{ textDecoration: "none" }}>
          <div className="perkhead">
            <span className="icbox"><Icon name="doc" /></span>
            <div>
              <span className="cat">Guides</span>
              <h4>Home &amp; money guides</h4>
            </div>
          </div>
          <p>Practical articles and printable checklists for home maintenance and budgeting.</p>
        </Link>
      </div>

      <h2 className="display" style={{ fontSize: 20, marginBottom: 14 }}>What&apos;s new</h2>
      <div className="three" style={{ marginTop: 0 }}>
        {whatsNew.map((item) => (
          <Link key={item.title} href={item.href} className="perk" style={{ textDecoration: "none" }}>
            <div className="perkhead">
              <span className="icbox"><Icon name={item.icon} /></span>
              <div>
                <span className="cat">{item.kind}</span>
                <h4>{item.title}</h4>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
