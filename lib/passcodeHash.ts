// PBKDF2 passcode hashing shared by admin-created merchant accounts.
// Uses Web Crypto (crypto.subtle) so it works in both the Node and Edge
// runtimes without a native dependency. Stored format: "pbkdf2$<saltHex>$<hashHex>".
// Accounts created before this landed still have a plaintext passcode in
// data/merchant-accounts.json — verifyPasscode falls back to a plain compare
// for those and lib/merchantAuth.ts upgrades them to a hash on next login.
const PBKDF2_ITERATIONS = 100_000;
const PREFIX = "pbkdf2";

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function derive(passcode: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passcode), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return toHex(bits);
}

export function isHashedPasscode(stored: string): boolean {
  return stored.startsWith(`${PREFIX}$`);
}

export async function hashPasscode(passcode: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(passcode, salt);
  return `${PREFIX}$${toHex(salt)}$${hash}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPasscode(passcode: string, stored: string): Promise<boolean> {
  if (!isHashedPasscode(stored)) {
    return timingSafeEqual(passcode, stored);
  }
  const [, saltHex, hashHex] = stored.split("$");
  if (!saltHex || !hashHex) return false;
  const computed = await derive(passcode, fromHex(saltHex));
  return timingSafeEqual(computed, hashHex);
}
