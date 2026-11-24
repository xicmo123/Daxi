// Adds what a shop page needs beyond the Nearby Search basics: weekly opening
// hours (for 營業中/今日休息), price range (均消), Google's one-line summary
// and the website. One Place Details call per Google-listed place in
// lib/businesses.ts; custom places have no Google ID and are skipped.
// Writes data/place-hours.json. Run after refresh:businesses, weekly.
//
// Usage: node --env-file=.env.local scripts/fetch-place-hours.mjs

import { readFile, writeFile } from "node:fs/promises";

const FIELDS = "id,regularOpeningHours,priceLevel,priceRange,editorialSummary,websiteUri";

async function details(id, apiKey) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=zh-TW`, {
    headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": FIELDS },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${id}: ${data.error?.status ?? res.status} ${data.error?.message ?? ""}`);
  return data;
}

function money(m) {
  return m?.units ? Number(m.units) : null;
}

async function main() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY is not set (expected in .env.local)");
    process.exit(1);
  }
  const src = await readFile(new URL("../lib/businesses.ts", import.meta.url), "utf-8");
  const ids = [...src.matchAll(/"placeId": "([^"]+)"/g)].map((m) => m[1]).filter((id) => !id.startsWith("custom-"));

  const out = {};
  let failed = 0;
  for (const id of ids) {
    try {
      const d = await details(id, apiKey);
      const hours = d.regularOpeningHours;
      out[id] = {
        // Google's own periods: day 0 = Sunday, times in the place's local time.
        periods: (hours?.periods ?? []).map((p) => ({
          open: p.open ? { day: p.open.day, hour: p.open.hour ?? 0, minute: p.open.minute ?? 0 } : null,
          close: p.close ? { day: p.close.day, hour: p.close.hour ?? 0, minute: p.close.minute ?? 0 } : null,
        })),
        weekdayDescriptions: hours?.weekdayDescriptions ?? [],
        priceLevel: d.priceLevel ?? null,
        priceMin: money(d.priceRange?.startPrice),
        priceMax: money(d.priceRange?.endPrice),
        summary: d.editorialSummary?.text ?? null,
        website: d.websiteUri ?? null,
      };
    } catch (err) {
      failed += 1;
      console.warn(String(err));
    }
  }

  const file = { generatedAt: new Date().toISOString(), places: out };
  await writeFile(new URL("../data/place-hours.json", import.meta.url), JSON.stringify(file, null, 2) + "\n", "utf-8");
  console.log(`Wrote hours for ${Object.keys(out).length} places (${failed} failed) to data/place-hours.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
