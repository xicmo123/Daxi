import { notFound } from "next/navigation";
import { getAmenity } from "@/lib/amenitiesStore";
import AmenityForm from "@/components/admin/AmenityForm";

export const dynamic = "force-dynamic";

export default async function EditAmenityPage({ params }: { params: Promise<{ amenityId: string }> }) {
  const { amenityId } = await params;
  const amenity = await getAmenity(amenityId);
  if (!amenity) notFound();
  return <AmenityForm amenity={amenity} />;
}
