import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import BusinessList from "@/components/BusinessList";
import { businessesGeneratedAt } from "@/lib/businesses";
import { getAllPlaces, readPhotos, readDetails, filterVisiblePlaces } from "@/lib/placesStore";
import { fetchDaxiParking, type LiveParkingLot } from "@/lib/tycgParking";

export const dynamic = "force-dynamic";

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
    lots = await fetchDaxiParking();
  } catch {
    lots = [];
  }

  return (
    <div className="pt-2">
      <PageHeader title="商家" subtitle={`美食・市集・${updatedLabel} 更新`} tint="wood" />
      <Suspense fallback={null}>
        <BusinessList businesses={listable} photos={photos} details={details} lots={lots} />
      </Suspense>
      <div className="safe-page-x pb-2 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        資料來源：Google Maps Places API（依 Google 使用者評論數排序，每類別各取前 20 名，半徑 3 公里內；資料每週更新一次，非即時）
      </div>
      <div className="safe-page-x pb-10 text-[10.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        圖片來源：Wikimedia Commons（CC BY / CC BY-SA），攝影：
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
