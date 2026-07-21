// Server-only data layer for the admin backend. Reads/writes the JSON
// overlays in data/ at runtime (no rebuild needed for edits to show up),
// and merges in fully custom places alongside the Google-sourced list from
// the auto-generated lib/businesses.ts (which stays read-only here).
import { promises as fs } from "fs";
import path from "path";
import { businesses as googleBusinesses, type Business, type BusinessTag } from "./businesses";
import type { PhotoCredit } from "./data";
import { haversineMeters, formatDistance, OLD_STREET_CENTER } from "./tycgParking";

const DATA_DIR = path.join(process.cwd(), "data");
const PHOTOS_PATH = path.join(DATA_DIR, "business-photos.json");
const DETAILS_PATH = path.join(DATA_DIR, "place-details.json");
const CUSTOM_PATH = path.join(DATA_DIR, "custom-places.json");

export type PlaceDetail = {
  category?: string;
  story?: string;
  tags?: string[];
};

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
  return readJson(CUSTOM_PATH, []);
}

function customToBusiness(c: CustomPlaceRecord): Business {
  const distanceMeters = Math.round(haversineMeters(OLD_STREET_CENTER, c));
  return {
    placeId: c.placeId,
    name: c.name,
    address: c.address,
    tag: c.tag,
    googleType: null,
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
// businesses plus whatever's been hand-added through the admin backend.
export async function getAllPlaces(): Promise<Business[]> {
  const custom = await readCustomPlaces();
  return [...googleBusinesses, ...custom.map(customToBusiness)];
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
