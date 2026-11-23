// Shared between the home page and the mode switches in the profile tabs. Client-only —
// this is a UI preference, not something that needs to survive server-side.
export type Identity = "tourist" | "resident";

export const IDENTITY_STORAGE_KEY = "daxi-identity";

export function readIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(IDENTITY_STORAGE_KEY);
    return value === "tourist" || value === "resident" ? value : null;
  } catch {
    return null;
  }
}

export function writeIdentity(identity: Identity) {
  window.localStorage.setItem(IDENTITY_STORAGE_KEY, identity);
}
