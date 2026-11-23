import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import TouristPageHeader from "@/components/TouristPageHeader";
import BusinessList from "@/components/BusinessList";
import { businessesGeneratedAt } from "@/lib/businesses";
import { getAllPlaces, readPhotos, readDetails, filterVisiblePlaces } from "@/lib/placesStore";
import type { LiveParkingLot } from "@/lib/tycgParking";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrapper is immune to it. See lib/cachedSources.ts.
import { getCachedParking } from "@/lib/cachedSources";
import { listActiveCoupons } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/businesses",
  title: "大溪美食與商家",
  description: "大溪老街的豆干、小吃、伴手禮與市集商家清單，含營業狀態、排隊情況、優惠券與步行距離。",
});

const updatedLabel = new Intl.DateTimeFormat("zh-TW", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}).format(new Date(businessesGeneratedAt));

export default async function BusinessesPage() {
  const [allPlaces, photos, details] = await Promise.all([getAllPlaces(), readPhotos(), readDetails()]);
  // 景點-tagged places live on /spots, alongside the curated highlights —
  // keep this list focused on 美食/市集 so the two pages don't duplicate content.
  const listable = filterVisiblePlaces(allPlaces, details).filter((b) => b.tag !== "景點");

  let lots: LiveParkingLot[] = [];
  try {
    lots = await getCachedParking();
  } catch {
    lots = [];
  }

  let coupons: Awaited<ReturnType<typeof listActiveCoupons>> = [];
  try {
    coupons = await listActiveCoupons();
  } catch {
    coupons = [];
  }
  const couponPlaceIds = Array.from(new Set(coupons.map((c) => c.placeId)));

  return (
    <div>
      <TouristPageHeader href="/businesses" title="大溪美食與店家" subtitle={`逛市場、找小吃和伴手禮 · ${updatedLabel} 更新`} photo={photos["ChIJR01hKyIYaDQRQCD0hbGmyUA"]} />
      <Suspense fallback={null}>
        <BusinessList businesses={listable} photos={photos} details={details} lots={lots} couponPlaceIds={couponPlaceIds} coupons={coupons} />
      </Suspense>
      <div className="safe-page-x pb-2 text-app-label leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        資料來源：Google Maps Places API（依 Google 使用者評論數排序，每類別各取前 20 名，半徑 3 公里內；資料每週更新一次，非即時）
      </div>
      <div className="safe-page-x pb-10 text-app-label leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        圖片來源：Wikimedia Commons（CC BY / CC BY-SA）／桃園市政府觀光旅遊局，攝影：
        {listable
          .filter((b) => photos[b.placeId]?.author)
          .map((b, i) => (
            <span key={b.placeId}>
              {i > 0 ? "、" : " "}
              {photos[b.placeId].sourceUrl ? (
                <a href={photos[b.placeId].sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {b.name} - {photos[b.placeId].author}
                </a>
              ) : (
                <>
                  {b.name} - {photos[b.placeId].author}
                </>
              )}
            </span>
          ))}
        。其餘商家目前無可公開使用的圖片，僅顯示文字資訊。
      </div>
    </div>
  );
}
