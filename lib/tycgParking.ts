import type { Status } from "./data";

const SOURCE_URL =
  "https://opendata.tycg.gov.tw/api/dataset/f4cc0b12-86ac-40f9-8745-885bddc18f79/resource/0381e141-f7ee-450e-99da-2240208d1773/download";

// Daxi Old Street reference point (和平路豆干街一帶), used as the "distance from"
// center for every parking lot.
export const OLD_STREET_CENTER = { lat: 24.884952, lng: 121.288238 };

type RawLot = {
  parkName: string;
  address: string;
  areaName: string;
  totalSpace: string;
  surplusSpace: string;
  wgsX: string; // latitude (field name is misleading in the source dataset)
  wgsY: string; // longitude
};

export type LiveParkingLot = {
  name: string;
  address: string;
  total: number;
  surplus: number | null;
  isOpenAccess: boolean;
  status: Status;
  statusLabel: string;
  pct: number | null;
  lat: number;
  lng: number;
  distanceMeters: number;
  distanceLabel: string;
  mapsUrl: string;
};

export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function toLot(raw: RawLot): LiveParkingLot {
  const total = Number(raw.totalSpace);
  const surplusNum = Number(raw.surplusSpace);
  const isOpenAccess = Number.isNaN(surplusNum);
  const pct = !isOpenAccess && total > 0 ? Math.round((surplusNum / total) * 100) : null;

  let status: Status = "ok";
  let statusLabel = "充裕";
  if (isOpenAccess) {
    statusLabel = "開放中";
  } else if (pct === 0) {
    status = "full";
    statusLabel = "已滿";
  } else if (pct !== null && pct < 15) {
    status = "mid";
    statusLabel = "略滿";
  }

  const lat = Number(raw.wgsX);
  const lng = Number(raw.wgsY);
  const distanceMeters = haversineMeters(OLD_STREET_CENTER, { lat, lng });

  return {
    name: raw.parkName,
    address: raw.address,
    total,
    surplus: isOpenAccess ? null : surplusNum,
    isOpenAccess,
    status,
    statusLabel,
    pct,
    lat,
    lng,
    distanceMeters,
    distanceLabel: formatDistance(distanceMeters),
    mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  };
}

// Taoyuan open-data platform (opendata.tycg.gov.tw) — no API key required,
// dataset refreshes roughly every minute. Filtered to 大溪區 (Daxi district),
// sorted by distance from Daxi Old Street.
export async function fetchDaxiParking(): Promise<LiveParkingLot[]> {
  const res = await fetch(SOURCE_URL, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Taoyuan parking API responded ${res.status}`);
  }
  const data: RawLot[] = await res.json();
  return data
    .filter((d) => d.areaName === "大溪區")
    .map(toLot)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

// Daxi Old Street sits on a river-terrace bluff above the Dahan River —
// straight-line distance badly understates the real walk to a lot that's
// actually down at river level or across 大溪橋 (Daxi Bridge), since you
// have to detour via a slope/stairs or the bridge itself. Manually curated
// from local geography (not derivable from lat/lng alone): both lots sit
// on the river side, confirmed by their own addresses (堤外高灘地 / 月眉里).
const RIVER_CROSSING_LOT_NAMES = new Set(["橋頭停車場(桃交)", "月眉停車場"]);

// Places that are themselves on the river side (月眉 area, the riverside
// park/floodplain road, the bridge) — for these the two lots above are
// NOT a river crossing, so the penalty shouldn't apply.
const RIVER_SIDE_PLACE_IDS = new Set([
  "ChIJzRhetRcYaDQRF1DpSokjfjM", // 大溪河濱公園（大鶯路堤防）
  "ChIJA7odaOQZaDQROJIHrBxLEEI", // 月眉人工濕地生態公園（月眉里）
  "ChIJ7QuhMh8YaDQRC4idli6CBik", // 大溪橋（橋本身，正好在渡河點上）
  "ChIJDQDEhlwZaDQRejZFHhM9iKo", // 中庄吊橋（月眉里）
  "ChIJgYuMHPAZaDQRGLuAoxbKEBc", // 大漢溪山豬湖生態親水園區（中庄一帶）
  "ChIJbQaltEUYaDQRkMQ2Cry-FjM", // 大溪韭菜花田（大鶯路堤防）
  "ChIJ1WQEXWUZaDQRtmlHfLnTe3U", // 桃園月眉人工濕地落羽松大道（月眉里）
  "ChIJ3wk98XUZaDQRRfVk59fXvlk", // 桃園花彩節（月眉一帶）
]);

// Applied to the straight-line distance of a river-crossing lot before
// comparing it against alternatives — not a real detour length, just
// enough to stop it from beating a same-side lot that's actually the
// shorter real walk. It can still win if every same-side lot is farther.
const RIVER_CROSSING_PENALTY_METERS = 600;

// "Which lot is closest to this specific shop/spot" — distinct from the
// distances above, which are all relative to Daxi Old Street.
export function findNearestLot(
  point: { lat: number; lng: number },
  lots: LiveParkingLot[],
  placeId?: string
): { lot: LiveParkingLot; distanceMeters: number; distanceLabel: string; crossesRiver: boolean } | null {
  if (lots.length === 0) return null;
  const skipPenalty = placeId ? RIVER_SIDE_PLACE_IDS.has(placeId) : false;

  const penalized = (lot: LiveParkingLot, distanceMeters: number) =>
    !skipPenalty && RIVER_CROSSING_LOT_NAMES.has(lot.name) ? distanceMeters + RIVER_CROSSING_PENALTY_METERS : distanceMeters;

  let nearest = lots[0];
  let nearestRealDist = haversineMeters(point, lots[0]);
  let nearestRankedDist = penalized(lots[0], nearestRealDist);
  for (const lot of lots.slice(1)) {
    const realDist = haversineMeters(point, lot);
    const rankedDist = penalized(lot, realDist);
    if (rankedDist < nearestRankedDist) {
      nearest = lot;
      nearestRealDist = realDist;
      nearestRankedDist = rankedDist;
    }
  }
  const crossesRiver = !skipPenalty && RIVER_CROSSING_LOT_NAMES.has(nearest.name);
  return {
    lot: nearest,
    distanceMeters: nearestRealDist,
    distanceLabel: formatDistance(nearestRealDist),
    crossesRiver,
  };
}
