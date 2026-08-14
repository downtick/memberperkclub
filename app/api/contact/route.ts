import { NextRequest, NextResponse } from "next/server";
import { ContactSchema } from "@/lib/schemas";
import { sendContactNotice } from "@/lib/emails";
import { checkRateLimit } from "@/lib/rate-limit";

function checkOrigin(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host;
    const requestHost = request.headers.get("host");
    if (requestHost && originHost === requestHost) return true;
    if (originHost.endsWith(".vercel.app")) return true;
    return false;
  } catch {
    return false;
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  if (!checkOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!checkRateLimit(getClientIp(request)).allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, phone, state, message, referrer, pageUrl } = parsed.data;

  await sendContactNotice({
    firstName,
    lastName,
    email,
    phone,
    state: state || "",
    message,
    referrer,
    pageUrl,
  }).catch((err) => console.error("Contact email error:", err));

  return NextResponse.json({ success: true });
}
