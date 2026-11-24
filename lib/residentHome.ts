// 「我家」settings — the resident's 里 and their garbage-truck stop. Kept only
// in this browser (localStorage): no account, no location permission, and
// the server never learns where anyone lives. This is the only "where I
// live" setting; it replaced the free-text 「我住的地方」 keyword
// (daxi-resident-area), which is read once below as a migration.
import { DAXI_VILLAGES } from "./daxiVillages";

export type HomeStop = {
  routeId: string;
  routeLabel: string; // 「A1・大溪一線」
  seq: number;
  name: string; // stop address as the city lists it
  time: string | null; // scheduled HH:MM
  lat: number | null;
  lng: number | null;
};

export type ResidentHome = {
  village: string | null;
  stop: HomeStop | null;
};

const STORAGE_KEY = "daxi-home-v1";
const LEGACY_AREA_KEY = "daxi-resident-area";
const CHANGE_EVENT = "daxi-home-changed";
const EMPTY: ResidentHome = { village: null, stop: null };

// useSyncExternalStore needs the same object back while nothing changed.
let lastRaw: string | null | undefined;
let lastValue: ResidentHome = EMPTY;

/** The old free-text 「我住的地方」, until the resident saves 我家. */
export function readLegacyArea(): string {
  try {
    return window.localStorage.getItem(LEGACY_AREA_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function readResidentHome(): ResidentHome {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
    // An old 「我住的地方」 that is exactly a 里 carries straight over; a
    // street name can't become a stop on its own, so the setup form offers
    // it as the stop search instead (see HomeSetup).
    if (raw === null) {
      const legacy = readLegacyArea();
      if ((DAXI_VILLAGES as readonly string[]).includes(legacy)) raw = JSON.stringify({ village: legacy, stop: null });
    }
  } catch {
    raw = null;
  }
  if (raw === lastRaw) return lastValue;
  lastRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<ResidentHome>) : null;
    lastValue = {
      village: typeof parsed?.village === "string" && parsed.village ? parsed.village : null,
      stop: parsed?.stop && typeof parsed.stop.name === "string" ? parsed.stop : null,
    };
  } catch {
    lastValue = EMPTY;
  }
  return lastValue;
}

export function writeResidentHome(home: ResidentHome) {
  try {
    if (!home.village && !home.stop) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(home));
    window.localStorage.removeItem(LEGACY_AREA_KEY);
  } catch {
    // Private mode: the board just stays unset.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeResidentHome(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Road names a stop address sits on, for matching outage notices:
 *  「員林路一段70巷4號」→ ["員林路一段", "員林路"]. */
export function stopRoads(address: string): string[] {
  const normalized = address.replace(/(\d)段/g, (_, d: string) => `${"〇一二三四五六七八九"[Number(d)]}段`);
  const m = /^(.+?(?:路|街|大道))(?:([一二三四五六七八九十]+段))?/.exec(normalized);
  if (!m) return [];
  return m[2] ? [`${m[1]}${m[2]}`, m[1]] : [m[1]];
}

/** Words an outage notice would use for this home: its 里 and road names.
 *  Falls back to the old free-text area until 我家 is saved. */
export function homeKeywords(home: ResidentHome, legacyArea = ""): string[] {
  const words = [home.village, ...(home.stop ? stopRoads(home.stop.name) : [])].filter((w): w is string => Boolean(w));
  return words.length > 0 ? words : legacyArea ? [legacyArea] : [];
}

/** Does an outage area string concern this home? Short area names like
 *  「大溪區」 only count when they literally contain the keyword. */
export function areaMatches(area: string, keywords: string[]): boolean {
  return keywords.some((k) => area.includes(k) || (area.length >= 3 && k.includes(area)));
}

export function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
