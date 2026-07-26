import PageHeaderT from "@/components/PageHeaderT";
import RoadworksMap from "@/components/RoadworksMap";

export const dynamic = "force-dynamic";

export default function ResidentParadePage() {
  return (
    <div className="pt-2">
      <PageHeaderT titleKey="residentParadeTitle" subtitleKey="residentParadeSubtitle" tint="wood" />

      <div className="safe-page-x pb-6 fade-in">
        <div
          className="rounded-2xl px-4 py-4 text-[12.5px] leading-relaxed"
          style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}
        >
          繞境期間老街周邊道路會分時分段管制，下方地圖顯示目前已申報的道路施工／管制點（非嚴格限定今日，資料來源沒有提供精確日期範圍）；正式管制範圍與時段仍請以警察局、普濟堂公告為準。
        </div>
      </div>

      <div className="safe-page-x pb-4 fade-in">
        <div className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "var(--ink-soft)" }}>
          交通管制範圍地圖
        </div>
        <RoadworksMap />
      </div>

      <div className="safe-page-x pb-10 fade-in">
        <div className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "var(--ink-soft)" }}>
          陣頭即時動態
        </div>
        <div className="rounded-2xl border px-4 py-5 text-center" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
          <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--ink)" }}>
            尚無公開陣頭 GPS 即時追蹤資料源
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            大溪普濟堂目前未提供公開的陣頭定位 API，這裡不會顯示未經證實的位置。最新繞境動態請追蹤官方粉專。
          </p>
          <a
            href="https://www.facebook.com/search/top?q=大溪普濟堂"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold underline"
            style={{ color: "var(--daxi-red)" }}
          >
            前往大溪普濟堂官方粉專 ↗
          </a>
        </div>
      </div>
    </div>
  );
}
