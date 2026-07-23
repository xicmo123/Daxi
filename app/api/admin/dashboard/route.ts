import { NextResponse } from "next/server";
import { getAllPlaces, isCustomPlaceId, readDetails, readPhotos } from "@/lib/placesStore";
import { readBookings } from "@/lib/reservations";
import type { PhotoCredit } from "@/lib/data";
import type { PlaceDetail } from "@/lib/placeDetails";

export async function GET() {
  const [places, photos, details, bookings] = await Promise.all([
    getAllPlaces().catch(() => []),
    readPhotos().catch((): Record<string, PhotoCredit> => ({})),
    readDetails().catch((): Record<string, PlaceDetail> => ({})),
    readBookings().catch(() => []),
  ]);

  const rows = places.map((place) => ({
    place,
    photo: photos[place.placeId],
    detail: details[place.placeId],
    isCustom: isCustomPlaceId(place.placeId),
  }));

  return NextResponse.json({
    rows,
    pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
  });
}
