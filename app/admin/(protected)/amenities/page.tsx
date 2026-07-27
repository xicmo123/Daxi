import { readAmenities } from "@/lib/amenitiesStore";
import AmenityList from "@/components/admin/AmenityList";

export const dynamic = "force-dynamic";

export default async function AmenitiesDashboard() {
  const amenities = await readAmenities();
  return <AmenityList amenities={amenities} />;
}
