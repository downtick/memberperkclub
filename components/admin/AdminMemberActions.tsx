"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setMembershipStatus,
  grantFreeDays,
  toggleAdminRole,
  cancelMembership,
  setAdminNote,
} from "@/lib/admin/actions";
import type { Profile } from "@/lib/types";
import Icon from "@/components/Icon";

export default function AdminMemberActions({ member }: { member: Profile }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState(member.admin_note || "");
  const [error, setError] = useState("");

  function run(fn: () => Promise<unknown>) {
    setError("");
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && <p className="form-error"><Icon name="info" />{error}</p>}

      <div className="card p-5">
        <p className="font-semibold mb-3">Status</p>
        <div className="flex flex-wrap gap-2">
          {["active", "past_due", "lapsed", "canceled", "pending"].map((s) => (
            <button
              key={s}
              disabled={pending}
              onClick={() => run(() => setMembershipStatus(member.id, s))}
              className="btn-outline !py-1.5 !px-3 !text-xs capitalize"
            >
              Set {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <p className="font-semibold mb-3">Grant free days (access only)</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="form-label" htmlFor="days">Days</label>
            <input id="days" type="number" min={1} className="form-input w-28" value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="form-label" htmlFor="reason">Reason</label>
            <input id="reason" className="form-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. goodwill" />
          </div>
          <button disabled={pending} onClick={() => run(() => grantFreeDays(member.id, days, reason))} className="btn-primary !py-2 !px-4 text-sm">
            Grant
          </button>
        </div>
      </div>

      <div className="card p-5">
        <p className="font-semibold mb-3">Admin note (internal only)</p>
        <textarea className="form-input mb-3" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        <button disabled={pending} onClick={() => run(() => setAdminNote(member.id, note))} className="btn-outline !py-2 !px-4 text-sm">
          Save note
        </button>
      </div>

      <div className="card p-5">
        <p className="font-semibold mb-3">Admin access</p>
        <button
          disabled={pending}
          onClick={() => run(() => toggleAdminRole(member.id, member.role !== "admin"))}
          className="btn-outline !py-2 !px-4 text-sm"
        >
          {member.role === "admin" ? "Revoke admin" : "Grant admin"}
        </button>
      </div>

      <div className="card p-5" style={{ borderColor: "var(--danger)" }}>
        <p className="font-semibold mb-3" style={{ color: "var(--danger)" }}>Cancel membership</p>
        <button disabled={pending} onClick={() => run(() => cancelMembership(member.id))} className="btn-outline !py-2 !px-4 text-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          Cancel membership
        </button>
      </div>
    </div>
  );
}
