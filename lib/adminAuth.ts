// Stateless admin session: the cookie holds an HMAC of a fixed message.
// Prefer ADMIN_SESSION_SECRET; fall back to ADMIN_PASSWORD so production does
// not crash if the optional session secret was not configured separately.
export const ADMIN_SESSION_COOKIE = "daxi_admin_session";
const SESSION_MESSAGE = "daxi-admin-authenticated";

function sessionSecret(): string | undefined {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedSessionToken(): Promise<string> {
  const secret = sessionSecret();
  if (!secret) throw new Error("Admin auth secret is not set");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SESSION_MESSAGE));
  return toHex(sig);
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const expected = await expectedSessionToken();
    return token === expected;
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && password === expected;
}
