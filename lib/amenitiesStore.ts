// Server-only file-backed CRUD store for friendly facilities (data/amenities.json),
// editable from /admin/amenities. Split from lib/amenities.ts (types + pure
// display helpers) so that client components importing the latter never pull
// Node's `fs`/`path` into the browser bundle.
import { dataPath, mutateJsonList, readJsonFile } from "./jsonStore";
import type { Amenity } from "./amenities";

const DATA_PATH = dataPath("amenities.json");

export type AmenityInput = {
  name: string;
  category: Amenity["category"];
  lat: number;
  lng: number;
  note?: string;
};

export async function readAmenities(): Promise<Amenity[]> {
  const data = await readJsonFile<unknown>(DATA_PATH, []);
  return Array.isArray(data) ? (data as Amenity[]) : [];
}

export async function getAmenity(id: string): Promise<Amenity | null> {
  const amenities = await readAmenities();
  return amenities.find((a) => a.id === id) ?? null;
}

export async function createAmenity(input: AmenityInput): Promise<Amenity> {
  return mutateJsonList<Amenity, Amenity>(DATA_PATH, (amenities) => {
    const amenity: Amenity = { ...input, id: `amenity-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
    return { next: [...amenities, amenity], result: amenity };
  });
}

export async function updateAmenity(id: string, input: AmenityInput): Promise<Amenity | null> {
  return mutateJsonList<Amenity, Amenity | null>(DATA_PATH, (amenities) => {
    const idx = amenities.findIndex((a) => a.id === id);
    if (idx === -1) return { next: amenities, result: null };
    const updated = { ...amenities[idx], ...input };
    const next = [...amenities];
    next[idx] = updated;
    return { next, result: updated };
  });
}

export async function deleteAmenity(id: string): Promise<boolean> {
  return mutateJsonList<Amenity, boolean>(DATA_PATH, (amenities) => {
    const next = amenities.filter((a) => a.id !== id);
    return { next, result: next.length !== amenities.length };
  });
}
