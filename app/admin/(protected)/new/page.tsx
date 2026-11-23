import NewPlaceForm from "@/components/admin/NewPlaceForm";
import { getCachedParking } from "@/lib/cachedSources";

export const dynamic = "force-dynamic";

export default async function NewPlacePage() {
  const parkingLots = await getCachedParking().catch(() => []);
  return <NewPlaceForm parkingLots={parkingLots} />;
}
