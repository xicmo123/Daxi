// Refreshes the "景點" (tag) rows sourced from the Taoyuan Tourism Bureau
// open-data API (https://travel.tycg.gov.tw) — the official municipal list
// for Daxi District (zipcode 335). Run weekly (see the
// "daxi-tycg-spots-refresh" scheduled task) so the app itself never calls
// this at request time.
//
// Unlike scripts/fetch-businesses.mjs (which regenerates lib/businesses.ts
// wholesale), this writes into the same admin-editable overlay files the
// admin backend uses — data/custom-places.json and data/place-details.json
// — because "景點" here isn't Google-sourced. Every run replaces only the
// custom-tycg-* entries it owns; anything an admin added by hand (other
// custom places, or extra fields like `featured`/`hidden` on a
// custom-tycg-* place) is left alone.
//
// Usage: node scripts/fetch-tycg-spots.mjs

import { readFile, writeFile } from "node:fs/promises";

const DAXI_ZIPCODE = "335";
const CUSTOM_PATH = new URL("../data/custom-places.json", import.meta.url);
const DETAILS_PATH = new URL("../data/place-details.json", import.meta.url);

const CATEGORY_LABELS = {
  9: "北橫原鄉",
  10: "石門秘境",
  11: "虎頭山",
  12: "濱海追風",
  13: "自然景觀",
  14: "草花農場",
  15: "水岸埤塘",
  16: "觀光工廠",
  17: "遊樂購物",
  18: "休閒健走",
  19: "歷史人文",
  20: "市級風景區",
  23: "產業文化館",
};

async function readJson(fileUrl, fallback) {
  try {
    return JSON.parse(await readFile(fileUrl, "utf-8"));
  } catch {
    return fallback;
  }
}

async function writeJson(fileUrl, data) {
  await writeFile(fileUrl, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function placeIdFor(tycgId) {
  return `custom-tycg-${tycgId}`;
}

function categoryLabelFor(categories) {
  for (const id of categories ?? []) {
    if (CATEGORY_LABELS[id]) return CATEGORY_LABELS[id];
  }
  return undefined;
}

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// The opendata endpoint sits behind ASP.NET's anti-forgery + bot-protection
// cookies (session id, __RequestVerificationToken, an Imperva/F5 challenge
// cookie) that only get issued from a normal page load — a bare POST with
// no prior GET, or a non-browser User-Agent, gets rejected (401 / event_code
// 40101). So: load the search page first to collect cookies, then POST with
// them plus a Referer, same as the site's own front-end does.
function parseCookies(setCookieHeaders) {
  return setCookieHeaders.map((c) => c.split(";")[0]).join("; ");
}

async function fetchDaxiAttractions() {
  const pageRes = await fetch("https://travel.tycg.gov.tw/zh-tw/travel", {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!pageRes.ok) throw new Error(`travel.tycg.gov.tw page load responded ${pageRes.status}`);
  const cookies = parseCookies(pageRes.headers.getSetCookie?.() ?? []);

  const res = await fetch("https://travel.tycg.gov.tw/zh-tw/opendata/attractions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": USER_AGENT,
      Referer: "https://travel.tycg.gov.tw/zh-tw/travel",
      Cookie: cookies,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`travel.tycg.gov.tw responded ${res.status}`);
  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) throw new Error("Unexpected response shape from opendata/attractions");
  return json.data.filter((d) => d.zipcode === DAXI_ZIPCODE);
}

async function main() {
  const attractions = await fetchDaxiAttractions();
  if (attractions.length === 0) {
    console.error("Got 0 Daxi attractions from travel.tycg.gov.tw — refusing to wipe existing data, aborting.");
    process.exit(1);
  }

  const now = new Date().toISOString();
  const freshIds = new Set();

  const newCustomEntries = attractions.map((d) => {
    const placeId = placeIdFor(d.id);
    freshIds.add(placeId);
    return {
      placeId,
      name: d.name,
      address: d.address.replace(/^335 /, "335"),
      tag: "景點",
      lat: d.lat,
      lng: d.lng,
      createdAt: now,
      updatedAt: now,
    };
  });

  // custom-places.json: drop our previous custom-tycg-* rows, keep every
  // other admin-added place untouched, then add the fresh set. Preserve the
  // original createdAt for places that already existed.
  const existingCustom = await readJson(CUSTOM_PATH, []);
  const existingByPlaceId = new Map(existingCustom.map((c) => [c.placeId, c]));
  const keptOther = existingCustom.filter((c) => !c.placeId.startsWith("custom-tycg-"));
  const mergedCustom = [
    ...keptOther,
    ...newCustomEntries.map((entry) => {
      const prior = existingByPlaceId.get(entry.placeId);
      return prior ? { ...entry, createdAt: prior.createdAt } : entry;
    }),
  ];
  await writeJson(CUSTOM_PATH, mergedCustom);

  // place-details.json: only touch the category/story/hours fields on our
  // own placeIds — any other field an admin set by hand (featured, hidden,
  // tags, etc.) survives the refresh.
  const existingDetails = await readJson(DETAILS_PATH, {});
  for (const d of attractions) {
    const placeId = placeIdFor(d.id);
    const prior = existingDetails[placeId] ?? {};
    const categoryLabel = categoryLabelFor(d.categories);
    existingDetails[placeId] = {
      ...prior,
      ...(categoryLabel ? { category: categoryLabel } : {}),
      ...(d.summary ? { story: d.summary } : {}),
      ...(d.opentime ? { hours: d.opentime } : {}),
    };
  }
  await writeJson(DETAILS_PATH, existingDetails);

  console.log(`Synced ${attractions.length} Daxi spots from travel.tycg.gov.tw (${now})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
