// Client-only "我常住/常經過的地方" keyword — lets the outages page put
// matching entries first without needing real address geocoding.
const STORAGE_KEY = "daxi-resident-area";
const CHANGE_EVENT = "daxi-resident-area-changed";

export function readResidentArea(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export function writeResidentArea(value: string) {
  window.localStorage.setItem(STORAGE_KEY, value.trim());
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeResidentArea(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
