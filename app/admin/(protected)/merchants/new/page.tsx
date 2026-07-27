import { getAllPlaces } from "@/lib/placesStore";
import { listMerchantAccounts } from "@/lib/merchantAccounts";
import MerchantAccountForm from "@/components/admin/MerchantAccountForm";

export const dynamic = "force-dynamic";

export default async function NewMerchantPage() {
  const [places, accounts] = await Promise.all([getAllPlaces(), listMerchantAccounts()]);
  const takenIds = new Set(accounts.map((a) => a.placeId));
  const availablePlaces = places
    .filter((p) => !takenIds.has(p.placeId))
    .map((p) => ({ placeId: p.placeId, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return <MerchantAccountForm availablePlaces={availablePlaces} />;
}
