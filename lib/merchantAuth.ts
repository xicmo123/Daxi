// Skeleton merchant self-service auth — one shared passcode per placeId in
// data/merchant-accounts.json, stateless HMAC session cookie scoped to that
// placeId (same pattern as lib/adminAuth.ts). This is a UI prototype for
// letting merchants self-maintain hours/coupons, NOT production-grade
// identity — swap for real per-merchant accounts before launch.
import { promises as fs } from "fs";
import path from "path";

export const MERCHANT_SESSION_COOKIE = "daxi_merchant_session";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "merchant-accounts.json");

export type MerchantAccount = { passcode: string; businessName: string };

async function readAccounts(): Promise<Record<string, MerchantAccount>> {
  try {
    const raw = await fs.readFile(ACCOUNTS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

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
  const accounts = await readAccounts();
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
