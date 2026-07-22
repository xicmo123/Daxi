import NewPlaceForm from "@/components/admin/NewPlaceForm";
import { fetchDaxiParking } from "@/lib/tycgParking";

export const dynamic = "force-dynamic";

export default async function NewPlacePage() {
  const parkingLots = await fetchDaxiParking().catch(() => []);
  return <NewPlaceForm parkingLots={parkingLots} />;
}
