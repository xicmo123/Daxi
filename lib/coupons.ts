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
  /** An anonymous, device-scoped claim — never a resident's name or profile. */
  claimId?: string;
  redeemedAt: string;
};

const TAIPEI_TIME_ZONE = "Asia/Taipei";

/** YYYY-MM-DD in the place where these offers can actually be redeemed. */
export function taipeiDateKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TAIPEI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (kind: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === kind)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function isCouponRedeemable(coupon: Coupon, now = new Date()): boolean {
  return coupon.active && coupon.validUntil >= taipeiDateKey(now);
}

export async function readCoupons(): Promise<Coupon[]> {
  const coupons = await readJsonFile<unknown>(COUPONS_PATH, []);
  return Array.isArray(coupons) ? (coupons as Coupon[]) : [];
}

export async function listActiveCoupons(): Promise<Coupon[]> {
  const coupons = await readCoupons();
  return coupons.filter((coupon) => isCouponRedeemable(coupon));
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

async function signToken(couponId: string, claimId: string, expiresAt: number, nonce: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(tokenSecret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${couponId}:${claimId}:${expiresAt}:${nonce}`));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export async function generateRedemptionToken(couponId: string, claimId: string): Promise<{ token: string; issuedAt: number; expiresAt: number }> {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + TOKEN_WINDOW_MS;
  const nonce = crypto.randomUUID();
  const signature = await signToken(couponId, claimId, expiresAt, nonce);
  // A token is unique per display, so one customer's scan can never consume
  // another customer's offer merely because they opened it in the same minute.
  return { token: `${expiresAt.toString(36)}.${nonce}.${signature}`, issuedAt, expiresAt };
}

function parseToken(token: string): { expiresAt: number; nonce: string; signature: string } | null {
  const [expiresRaw, nonce, signature, ...extra] = token.split(".");
  if (extra.length > 0 || !expiresRaw || !nonce || !signature || !/^[0-9a-f-]{36}$/i.test(nonce) || !/^[0-9a-f]{16}$/i.test(signature)) return null;
  const expiresAt = Number.parseInt(expiresRaw, 36);
  return Number.isFinite(expiresAt) ? { expiresAt, nonce, signature } : null;
}

export async function redeemCoupon(
  couponId: string,
  token: string,
  claimId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const coupons = await readCoupons();
  const coupon = coupons.find((c) => c.id === couponId);
  if (!coupon || !isCouponRedeemable(coupon)) return { ok: false, error: "優惠券已過期、下架或不存在" };

  const parsed = parseToken(token);
  if (!parsed || Date.now() > parsed.expiresAt) return { ok: false, error: "核銷碼已過期，請顧客重新開啟優惠券" };
  const validSignature = await signToken(couponId, claimId, parsed.expiresAt, parsed.nonce);
  if (parsed.signature !== validSignature) return { ok: false, error: "核銷碼無效，請顧客重新開啟優惠券" };

  // The "already used?" check and the write of the redemption record have to
  // be one locked step. Previously they were a separate read and write, so two
  // scans of the same code landing together both saw an empty result and both
  // wrote — the same coupon could be redeemed twice.
  return mutateJsonList<Redemption, { ok: true } | { ok: false; error: string }>(REDEMPTIONS_PATH, (redemptions) => {
    const alreadyUsed = redemptions.some((r) => r.couponId === couponId && r.claimId === claimId);
    if (alreadyUsed) return { next: redemptions, result: { ok: false, error: "這張優惠券已在此裝置使用過" } };
    return {
      next: [...redemptions, { couponId, token, claimId, redeemedAt: new Date().toISOString() }],
      result: { ok: true },
    };
  });
}
