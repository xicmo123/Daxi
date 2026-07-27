// Friendly-facility layer for the tourist map (公廁 / 飲水機) — kept separate
// from Business/BusinessTag rather than folded into it, since these aren't
// businesses and shouldn't show up in the 美食/景點/市集 tabs or admin place
// forms that assume BusinessTag means "a place with a Google listing".
//
// Pure types + display helpers only — safe to import from client components
// (SpotsMap.tsx). The file-backed CRUD store (fs/path, server-only) lives in
// lib/amenitiesStore.ts instead, so this module never pulls Node's `fs` into
// the client bundle.
export type AmenityCategory = "公廁" | "飲水機";

export type Amenity = {
  id: string;
  name: string;
  category: AmenityCategory;
  lat: number;
  lng: number;
  note?: string;
};

export function amenityIcon(category: AmenityCategory): string {
  return category === "公廁" ? "🚻" : "🚰";
}
