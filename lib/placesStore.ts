// Server-only data layer for the admin backend. Reads/writes the JSON
// overlays in data/ at runtime (no rebuild needed for edits to show up),
// and merges in fully custom places alongside the Google-sourced list from
// the auto-generated lib/businesses.ts (which stays read-only here).
import { promises as fs } from "fs";
import path from "path";
import { businesses as googleBusinesses, type Business, type BusinessTag } from "./businesses";
import type { PhotoCredit } from "./data";
import type { PlaceDetail } from "./placeDetails";
import { haversineMeters, formatDistance, OLD_STREET_CENTER } from "./tycgParking";

const DATA_DIR = path.join(process.cwd(), "data");
const PHOTOS_PATH = path.join(DATA_DIR, "business-photos.json");
const DETAILS_PATH = path.join(DATA_DIR, "place-details.json");
const CUSTOM_PATH = path.join(DATA_DIR, "custom-places.json");
const DELETED_PATH = path.join(DATA_DIR, "deleted-places.json");

export type { PlaceDetail };

export type CustomPlaceInput = {
  name: string;
  address: string | null;
  tag: BusinessTag;
  lat: number;
  lng: number;
};

export type CustomPlaceRecord = CustomPlaceInput & {
  placeId: string;
  createdAt: string;
  updatedAt: string;
};

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export function isCustomPlaceId(placeId: string): boolean {
  return placeId.startsWith("custom-");
}

export async function readPhotos(): Promise<Record<string, PhotoCredit>> {
  return readJson(PHOTOS_PATH, {});
}

export async function readDetails(): Promise<Record<string, PlaceDetail>> {
  return readJson(DETAILS_PATH, {});
}

export async function readCustomPlaces(): Promise<CustomPlaceRecord[]> {
  const custom = await readJson<unknown>(CUSTOM_PATH, []);
  return Array.isArray(custom) ? (custom as CustomPlaceRecord[]) : [];
}

// Google-sourced places can't be deleted from lib/businesses.ts (it's
// regenerated wholesale by the weekly refresh script), so "delete" for one
// of those is an exclusion list applied at read time here — it keeps the
// place gone even after the next refresh re-fetches it from Google.
export async function readDeletedIds(): Promise<string[]> {
  const deletedIds = await readJson<unknown>(DELETED_PATH, []);
  return Array.isArray(deletedIds) ? deletedIds.filter((id): id is string => typeof id === "string") : [];
}

function customToBusiness(c: CustomPlaceRecord): Business {
  const distanceMeters = Math.round(haversineMeters(OLD_STREET_CENTER, c));
  return {
    placeId: c.placeId,
    name: c.name,
    address: c.address,
    tag: c.tag,
    googleType: null,
    businessStatus: null,
    phone: null,
    rating: null,
    reviewCount: 0,
    lat: c.lat,
    lng: c.lng,
    distanceMeters,
    distanceLabel: formatDistance(distanceMeters),
    mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`,
  };
}

// The full place list every page/component renders from: Google-sourced
// businesses plus whatever's been hand-added through the admin backend,
// minus anything an admin has permanently deleted.
export async function getAllPlaces(): Promise<Business[]> {
  const [custom, deletedIds] = await Promise.all([readCustomPlaces(), readDeletedIds()]);
  const deleted = new Set(deletedIds);
  return [...googleBusinesses, ...custom.map(customToBusiness)].filter((p) => !deleted.has(p.placeId));
}

// Public-facing pages should use this instead of getAllPlaces() — it drops
// places an admin has soft-hidden (inaccurate Google data, etc.) while
// keeping their lat/lng and Maps nav link intact for anything that still
// references them (cross-links, the weekly refresh script). Admin pages
// keep using getAllPlaces() directly so a hidden place can still be found
// and un-hidden.
export function filterVisiblePlaces(places: Business[], details: Record<string, PlaceDetail>): Business[] {
  return places.filter((p) => !details[p.placeId]?.hidden);
}

export async function savePhoto(placeId: string, photo: PhotoCredit): Promise<void> {
  const photos = await readPhotos();
  photos[placeId] = photo;
  await writeJson(PHOTOS_PATH, photos);
}

export async function removePhoto(placeId: string): Promise<void> {
  const photos = await readPhotos();
  delete photos[placeId];
  await writeJson(PHOTOS_PATH, photos);
}

export async function saveDetail(placeId: string, detail: PlaceDetail): Promise<void> {
  const details = await readDetails();
  details[placeId] = detail;
  await writeJson(DETAILS_PATH, details);
}

export async function createCustomPlace(input: CustomPlaceInput): Promise<CustomPlaceRecord> {
  const list = await readCustomPlaces();
  const now = new Date().toISOString();
  const record: CustomPlaceRecord = {
    ...input,
    placeId: `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };
  list.push(record);
  await writeJson(CUSTOM_PATH, list);
  return record;
}

export async function updateCustomPlace(
  placeId: string,
  input: Partial<CustomPlaceInput>
): Promise<CustomPlaceRecord | null> {
  const list = await readCustomPlaces();
  const idx = list.findIndex((p) => p.placeId === placeId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...input, updatedAt: new Date().toISOString() };
  await writeJson(CUSTOM_PATH, list);
  return list[idx];
}

export async function deleteCustomPlace(placeId: string): Promise<boolean> {
  const list = await readCustomPlaces();
  const next = list.filter((p) => p.placeId !== placeId);
  if (next.length === list.length) return false;
  await writeJson(CUSTOM_PATH, next);
  await removePhoto(placeId);
  const details = await readDetails();
  if (details[placeId]) {
    delete details[placeId];
    await writeJson(DETAILS_PATH, details);
  }
  return true;
}

export async function deleteGooglePlace(placeId: string): Promise<void> {
  const deletedIds = await readDeletedIds();
  if (!deletedIds.includes(placeId)) {
    deletedIds.push(placeId);
    await writeJson(DELETED_PATH, deletedIds);
  }
  await removePhoto(placeId);
  const details = await readDetails();
  if (details[placeId]) {
    delete details[placeId];
    await writeJson(DETAILS_PATH, details);
  }
}

export async function restoreGooglePlace(placeId: string): Promise<void> {
  const deletedIds = await readDeletedIds();
  const next = deletedIds.filter((id) => id !== placeId);
  if (next.length !== deletedIds.length) await writeJson(DELETED_PATH, next);
}
