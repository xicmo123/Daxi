// Same JSON-file-on-disk pattern as lib/reservations.ts / lib/placesStore.ts.
// Coupons are shown on the home feed + /coupons and redeemed via an
// in-store scan, not a static code — see generateRedemptionToken below.
import { dataPath, mutateJsonList, readJsonFile } from "./jsonStore";

const COUPONS_PATH = dataPath("coupons.json");
const REDEMPTIONS_PATH = dataPath("coupon-redemptions.json");

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

export async function readCoupons(): Promise<Coupon[]> {
  const coupons = await readJsonFile<unknown>(COUPONS_PATH, []);
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
  await mutateJsonList<Coupon, void>(COUPONS_PATH, (coupons) => {
    const idx = coupons.findIndex((c) => c.id === coupon.id);
    const next = [...coupons];
    if (idx === -1) next.push(coupon);
    else next[idx] = coupon;
    return { next, result: undefined };
  });
}

// Admin-side moderation — merchants otherwise have zero oversight on their
// own coupon listings (wrong terms, expired-but-still-active, etc.).
export async function setCouponActive(id: string, active: boolean): Promise<Coupon | null> {
  return mutateJsonList<Coupon, Coupon | null>(COUPONS_PATH, (coupons) => {
    const idx = coupons.findIndex((c) => c.id === id);
    if (idx === -1) return { next: coupons, result: null };
    const updated = { ...coupons[idx], active, updatedAt: new Date().toISOString() };
    const next = [...coupons];
    next[idx] = updated;
    return { next, result: updated };
  });
}

export async function deleteCoupon(id: string): Promise<boolean> {
  return mutateJsonList<Coupon, boolean>(COUPONS_PATH, (coupons) => {
    const next = coupons.filter((c) => c.id !== id);
    return { next, result: next.length !== coupons.length };
  });
}

// Rotating redemption token: valid for a short window so a screenshot
// forwarded to someone else stops working within a couple of minutes —
// staff scan it in-store rather than reading a static discount code off
// the customer's screen.
const TOKEN_WINDOW_MS = 90_000;

function tokenSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Coupon token secret is not set");
  }
  return "daxi-coupon-dev-secret";
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

  // The "already used?" check and the write of the redemption record have to
  // be one locked step. Previously they were a separate read and write, so two
  // scans of the same code landing together both saw an empty result and both
  // wrote — the same coupon could be redeemed twice.
  return mutateJsonList<Redemption, { ok: true } | { ok: false; error: string }>(REDEMPTIONS_PATH, (redemptions) => {
    const alreadyUsed = redemptions.some((r) => r.couponId === couponId && r.token === token);
    if (alreadyUsed) return { next: redemptions, result: { ok: false, error: "此核銷碼已使用過" } };
    return {
      next: [...redemptions, { couponId, token, redeemedAt: new Date().toISOString() }],
      result: { ok: true },
    };
  });
}
