// Two throttles with deliberately different durability.
//
// The in-memory one below is fine for high-volume, low-stakes traffic (the
// telemetry beacon): losing its state on restart just means a client gets a
// fresh allowance. Login lockout is different — an attacker who can restart
// the process, or simply wait out a deploy, should not get their attempt
// counter reset, so that one is file-backed. See lockout() below.
import { dataPath, updateJsonFile } from "./jsonStore";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, max = MAX_ATTEMPTS): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= max;
}

export function recordFailedAttempt(key: string, windowMs = WINDOW_MS): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  entry.count += 1;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

// ---------------------------------------------------------------------------
// Persistent login lockout
// ---------------------------------------------------------------------------

const LOCKOUT_PATH = dataPath("login-lockouts.json");
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MAX_ATTEMPTS = 5;

type LockoutEntry = { count: number; resetAt: number };
type Lockouts = Record<string, LockoutEntry>;

/**
 * @returns `retryAfterMs` when the caller is currently locked out, else null.
 */
export async function checkLoginLockout(key: string): Promise<number | null> {
  const now = Date.now();
  let retryAfterMs: number | null = null;
  await updateJsonFile<Lockouts>(LOCKOUT_PATH, {}, (current) => {
    const lockouts: Lockouts = { ...(current ?? {}) };
    // Opportunistic sweep so the file can't grow forever from one-off IPs.
    for (const [k, entry] of Object.entries(lockouts)) {
      if (entry.resetAt <= now) delete lockouts[k];
    }
    const entry = lockouts[key];
    if (entry && entry.resetAt > now && entry.count >= LOCKOUT_MAX_ATTEMPTS) {
      retryAfterMs = entry.resetAt - now;
    }
    return lockouts;
  });
  return retryAfterMs;
}

export async function recordFailedLogin(key: string): Promise<void> {
  const now = Date.now();
  await updateJsonFile<Lockouts>(LOCKOUT_PATH, {}, (current) => {
    const lockouts: Lockouts = { ...(current ?? {}) };
    const entry = lockouts[key];
    if (!entry || entry.resetAt <= now) {
      lockouts[key] = { count: 1, resetAt: now + LOCKOUT_WINDOW_MS };
    } else {
      lockouts[key] = { count: entry.count + 1, resetAt: entry.resetAt };
    }
    return lockouts;
  });
}

export async function clearFailedLogins(key: string): Promise<void> {
  await updateJsonFile<Lockouts>(LOCKOUT_PATH, {}, (current) => {
    const lockouts: Lockouts = { ...(current ?? {}) };
    delete lockouts[key];
    return lockouts;
  });
}
