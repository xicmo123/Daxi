// Live bus GPS near Daxi — sourced from TDX's city-wide "frequency-based
// route" realtime feed, filtered down by straight-line distance from the
// requested center. The old-street point remains only as a no-location fallback.
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

export async function fetchNearbyBuses(center = DAXI_CENTER): Promise<BusPosition[]> {
  const raw = await tdxFetch<TdxBusRealtime[]>("/v2/Bus/RealTimeByFrequency/City/Taoyuan");

  const positions: BusPosition[] = [];
  for (const b of raw) {
    if (!b.BusPosition || !b.PlateNumb) continue;
    const lat = b.BusPosition.PositionLat;
    const lng = b.BusPosition.PositionLon;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    const distanceMeters = haversineMeters(center, { lat, lng });
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
