// Same JSON-file-on-disk pattern as lib/reservations.ts / lib/placesStore.ts.
// Coupons are shown on the home feed + /coupons and redeemed via an
// in-store scan, not a static code — see generateRedemptionToken below.
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const COUPONS_PATH = path.join(DATA_DIR, "coupons.json");
const REDEMPTIONS_PATH = path.join(DATA_DIR, "coupon-redemptions.json");

export type RedeemMethod = "scan";

export type Coupon = {
  id: string;
  placeId: string;
  title: string;
  desc: string;
  redeemMethod: RedeemMethod;
  validUntil: string; // YYYY-MM-DD
  active: boolean;
  updatedAt: string;
};

export type Redemption = {
  couponId: string;
  token: string;
  redeemedAt: string;
};

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readCoupons(): Promise<Coupon[]> {
  const coupons = await readJson<unknown>(COUPONS_PATH, []);
  return Array.isArray(coupons) ? (coupons as Coupon[]) : [];
}

export async function listActiveCoupons(): Promise<Coupon[]> {
  const coupons = await readCoupons();
  const todayKey = new Date().toISOString().slice(0, 10);
  return coupons.filter((c) => c.active && c.validUntil >= todayKey);
}

export async function getCouponsForPlace(placeId: string): Promise<Coupon[]> {
  const coupons = await readCoupons();
  return coupons.filter((c) => c.placeId === placeId);
}

export async function upsertCoupon(coupon: Coupon): Promise<void> {
  const coupons = await readCoupons();
  const idx = coupons.findIndex((c) => c.id === coupon.id);
  if (idx === -1) coupons.push(coupon);
  else coupons[idx] = coupon;
  await writeJson(COUPONS_PATH, coupons);
}

// Rotating redemption token: valid for a short window so a screenshot
// forwarded to someone else stops working within a couple of minutes —
// staff scan it in-store rather than reading a static discount code off
// the customer's screen.
const TOKEN_WINDOW_MS = 90_000;

function tokenSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "daxi-coupon-dev-secret";
}

async function signToken(couponId: string, issuedAtBucket: number): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(tokenSecret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${couponId}:${issuedAtBucket}`));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export async function generateRedemptionToken(couponId: string): Promise<{ token: string; issuedAt: number; expiresAt: number }> {
  const bucket = Math.floor(Date.now() / TOKEN_WINDOW_MS);
  const token = await signToken(couponId, bucket);
  return { token, issuedAt: bucket * TOKEN_WINDOW_MS, expiresAt: (bucket + 1) * TOKEN_WINDOW_MS };
}

async function readRedemptions(): Promise<Redemption[]> {
  const redemptions = await readJson<unknown>(REDEMPTIONS_PATH, []);
  return Array.isArray(redemptions) ? (redemptions as Redemption[]) : [];
}

export async function redeemCoupon(
  couponId: string,
  token: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const coupons = await readCoupons();
  const coupon = coupons.find((c) => c.id === couponId);
  if (!coupon || !coupon.active) return { ok: false, error: "優惠券不存在或已下架" };

  const bucket = Math.floor(Date.now() / TOKEN_WINDOW_MS);
  const validTokens = await Promise.all([bucket, bucket - 1].map((b) => signToken(couponId, b)));
  if (!validTokens.includes(token)) return { ok: false, error: "核銷碼已過期，請店家重新出示" };

  const redemptions = await readRedemptions();
  const alreadyUsed = redemptions.some((r) => r.couponId === couponId && r.token === token);
  if (alreadyUsed) return { ok: false, error: "此核銷碼已使用過" };

  redemptions.push({ couponId, token, redeemedAt: new Date().toISOString() });
  await writeJson(REDEMPTIONS_PATH, redemptions);
  return { ok: true };
}
