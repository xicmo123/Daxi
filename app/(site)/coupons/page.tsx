import { pageMetadata } from "@/lib/seo";
import TouristPageHeader from "@/components/TouristPageHeader";
import CouponList, { type CouponWithBusiness } from "@/components/CouponList";
import { listActiveCoupons } from "@/lib/coupons";
import { getAllPlaces, filterVisiblePlaces, readDetails } from "@/lib/placesStore";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/coupons",
  title: "大溪店家優惠券",
  description: "大溪老街店家目前可用的優惠券，出示手機由店家掃碼核銷，含使用期限與店家位置。",
});

export default async function CouponsPage() {
  const [coupons, rawPlaces, details] = await Promise.all([listActiveCoupons(), getAllPlaces(), readDetails()]);
  const places = filterVisiblePlaces(rawPlaces, details);
  const byId = new Map(places.map((p) => [p.placeId, p]));

  const rows: CouponWithBusiness[] = coupons
    .map((c): CouponWithBusiness | null => {
      const place = byId.get(c.placeId);
      if (!place) return null;
      return { ...c, businessName: place.name, distanceLabel: place.distanceLabel, lat: place.lat, lng: place.lng };
    })
    .filter((c): c is CouponWithBusiness => c !== null);

  return (
    <div>
      <TouristPageHeader href="/coupons" title="優惠券" subtitle="到店出示核銷碼，店員掃碼即可使用" />
      <div className="page-after-header pb-10">
        <CouponList coupons={rows} />
      </div>
    </div>
  );
}
