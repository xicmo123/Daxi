// Server-only file-backed CRUD store for friendly facilities (data/amenities.json),
// editable from /admin/amenities. Split from lib/amenities.ts (types + pure
// display helpers) so that client components importing the latter never pull
// Node's `fs`/`path` into the browser bundle.
import { promises as fs } from "fs";
import path from "path";
import type { Amenity } from "./amenities";

const DATA_PATH = path.join(process.cwd(), "data", "amenities.json");

export type AmenityInput = {
  name: string;
  category: Amenity["category"];
  lat: number;
  lng: number;
  note?: string;
};

async function readJson<T>(fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(data: unknown) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readAmenities(): Promise<Amenity[]> {
  const data = await readJson<unknown>([]);
  return Array.isArray(data) ? (data as Amenity[]) : [];
}

export async function getAmenity(id: string): Promise<Amenity | null> {
  const amenities = await readAmenities();
  return amenities.find((a) => a.id === id) ?? null;
}

export async function createAmenity(input: AmenityInput): Promise<Amenity> {
  const amenities = await readAmenities();
  const amenity: Amenity = { ...input, id: `amenity-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
  amenities.push(amenity);
  await writeJson(amenities);
  return amenity;
}

export async function updateAmenity(id: string, input: AmenityInput): Promise<Amenity | null> {
  const amenities = await readAmenities();
  const idx = amenities.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  amenities[idx] = { ...amenities[idx], ...input };
  await writeJson(amenities);
  return amenities[idx];
}

export async function deleteAmenity(id: string): Promise<boolean> {
  const amenities = await readAmenities();
  const next = amenities.filter((a) => a.id !== id);
  if (next.length === amenities.length) return false;
  await writeJson(next);
  return true;
}
