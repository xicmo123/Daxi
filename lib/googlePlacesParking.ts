import { OLD_STREET_CENTER, haversineMeters, formatDistance } from "./tycgParking";

const RADIUS_METERS = 3000;
// How close a Google result has to be to a known public lot before we treat
// it as the same physical lot and drop it (avoids listing the same place twice).
const DEDUPE_RADIUS_METERS = 40;

type GooglePlaceResult = {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry: { location: { lat: number; lng: number } };
  opening_hours?: { open_now?: boolean };
  business_status?: string;
};

type GooglePlacesResponse = {
  status: string;
  error_message?: string;
  results: GooglePlaceResult[];
  next_page_token?: string;
};

export type NearbyParkingLot = {
  placeId: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  distanceMeters: number;
  distanceLabel: string;
  mapsUrl: string;
  openNow: boolean | null;
};

function toLot(r: GooglePlaceResult): NearbyParkingLot {
  const { lat, lng } = r.geometry.location;
  const distanceMeters = haversineMeters(OLD_STREET_CENTER, { lat, lng });
  return {
    placeId: r.place_id,
    name: r.name,
    address: r.vicinity ?? null,
    lat,
    lng,
    distanceMeters,
    distanceLabel: formatDistance(distanceMeters),
    mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${r.place_id}`,
    openNow: r.opening_hours?.open_now ?? null,
  };
}

// Google Places Nearby Search does not expose live or total space counts for
// most privately operated lots — only location, hours, and rating. This is a
// "where can I try" list, not a live-availability one.
export async function fetchNearbyParking(
  excludeCoords: { lat: number; lng: number }[] = []
): Promise<NearbyParkingLot[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const { lat, lng } = OLD_STREET_CENTER;
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}` +
    `&radius=${RADIUS_METERS}&type=parking&language=zh-TW&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Google Places API responded ${res.status}`);
  }
  const data: GooglePlacesResponse = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ""}`);
  }

  return (data.results ?? [])
    .filter((r) => r.business_status !== "CLOSED_PERMANENTLY")
    .filter((r) => !excludeCoords.some((c) => haversineMeters(r.geometry.location, c) < DEDUPE_RADIUS_METERS))
    .map(toLot)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
