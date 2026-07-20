import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import BusinessList from "@/components/BusinessList";
import { businessesGeneratedAt } from "@/lib/businesses";

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
      <div className="px-6 pb-10 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        資料來源：Google Maps Places API（依 Google 使用者評論數排序，每類別各取前 20 名，半徑 3 公里內；資料每週更新一次，非即時）
      </div>
    </div>
  );
}
