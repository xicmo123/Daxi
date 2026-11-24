import { promises as fs } from "fs";
import path from "path";
import type { PlaceHours } from "./openingHours";

// data/place-hours.json is written weekly by scripts/fetch-place-hours.mjs.
// Read on each request (it's small) so a refresh shows up without a rebuild.
const FILE = path.join(process.cwd(), "data", "place-hours.json");

export async function readPlaceHours(): Promise<Record<string, PlaceHours>> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf-8")) as { places?: Record<string, PlaceHours> };
    return parsed.places ?? {};
  } catch {
    return {};
  }
}
