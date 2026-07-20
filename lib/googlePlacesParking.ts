import { OLD_STREET_CENTER, haversineMeters, formatDistance } from "./tycgParking";

const RADIUS_METERS = 3000;
const MAX_RESULTS = 20;
// How close a Google result has to be to a known public lot before we treat
// it as the same physical lot and drop it (avoids listing the same place twice).
const DEDUPE_RADIUS_METERS = 40;

// Basic Data SKU only (id/displayName/formattedAddress/location/businessStatus) —
// keeps every call on Places API (New)'s cheapest pricing tier. Adding fields
// like currentOpeningHours or rating moves this to the Pro/Enterprise SKU.
const FIELD_MASK = "places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus";

type GooglePlace = {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  location: { latitude: number; longitude: number };
  businessStatus?: string;
};

type SearchNearbyResponse = {
  places?: GooglePlace[];
  error?: { message?: string; status?: string };
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
};

function toLot(p: GooglePlace): NearbyParkingLot {
  const lat = p.location.latitude;
  const lng = p.location.longitude;
  const distanceMeters = haversineMeters(OLD_STREET_CENTER, { lat, lng });
  return {
    placeId: p.id,
    name: p.displayName?.text ?? "未命名停車場",
    address: p.formattedAddress ?? null,
    lat,
    lng,
    distanceMeters,
    distanceLabel: formatDistance(distanceMeters),
    mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${p.id}`,
  };
}

// Places API (New) — Nearby Search. Does not expose live or total space
// counts for most privately operated lots, only location/name/address. This
// is a "where can I try" list, not a live-availability one.
export async function fetchNearbyParking(
  excludeCoords: { lat: number; lng: number }[] = []
): Promise<NearbyParkingLot[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: ["parking"],
      maxResultCount: MAX_RESULTS,
      languageCode: "zh-TW",
      locationRestriction: {
        circle: {
          center: { latitude: OLD_STREET_CENTER.lat, longitude: OLD_STREET_CENTER.lng },
          radius: RADIUS_METERS,
        },
      },
    }),
    next: { revalidate: 3600 },
  });

  const data: SearchNearbyResponse = await res.json();
  if (!res.ok) {
    throw new Error(`Google Places API error: ${data.error?.status ?? res.status}${data.error?.message ? ` - ${data.error.message}` : ""}`);
  }

  return (data.places ?? [])
    .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY")
    .filter((p) => !excludeCoords.some((c) => haversineMeters({ lat: p.location.latitude, lng: p.location.longitude }, c) < DEDUPE_RADIUS_METERS))
    .map(toLot)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
