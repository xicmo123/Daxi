// Live bus GPS near Daxi — sourced from TDX's city-wide "frequency-based
// route" realtime feed, filtered down by straight-line distance from the
// old street. No hardcoded route numbers: whatever's actually running
// nearby right now shows up, so this doesn't go stale like a hand-typed
// route list would.
import { tdxFetch } from "./tdx";
import { haversineMeters } from "./tycgParking";

const DAXI_CENTER = { lat: 24.8809, lng: 121.2868 };
const NEARBY_RADIUS_METERS = 5000;

type TdxBusRealtime = {
  PlateNumb: string;
  RouteName?: { Zh_tw?: string };
  Direction?: number;
  Speed?: number;
  BusPosition?: { PositionLat: number; PositionLon: number };
  GPSTime?: string;
};

export type BusPosition = {
  id: string;
  route: string;
  lat: number;
  lng: number;
  speedKmh: number;
  gpsTime: string | null;
  distanceMeters: number;
};

export async function fetchNearbyBuses(): Promise<BusPosition[]> {
  const raw = await tdxFetch<TdxBusRealtime[]>("/v2/Bus/RealTimeByFrequency/City/Taoyuan");

  const positions: BusPosition[] = [];
  for (const b of raw) {
    if (!b.BusPosition || !b.PlateNumb) continue;
    const lat = b.BusPosition.PositionLat;
    const lng = b.BusPosition.PositionLon;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    const distanceMeters = haversineMeters(DAXI_CENTER, { lat, lng });
    if (distanceMeters > NEARBY_RADIUS_METERS) continue;
    positions.push({
      id: b.PlateNumb,
      route: b.RouteName?.Zh_tw ?? "—",
      lat,
      lng,
      speedKmh: b.Speed ?? 0,
      gpsTime: b.GPSTime ?? null,
      distanceMeters,
    });
  }
  return positions.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
