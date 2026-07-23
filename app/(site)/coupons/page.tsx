import PageHeader from "@/components/PageHeader";
import CouponList, { type CouponWithBusiness } from "@/components/CouponList";
import { listActiveCoupons } from "@/lib/coupons";
import { getAllPlaces, filterVisiblePlaces, readDetails } from "@/lib/placesStore";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const [coupons, rawPlaces, details] = await Promise.all([listActiveCoupons(), getAllPlaces(), readDetails()]);
  const places = filterVisiblePlaces(rawPlaces, details);
  const byId = new Map(places.map((p) => [p.placeId, p]));

  const rows: CouponWithBusiness[] = coupons
    .map((c): CouponWithBusiness | null => {
      const place = byId.get(c.placeId);
      if (!place) return null;
      return { ...c, businessName: place.name, distanceLabel: place.distanceLabel };
    })
    .filter((c): c is CouponWithBusiness => c !== null);

  return (
    <div className="pt-2">
      <PageHeader title="優惠券" subtitle="到店出示核銷碼，店員掃碼即可使用" tint="coral" />
      <div className="pb-10">
        <CouponList coupons={rows} />
      </div>
    </div>
  );
}
