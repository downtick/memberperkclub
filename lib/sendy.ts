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

// Subscribing goes through lib/sendyConsent (status check first, so an
// opted-out address is never silently re-activated).

export async function activeSubscriberCount(listId: string): Promise<string> {
  return post("/api/subscribers/active-subscriber-count.php", { list_id: listId });
}
