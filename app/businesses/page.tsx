import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import BusinessList from "@/components/BusinessList";
import { businesses, businessesGeneratedAt } from "@/lib/businesses";
import { businessPhotos } from "@/lib/businessPhotos";

const updatedLabel = new Intl.DateTimeFormat("zh-TW", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}).format(new Date(businessesGeneratedAt));

export default function BusinessesPage() {
  return (
    <div className="pt-2">
      <PageHeader title="商家資訊" subtitle={`美食・景點・市集・${updatedLabel} 更新`} />
      <Suspense fallback={null}>
        <BusinessList />
      </Suspense>
      <div className="px-6 pb-2 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        資料來源：Google Maps Places API（依 Google 使用者評論數排序，每類別各取前 20 名，半徑 3 公里內；資料每週更新一次，非即時）
      </div>
      <div className="px-6 pb-10 text-[10.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        圖片來源：Wikimedia Commons（CC BY / CC BY-SA），攝影：
        {businesses
          .filter((b) => businessPhotos[b.placeId])
          .map((b, i) => (
            <span key={b.placeId}>
              {i > 0 ? "、" : " "}
              <a href={businessPhotos[b.placeId].sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {b.name} - {businessPhotos[b.placeId].author}
              </a>
            </span>
          ))}
        。其餘商家目前無可公開使用的圖片，僅顯示文字資訊。
      </div>
    </div>
  );
}
