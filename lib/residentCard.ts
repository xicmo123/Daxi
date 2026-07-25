// Local-only "digital resident card" identity — this app has no account
// system, so the name is a one-time self-reported label stored on-device,
// not a verified credential. Good enough for a show-at-a-shop-counter
// discount card; not meant to prove legal residency.
const NAME_KEY = "daxi-resident-name";

export function readResidentName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(NAME_KEY);
}

export function writeResidentName(name: string) {
  window.localStorage.setItem(NAME_KEY, name.trim());
}

// Deterministic per-device token so the QR-style grid on the card back
// stays stable across renders/sessions for the same person.
export function residentToken(name: string): string {
  let seed = 0;
  const salted = `daxi-resident:${name}`;
  for (let i = 0; i < salted.length; i++) seed = (seed * 31 + salted.charCodeAt(i)) >>> 0;
  return seed.toString(36);
}
