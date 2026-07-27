// Skeleton merchant self-service auth — one shared passcode per placeId in
// data/merchant-accounts.json, stateless HMAC session cookie scoped to that
// placeId (same pattern as lib/adminAuth.ts). This is a UI prototype for
// letting merchants self-maintain hours/coupons, NOT production-grade
// identity — swap for real per-merchant accounts before launch.
// Account CRUD (for the admin backend) lives in lib/merchantAccounts.ts;
// this file only verifies logins/sessions.
import { readMerchantAccounts, type MerchantAccount } from "./merchantAccounts";

export const MERCHANT_SESSION_COOKIE = "daxi_merchant_session";

export type { MerchantAccount };

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "daxi-merchant-dev-secret";
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signPlaceId(placeId: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(sessionSecret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`daxi-merchant:${placeId}`));
  return toHex(sig);
}

export async function checkMerchantLogin(placeId: string, passcode: string): Promise<MerchantAccount | null> {
  const accounts = await readMerchantAccounts();
  const account = accounts[placeId];
  if (!account || account.passcode !== passcode) return null;
  return account;
}

export async function merchantSessionToken(placeId: string): Promise<string> {
  return `${placeId}.${await signPlaceId(placeId)}`;
}

export async function verifyMerchantSession(token: string | undefined): Promise<{ placeId: string } | null> {
  if (!token) return null;
  const [placeId, sig] = token.split(".");
  if (!placeId || !sig) return null;
  const expected = await signPlaceId(placeId);
  return sig === expected ? { placeId } : null;
}
