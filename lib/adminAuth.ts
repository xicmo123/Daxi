// Admin session. The signing/expiry/revocation mechanics live in
// lib/sessionToken.ts — see the header there for why the old fixed-message
// HMAC had to go.
import { ADMIN_SESSION_TTL_MS, bumpEpoch, signSession, verifySession } from "./sessionToken";

export const ADMIN_SESSION_COOKIE = "daxi_admin_session";

/** Mint a token for the single admin login. Expires; see ADMIN_SESSION_TTL_MS. */
export async function issueSessionToken(): Promise<string> {
  return signSession("admin", "", ADMIN_SESSION_TTL_MS);
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  try {
    return (await verifySession("admin", token)) !== null;
  } catch {
    return false;
  }
}

/** Log out every admin device at once (used by /api/admin/revoke-sessions). */
export async function revokeAllAdminSessions(): Promise<void> {
  await bumpEpoch("admin");
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (password.length !== expected.length) return false;
  // Constant-time: a plain `===` on the password leaks its length and prefix
  // through timing, and this endpoint is reachable from the internet.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/** Seconds — keeps the cookie's own lifetime in step with the signed expiry. */
export const ADMIN_COOKIE_MAX_AGE = Math.floor(ADMIN_SESSION_TTL_MS / 1000);
