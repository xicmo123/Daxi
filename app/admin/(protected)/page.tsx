import { getAllPlaces, readPhotos, readDetails, isCustomPlaceId } from "@/lib/placesStore";
import AdminList from "@/components/admin/AdminList";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [places, photos, details] = await Promise.all([getAllPlaces(), readPhotos(), readDetails()]);

  const rows = places.map((p) => ({
    place: p,
    photo: photos[p.placeId],
    detail: details[p.placeId],
    isCustom: isCustomPlaceId(p.placeId),
  }));

  return <AdminList rows={rows} />;
}
