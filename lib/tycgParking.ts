import type { Status } from "./data";

const SOURCE_URL =
  "https://opendata.tycg.gov.tw/api/dataset/f4cc0b12-86ac-40f9-8745-885bddc18f79/resource/0381e141-f7ee-450e-99da-2240208d1773/download";

// Daxi Old Street reference point (和平路豆干街一帶), used as the "distance from"
// center for every parking lot.
const OLD_STREET_CENTER = { lat: 24.884952, lng: 121.288238 };

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

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(meters: number): string {
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
