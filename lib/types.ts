export type Role = "member" | "producer" | "admin";
export type MembershipStatus = "pending" | "active" | "past_due" | "lapsed" | "canceled";
export type Plan = "retail_annual" | "producer_enrolled" | null;
export type BillingSource = "stripe" | "comp" | "manual" | "producer";
export type BillingMode = "per_client" | "flat_monthly";

export interface Profile {
  id: string;
  email: string;
  member_number: string | null;
  role: Role;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  state: string | null;
  plan: Plan;
  membership_status: MembershipStatus;
  billing_source: BillingSource;
  comp_until: string | null;
  admin_note: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  producer_id: string | null;
  enrolled_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberAccess extends Profile {
  has_access: boolean;
}

export interface Producer {
  id: string;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
  billing_mode: BillingMode;
  monthly_quota: number | null;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  affiliate_url: string;
  discount_code: string | null;
  code_instructions: string | null;
  featured: boolean;
  active: boolean;
  sort: number;
  created_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  printable: boolean;
  published: boolean;
  published_at: string;
  created_at: string;
}

export interface MemberEvent {
  id: number;
  member_id: string;
  actor_id: string | null;
  event: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}
