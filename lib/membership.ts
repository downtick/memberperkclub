import type { Profile } from "./types";

export interface MembershipDisplay {
  label: string;
  detail: string;
  daysLeft: number | null;
  /** Maps onto the `.pill` modifier classes in globals.css. */
  statusClass: "on" | "soon" | "off";
}

// Single place that turns a profile's raw status/plan/dates into the
// dashboard status badge + "days left" indicator, for both membership paths.
export function getMembershipDisplay(profile: Profile): MembershipDisplay {
  const now = new Date();
  const expiry =
    profile.plan === "producer_enrolled"
      ? profile.expires_at
        ? new Date(profile.expires_at)
        : null
      : profile.current_period_end
      ? new Date(profile.current_period_end)
      : profile.comp_until
      ? new Date(profile.comp_until)
      : null;

  const hasAccess =
    profile.membership_status === "active" ||
    profile.membership_status === "past_due" ||
    (profile.comp_until && new Date(profile.comp_until) > now);

  if (!hasAccess) {
    return {
      label: profile.membership_status === "pending" ? "Pending" : "Lapsed",
      detail: "Your membership isn't currently active.",
      daysLeft: null,
      statusClass: profile.membership_status === "pending" ? "soon" : "off",
    };
  }

  const daysLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const fullDate = expiry
    ? expiry.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const renewalNote =
    profile.plan === "producer_enrolled"
      ? "does not auto-renew"
      : "renews automatically";

  return {
    label: `Active${fullDate ? ` through ${fullDate}` : ""}`,
    detail: expiry ? `Membership ${renewalNote} — ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining.` : "Membership is active.",
    daysLeft,
    statusClass: daysLeft !== null && daysLeft <= 30 ? "soon" : "on",
  };
}

export function fullName(profile: Pick<Profile, "first_name" | "last_name">): string {
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "there";
}

// The DB stores member numbers as `MPC-000482`, but nothing user-facing shows
// the prefix — this is a membership, not a card with an embossed number. The
// UI renders the digits only, e.g. "Member no. 000482".
export function memberNumberDigits(memberNumber: string | null | undefined): string {
  if (!memberNumber) return "—";
  return memberNumber.replace(/^MPC-/i, "");
}

export function memberNumberLabel(memberNumber: string | null | undefined): string {
  return `Member no. ${memberNumberDigits(memberNumber)}`;
}
