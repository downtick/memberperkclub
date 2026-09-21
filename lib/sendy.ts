// Minimal Sendy API client. Server-only: the API key must never reach the
// browser. Configured by three env vars; everything degrades to a clear
// "not configured" result rather than throwing, so a missing variable shows
// up as a readable message on the admin page instead of a 500.
//
//   SENDY_URL               e.g. https://sendy.example.com  (no trailing slash)
//   SENDY_API_KEY           Sendy -> Settings -> API key
//   SENDY_PROSPECT_LIST_ID  the encrypted list id of the "Producer prospects" list

const url = () => process.env.SENDY_URL?.trim().replace(/\/+$/, "") || "";
const key = () => process.env.SENDY_API_KEY?.trim() || "";
export const prospectListId = () => process.env.SENDY_PROSPECT_LIST_ID?.trim() || "";

export function sendyConfigured(): boolean {
  return Boolean(url() && key() && prospectListId());
}

async function post(path: string, fields: Record<string, string>): Promise<string> {
  const body = new URLSearchParams({ api_key: key(), ...fields });
  const res = await fetch(`${url()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return (await res.text()).trim();
}

// Sendy's documented status strings. Anything else is an API error message.
export type SendyStatus =
  | "Subscribed"
  | "Unsubscribed"
  | "Unconfirmed"
  | "Bounced"
  | "Soft bounced"
  | "Complained"
  | "Email does not exist in list";

export async function subscriptionStatus(email: string, listId: string): Promise<string> {
  return post("/api/subscribers/subscription-status.php", { email, list_id: listId });
}

// Returns Sendy's raw response: "1" / "true" on success, "Already subscribed."
// when they are already on the list, otherwise an error message.
export async function subscribe(email: string, name: string, listId: string): Promise<string> {
  const fields: Record<string, string> = { email, list: listId, boolean: "true" };
  if (name) fields.name = name;
  return post("/subscribe", fields);
}

export async function activeSubscriberCount(listId: string): Promise<string> {
  return post("/api/subscribers/active-subscriber-count.php", { list_id: listId });
}
