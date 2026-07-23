import { getAllPlaces, readPhotos, readDetails, isCustomPlaceId } from "@/lib/placesStore";
import { readBookings } from "@/lib/reservations";
import AdminList from "@/components/admin/AdminList";
import type { PhotoCredit } from "@/lib/data";
import type { PlaceDetail } from "@/lib/placeDetails";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [places, photos, details, bookings] = await Promise.all([
    getAllPlaces().catch(() => []),
    readPhotos().catch((): Record<string, PhotoCredit> => ({})),
    readDetails().catch((): Record<string, PlaceDetail> => ({})),
    readBookings().catch(() => []),
  ]);

  const rows = places.map((p) => ({
    place: p,
    photo: photos[p.placeId],
    detail: details[p.placeId],
    isCustom: isCustomPlaceId(p.placeId),
  }));

  return <AdminList rows={rows} pendingBookings={bookings.filter((b) => b.status === "pending").length} />;
}
