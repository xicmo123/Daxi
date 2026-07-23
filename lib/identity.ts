// Shared between the first-visit identity gate and any UI that needs to
// read/switch it later (home toggle, resident profile tab). Client-only —
// this is a UI preference, not something that needs to survive server-side.
export type Identity = "tourist" | "resident";

export const IDENTITY_STORAGE_KEY = "daxi-identity";

export function readIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(IDENTITY_STORAGE_KEY);
  return value === "tourist" || value === "resident" ? value : null;
}

export function writeIdentity(identity: Identity) {
  window.localStorage.setItem(IDENTITY_STORAGE_KEY, identity);
}
