-- 2026-09-21: enforce the one-year term on producer-enrolled memberships.
--
-- has_access previously checked only membership_status / comp_until. A
-- producer-enrolled member's status stays 'active' in the row, so their
-- expires_at was never consulted and a $12 membership NEVER EXPIRED.
-- Every RLS policy and page gate reads has_access from this view, so this
-- one change enforces expiry everywhere. Mirrored by memberHasAccess() in
-- lib/membership.ts — keep the two in step.
create or replace view member_access with (security_invoker = true) as
select
  p.*,
  (
    (
      p.membership_status in ('active','past_due')
      and (
        p.plan is distinct from 'producer_enrolled'
        or (p.expires_at is not null and p.expires_at > now())
      )
    )
    or (p.comp_until is not null and p.comp_until > now())
  ) as has_access
from profiles p;
