import { notFound } from "next/navigation";
import { getAllPlaces, readPhotos, readDetails, isCustomPlaceId } from "@/lib/placesStore";
import PlaceEditForm from "@/components/admin/PlaceEditForm";

export const dynamic = "force-dynamic";

export default async function EditPlacePage({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const [places, photos, details] = await Promise.all([getAllPlaces(), readPhotos(), readDetails()]);
  const place = places.find((p) => p.placeId === placeId);
  if (!place) notFound();

  return (
    <PlaceEditForm place={place} photo={photos[placeId]} detail={details[placeId]} isCustom={isCustomPlaceId(placeId)} />
  );
}
