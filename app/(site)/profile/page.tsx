import PageHeader from "@/components/PageHeader";
import FavoritesView from "@/components/FavoritesView";
import IdentitySwitchCard from "@/components/IdentitySwitchCard";
import { getAllPlaces, readPhotos, readDetails, filterVisiblePlaces } from "@/lib/placesStore";
import { fetchDaxiParking, type LiveParkingLot } from "@/lib/tycgParking";
import { listActiveCoupons } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [rawPlaces, photos, details] = await Promise.all([getAllPlaces(), readPhotos(), readDetails()]);
  const allPlaces = filterVisiblePlaces(rawPlaces, details);

  let lots: LiveParkingLot[] = [];
  try {
    lots = await fetchDaxiParking();
  } catch {
    lots = [];
  }

  let coupons: Awaited<ReturnType<typeof listActiveCoupons>> = [];
  try {
    coupons = await listActiveCoupons();
  } catch {
    coupons = [];
  }

  return (
    <div className="pt-2">
      <PageHeader title="我的" subtitle="收藏的景點與店家" tint="wood" />

      <div className="safe-page-x pb-10 fade-in flex flex-col gap-4">
        <FavoritesView allPlaces={allPlaces} photos={photos} details={details} lots={lots} coupons={coupons} />
        <IdentitySwitchCard currentLabel="遊客" switchToHref="/resident" switchToLabel="切換為大溪人模式" switchToIdentity="resident" />
      </div>
    </div>
  );
}
