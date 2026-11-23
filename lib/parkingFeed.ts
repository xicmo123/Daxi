import { DOMParser } from "@xmldom/xmldom";
import { fetchWithTimeout } from "./fetchWithTimeout";
import { tdxFetch } from "./tdx";
import { OLD_STREET_CENTER, formatDistance, haversineMeters, type LiveParkingLot } from "./tycgParking";

export const TAOYUAN_PARKING_CATALOG = "https://data.gov.tw/dataset/25940";
export const TDX_PARKING_CATALOG = "https://tdx.transportdata.tw/api-service/swagger/basic/945f57da-f29d-4dfd-94ec-c35d9f62be7d";
const TAOYUAN_XML_URL =
  "https://opendata.tycg.gov.tw/api/dataset/f4cc0b12-86ac-40f9-8745-885bddc18f79/resource/0daad6e6-0632-44f5-bd25-5e1de1e9146f/download";
const MAX_DATA_AGE = 5 * 60 * 1000;

type ParkingLocation = Pick<LiveParkingLot, "id" | "name" | "address" | "lat" | "lng">;

// Locations from the city's dataset. Only the three matched TDX IDs have
// independently verified numeric availability. Reference rows carry no counts.
const referenceLocations: Array<ParkingLocation & { tdxId?: string }> = [
  { id: "P-DS-002", name: "橋頭停車場(桃交)", address: "大溪橋旁堤外高灘地", lat: 24.885, lng: 121.2805 },
  { id: "P-DS-010", name: "月眉停車場", address: "大溪區月湖路56號（月眉景觀廁所對面）", lat: 24.889143, lng: 121.287507 },
  { id: "P-DS-004", name: "兩蔣文化園區慈湖遊客中心暨慈湖廣場附屬停車場", address: "大溪區復興路一段1097號", lat: 24.8403, lng: 121.2933 },
  { id: "P-DS-006", name: "長興停車場(桃交)", address: "長興街二段與介壽路720巷旁", lat: 24.9058, lng: 121.2837, tdxId: "AO090001" },
  { id: "P-DS-007", name: "僑愛停車場(桃交)", address: "大溪區僑愛一街46巷旁", lat: 24.921683, lng: 121.29409, tdxId: "AO090003" },
  { id: "P-DS-008", name: "桃園太武新村停車場(桃交)", address: "大溪區慈光街與慈光一街交叉口", lat: 24.902533, lng: 121.282025, tdxId: "AO090004" },
];

export type ParkingSnapshot = {
  source: "taoyuan" | "tdx" | "reference";
  updatedAt: string | null;
  lots: LiveParkingLot[];
};

function readCount(value: unknown): number | null {
  if (typeof value === "string" && /^\d+$/.test(value)) value = Number(value);
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function makeLot(location: ParkingLocation, totalValue: unknown, surplusValue: unknown): LiveParkingLot {
  const total = readCount(totalValue) ?? 0;
  const reported = readCount(surplusValue);
  const surplus = reported !== null && total > 0 && reported <= total ? reported : null;
  const status = surplus === null ? null : surplus === 0 ? "full" : surplus / total < 0.15 ? "mid" : "ok";
  const distanceMeters = haversineMeters(OLD_STREET_CENTER, location);
  return {
    ...location,
    total,
    surplus,
    status,
    distanceMeters,
    distanceLabel: formatDistance(distanceMeters),
    mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving`,
  };
}

function sortedLots(lots: LiveParkingLot[]) {
  return lots.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function isFreshParkingTime(value: string | null, now = Date.now()): value is string {
  if (!value) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time <= now + 60_000 && now - time <= MAX_DATA_AGE;
}

export function withoutStaleParkingCounts(snapshot: ParkingSnapshot): ParkingSnapshot {
  if (snapshot.updatedAt === null || isFreshParkingTime(snapshot.updatedAt)) return snapshot;
  return {
    source: "reference",
    updatedAt: null,
    lots: snapshot.lots.map((lot) => ({ ...lot, surplus: null, status: null })),
  };
}

export function parseTaoyuanParkingXml(xml: string): ParkingSnapshot {
  const doc = new DOMParser({
    onError(level, message) {
      if (level !== "warning") throw new Error(message);
    },
  }).parseFromString(xml, "text/xml");
  const root = doc.documentElement;
  if (doc.doctype || root?.tagName !== "parkingLots") throw new Error("Invalid Taoyuan parking XML");
  const stamp = root.getAttribute("updatetime") ?? "";
  const updatedAt = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(stamp) ? stamp.replace(" ", "T") + "+08:00" : null;

  const lots = Array.from(root.getElementsByTagName("parkingLot")).flatMap((element) => {
    const value = (key: string) => element.getElementsByTagName(key).item(0)?.textContent?.trim() ?? "";
    if (value("areaName") !== "大溪區") return [];
    const id = value("parkId");
    const name = value("parkName");
    const lat = Number(value("wgsX"));
    const lng = Number(value("wgsY"));
    if (!id || !name || !(lat > 24 && lat < 25 && lng > 120 && lng < 122)) return [];
    return [makeLot({ id, name, address: value("address"), lat, lng }, value("totalSpace"), value("surplusSpace"))];
  });
  if (!lots.length) throw new Error("No Daxi lots in Taoyuan parking feed");
  return { source: "taoyuan", lots: sortedLots(lots), updatedAt };
}

type TdxParkingFeed = {
  ParkingAvailabilities: Array<{
    CarParkID: string;
    TotalSpaces: number;
    AvailableSpaces: number;
    ServiceStatus: number;
    DataCollectTime: string;
  }>;
};

async function fetchFallbackParking(cityLots: LiveParkingLot[]): Promise<ParkingSnapshot> {
  const feed = await tdxFetch<TdxParkingFeed>("/v1/Parking/OffStreet/ParkingAvailability/City/Taoyuan").catch(() => null);
  const availability = Array.isArray(feed?.ParkingAvailabilities) ? feed.ParkingAvailabilities : [];
  const records = new Map(availability.filter(Boolean).map((item) => [item.CarParkID, item]));
  const locations = new Map(referenceLocations.map((lot) => [lot.id, lot]));
  for (const { id, name, address, lat, lng } of cityLots) {
    locations.set(id, { id, name, address, lat, lng, tdxId: locations.get(id)?.tdxId });
  }
  const times: string[] = [];
  const lots = Array.from(locations.values(), ({ tdxId, ...location }) => {
    const record = tdxId ? records.get(tdxId) : undefined;
    if (!record || record.ServiceStatus !== 1 || !isFreshParkingTime(record.DataCollectTime)) return makeLot(location, null, null);
    const lot = makeLot(location, record.TotalSpaces, record.AvailableSpaces);
    if (lot.surplus !== null) times.push(record.DataCollectTime);
    return lot;
  });
  times.sort((a, b) => Date.parse(a) - Date.parse(b));
  return { source: times.length ? "tdx" : "reference", updatedAt: times[0] ?? null, lots: sortedLots(lots) };
}

export async function fetchDaxiParkingSnapshot(): Promise<ParkingSnapshot> {
  let cityLots: LiveParkingLot[] = [];
  try {
    const response = await fetchWithTimeout(TAOYUAN_XML_URL, { cache: "no-store" }, 4_000);
    if (!response.ok) throw new Error(`Taoyuan parking HTTP ${response.status}`);
    const snapshot = parseTaoyuanParkingXml(await response.text());
    if (isFreshParkingTime(snapshot.updatedAt) && snapshot.lots.some((lot) => lot.surplus !== null)) return snapshot;
    cityLots = snapshot.lots;
  } catch {
    // The TDX feed and the built-in location list have independent availability.
  }
  return fetchFallbackParking(cityLots);
}
