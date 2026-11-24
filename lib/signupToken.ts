import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

// Encrypted, self-contained confirmation token for producer self-signup.
// Nothing is written to the database until the producer clicks the link in
// the confirmation email, so nobody can create (and squat) an account for an
// email address they do not control. The token carries the signup form data
// plus an expiry, sealed with AES-256-GCM (encrypted AND tamper-proof) so the
// name/phone/address never appear readable in the link or in request logs.

const TTL_MS = 24 * 60 * 60 * 1000;

function key(): Buffer {
  const base = process.env.PRODUCER_SIGNUP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) throw new Error("No signing key configured for producer signup.");
  // Derived key: never use the service-role key directly as a cipher key.
  return createHmac("sha256", "memberperkclub-producer-signup-v1").update(base).digest();
}

export function createSignupToken<T extends object>(data: T): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const plain = Buffer.from(JSON.stringify({ v: 1, exp: Date.now() + TTL_MS, d: data }));
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
}

export function verifySignupToken<T>(token: string | null | undefined): T | null {
  if (!token || token.length > 4000) return null;
  try {
    const buf = Buffer.from(token, "base64url");
    if (buf.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    const plain = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]);
    const parsed = JSON.parse(plain.toString("utf8"));
    if (parsed?.v !== 1 || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return parsed.d as T;
  } catch {
    return null;
  }
}
