// Skeleton merchant self-service auth — one shared passcode per placeId in
// data/merchant-accounts.json, stateless HMAC session cookie scoped to that
// placeId (same pattern as lib/adminAuth.ts). This is a UI prototype for
// letting merchants self-maintain hours/coupons, NOT production-grade
// identity — swap for real per-merchant accounts before launch.
// Account CRUD (for the admin backend) lives in lib/merchantAccounts.ts;
// this file only verifies logins/sessions.
import { readMerchantAccounts, updateMerchantAccount, type MerchantAccount } from "./merchantAccounts";
import { hashPasscode, isHashedPasscode, verifyPasscode } from "./passcodeHash";
import { MERCHANT_SESSION_TTL_MS, bumpEpoch, signSession, verifySession } from "./sessionToken";

export const MERCHANT_SESSION_COOKIE = "daxi_merchant_session";

export type { MerchantAccount };

export async function checkMerchantLogin(placeId: string, passcode: string): Promise<MerchantAccount | null | "disabled"> {
  const accounts = await readMerchantAccounts();
  const account = accounts[placeId];
  if (!account) return null;
  if (!(await verifyPasscode(passcode, account.passcode))) return null;
  if (account.disabled) return "disabled";

  if (!isHashedPasscode(account.passcode)) {
    // Legacy plaintext passcode, verified above — upgrade it to a hash now
    // that we know the plaintext is correct.
    await updateMerchantAccount(placeId, { ...account, passcode: await hashPasscode(passcode) }).catch(() => {});
  }

  return account;
}

export async function merchantSessionToken(placeId: string): Promise<string> {
  return signSession("merchant", placeId, MERCHANT_SESSION_TTL_MS);
}

export async function verifyMerchantSession(token: string | undefined): Promise<{ placeId: string } | null> {
  const session = await verifySession("merchant", token).catch(() => null);
  if (!session || !session.subject) return null;

  // Re-check disabled status on every request (not just at login) so an
  // admin disabling a merchant takes effect immediately, not at next login.
  const accounts = await readMerchantAccounts();
  const account = accounts[session.subject];
  if (!account || account.disabled) return null;

  return { placeId: session.subject };
}

/** Log out every merchant device at once, without touching admin sessions. */
export async function revokeAllMerchantSessions(): Promise<void> {
  await bumpEpoch("merchant");
}

/** Seconds — keeps the cookie's own lifetime in step with the signed expiry. */
export const MERCHANT_COOKIE_MAX_AGE = Math.floor(MERCHANT_SESSION_TTL_MS / 1000);
