// Local-only label for the in-app offer card. This app has no account system,
// so it is never a verified credential and is not used for coupon redemption.
const NAME_KEY = "daxi-resident-name";

export function readResidentName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(NAME_KEY);
}

export function writeResidentName(name: string) {
  window.localStorage.setItem(NAME_KEY, name.trim());
}
