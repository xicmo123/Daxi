// Stateless admin session: the cookie holds an HMAC of a fixed message,
// keyed by ADMIN_SESSION_SECRET. No server-side session storage needed —
// anyone who can reproduce the HMAC must know the secret. Works in both the
// Node and Edge runtimes since it only uses Web Crypto.
export const ADMIN_SESSION_COOKIE = "daxi_admin_session";
const SESSION_MESSAGE = "daxi-admin-authenticated";

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SESSION_MESSAGE));
  return toHex(sig);
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedSessionToken();
  return token === expected;
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && password === expected;
}
