// Signed session tokens with an expiry and a revocation epoch.
//
// The previous scheme (lib/adminAuth.ts, lib/merchantAuth.ts) signed a *fixed*
// message, so the cookie value was a constant. Three consequences, all bad for
// a backend that edits public content and redeems coupons for real money:
//
//   1. The token never expired. A cookie copied off a shared iPad in a shop
//      stayed valid forever.
//   2. It could not be revoked. The only lever was rotating
//      ADMIN_SESSION_SECRET, which signs merchant sessions and coupon tokens
//      too — so cutting off one leaked admin cookie logged out every merchant
//      in 大溪 and invalidated outstanding coupon QR codes.
//   3. `maxAge` on the cookie was the only limit, and a cookie's own maxAge is
//      client-side advice; a copied value replayed by curl ignored it entirely.
//
// Tokens now carry their expiry inside the signed payload, and every scope has
// an epoch counter that an admin can bump to invalidate that scope's sessions
// and nothing else.
import { dataPath, readJsonFile, updateJsonFile } from "./jsonStore";

export type SessionScope = "admin" | "merchant";

const EPOCH_PATH = dataPath("session-epochs.json");

type EpochFile = Partial<Record<SessionScope, number>>;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Session secret is not set (ADMIN_SESSION_SECRET)");
  }
  return "daxi-dev-session-secret";
}

/**
 * Current revocation epoch for a scope. Every issued token records the epoch
 * it was signed under; bumping it invalidates all of them at once.
 */
export async function readEpoch(scope: SessionScope): Promise<number> {
  const file = await readJsonFile<EpochFile>(EPOCH_PATH, {});
  const value = file?.[scope];
  return typeof value === "number" && Number.isFinite(value) ? value : 1;
}

/** Invalidate every existing session in one scope. Returns the new epoch. */
export async function bumpEpoch(scope: SessionScope): Promise<number> {
  let next = 1;
  await updateJsonFile<EpochFile>(EPOCH_PATH, {}, (current) => {
    const file = current && typeof current === "object" ? current : {};
    const value = typeof file[scope] === "number" ? (file[scope] as number) : 1;
    next = value + 1;
    return { ...file, [scope]: next };
  });
  return next;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
}

/**
 * Compare in time independent of where the first difference falls.
 *
 * `a === b` on a hex signature leaks, through timing, how many leading
 * characters an attacker got right — which is enough to forge a signature one
 * character at a time. Both inputs here are fixed-length hex from the same
 * HMAC, so a plain XOR fold over the full length is sufficient.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function payloadFor(scope: SessionScope, subject: string, expiresAt: number, epoch: number): string {
  // Field separator is "|", and every field is encoded, so a subject
  // containing a separator can't be shifted into another field.
  return [scope, epoch, expiresAt, encodeURIComponent(subject)].join("|");
}

/**
 * Issue a token for `subject` (a placeId for merchants, "" for the single
 * admin login) valid for `ttlMs`.
 */
export async function signSession(scope: SessionScope, subject: string, ttlMs: number): Promise<string> {
  const expiresAt = Date.now() + ttlMs;
  const epoch = await readEpoch(scope);
  const sig = await sign(payloadFor(scope, subject, expiresAt, epoch));
  return `${epoch}.${expiresAt}.${encodeURIComponent(subject)}.${sig}`;
}

/**
 * Verify a token and return its subject, or null if it is malformed, expired,
 * signed under a revoked epoch, or simply wrong.
 */
export async function verifySession(scope: SessionScope, token: string | undefined): Promise<{ subject: string } | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [epochRaw, expiresRaw, subjectRaw, sig] = parts;

  const epoch = Number(epochRaw);
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(epoch) || !Number.isFinite(expiresAt)) return null;
  if (Date.now() >= expiresAt) return null;

  // Checked before the HMAC so a token from a revoked epoch can never be
  // accepted even if it is otherwise perfectly signed.
  if (epoch !== (await readEpoch(scope))) return null;

  let subject: string;
  try {
    subject = decodeURIComponent(subjectRaw);
  } catch {
    return null;
  }

  const expected = await sign(payloadFor(scope, subject, expiresAt, epoch));
  if (!timingSafeEqual(sig, expected)) return null;

  return { subject };
}

/** Admin sessions are short: this backend edits everything the public sees. */
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
/** Merchants log in on a shop counter device and shouldn't re-auth all day. */
export const MERCHANT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
