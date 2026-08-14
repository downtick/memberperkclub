"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/emails";

// ============================================================================
// Admin server actions. Every one starts with requireAdmin() (reads the
// caller's session-based role — never trust client input for this) and,
// where it mutates a member, writes a member_events row with actor_id set
// to the acting admin. Follows admin-features.md.
// ============================================================================

export async function setMembershipStatus(memberId: string, status: string, reason?: string) {
  const admin = await requireAdmin();
  const db = createAdminClient();

  await db.from("profiles").update({ membership_status: status }).eq("id", memberId);
  await db.from("member_events").insert({
    member_id: memberId,
    actor_id: admin.id,
    event: "status_set",
    detail: { status, reason },
  });

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/members");
}

export async function grantFreeDays(memberId: string, days: number, reason?: string) {
  const admin = await requireAdmin();
  const db = createAdminClient();

  const { data: member } = await db.from("profiles").select("comp_until, current_period_end, billing_source").eq("id", memberId).single();
  const now = new Date();
  const base = [member?.comp_until, member?.current_period_end]
    .filter(Boolean)
    .map((d: string) => new Date(d))
    .reduce((max, d) => (d > max ? d : max), now);

  const newCompUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  await db
    .from("profiles")
    .update({
      comp_until: newCompUntil.toISOString(),
      billing_source: member?.billing_source === "stripe" ? "stripe" : "comp",
    })
    .eq("id", memberId);

  await db.from("member_events").insert({
    member_id: memberId,
    actor_id: admin.id,
    event: "free_days_granted",
    detail: { days, reason, new_comp_until: newCompUntil.toISOString() },
  });

  revalidatePath(`/admin/members/${memberId}`);
}

export async function setAdminNote(memberId: string, note: string) {
  const admin = await requireAdmin();
  const db = createAdminClient();
  await db.from("profiles").update({ admin_note: note }).eq("id", memberId);
  await db.from("member_events").insert({ member_id: memberId, actor_id: admin.id, event: "status_set", detail: { admin_note: true } });
  revalidatePath(`/admin/members/${memberId}`);
}

export async function toggleAdminRole(memberId: string, makeAdmin: boolean) {
  const admin = await requireAdmin();
  const db = createAdminClient();

  if (!makeAdmin) {
    const { count } = await db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) <= 1) {
      throw new Error("Cannot remove the last remaining admin.");
    }
  }

  await db.from("profiles").update({ role: makeAdmin ? "admin" : "member" }).eq("id", memberId);
  await db.from("member_events").insert({
    member_id: memberId,
    actor_id: admin.id,
    event: makeAdmin ? "admin_granted" : "admin_revoked",
  });

  revalidatePath(`/admin/members/${memberId}`);
}

export async function cancelMembership(memberId: string) {
  const admin = await requireAdmin();
  const db = createAdminClient();
  await db.from("profiles").update({ membership_status: "canceled", comp_until: null }).eq("id", memberId);
  await db.from("member_events").insert({ member_id: memberId, actor_id: admin.id, event: "canceled", detail: { by: "admin" } });
  revalidatePath(`/admin/members/${memberId}`);
}

export interface CreateMemberInput {
  email: string;
  firstName: string;
  lastName: string;
  state?: string;
  compDays: number; // 0 = no access yet
  sendWelcome: boolean;
  passwordMode: "temp" | "link";
  /**
   * Attribute this comp membership to a producer. Makes the account behave
   * exactly like a producer-enrolled one (provided-by band, no price shown,
   * no self-cancel) without billing the producer the $12 wholesale rate.
   */
  producerId?: string;
}

function randomTempPassword(): string {
  return Math.random().toString(36).slice(-6) + Math.random().toString(36).toUpperCase().slice(-4) + "!1";
}

export async function createMemberByAdmin(input: CreateMemberInput) {
  const admin = await requireAdmin();
  const db = createAdminClient();

  const tempPassword = input.passwordMode === "temp" ? randomTempPassword() : undefined;

  const { data: created, error } = await db.auth.admin.createUser({
    email: input.email,
    password: tempPassword,
    email_confirm: true,
  });
  if (error || !created.user) {
    throw new Error(error?.message || "Failed to create auth user.");
  }

  const compUntil = input.compDays > 0 ? new Date(Date.now() + input.compDays * 24 * 60 * 60 * 1000).toISOString() : null;

  const { data: member } = await db
    .from("profiles")
    .update({
      role: "member",
      first_name: input.firstName,
      last_name: input.lastName,
      state: input.state || null,
      plan: input.producerId ? "producer_enrolled" : "retail_annual",
      producer_id: input.producerId || null,
      membership_status: compUntil ? "active" : "pending",
      billing_source: "comp",
      comp_until: compUntil,
    })
    .eq("id", created.user.id)
    .select()
    .single();

  await db.from("member_events").insert({
    member_id: created.user.id,
    actor_id: admin.id,
    event: "member_created_by_admin",
    detail: {
      compDays: input.compDays,
      passwordMode: input.passwordMode,
      producerId: input.producerId || null,
      billed: false,
    },
  });

  let setPasswordLink: string | undefined;
  if (input.passwordMode === "link") {
    const { data: linkData } = await db.auth.admin.generateLink({
      type: "magiclink",
      email: input.email,
    });
    setPasswordLink = linkData?.properties?.action_link;
  }

  if (input.sendWelcome && member) {
    await sendWelcomeEmail({
      to: member.email,
      firstName: member.first_name || "",
      memberNumber: member.member_number || "",
      tempPassword,
      setPasswordLink,
    }).catch((err) => console.error("Admin-created welcome email error:", err));

    await db.from("member_events").insert({ member_id: created.user.id, actor_id: admin.id, event: "welcome_email_sent" });
  }

  revalidatePath("/admin/members");
  return { id: created.user.id, memberNumber: member?.member_number };
}
