import PageHeader from "@/components/PageHeader";
import RoadworksMap from "@/components/RoadworksMap";
import CongestionIndexCard from "@/components/CongestionIndexCard";
import { fetchDaxiRoadworks } from "@/lib/taoyuanRoadworks";
import { getFestivalTiming } from "@/lib/festivalTiming";
import { congestionScore } from "@/lib/experience";

export const dynamic = "force-dynamic";

export default async function ResidentRoadworksPage() {
  let roadworkCount = 0;
  try {
    roadworkCount = (await fetchDaxiRoadworks()).length;
  } catch {
    roadworkCount = 0;
  }
  const score = congestionScore({ roadworkCount, isFestivalToday: getFestivalTiming().phase === "during" });

  return (
    <div className="pt-2">
      <PageHeader title="道路施工" subtitle="目前道路申挖與施工位置" tint="river" />
      <div className="pb-4">
        <CongestionIndexCard score={score} />
      </div>
      <div className="safe-page-x pb-10 fade-in">
        <RoadworksMap />
        <div
          className="mt-3 rounded-2xl border px-4 py-3.5 text-[12px] leading-relaxed"
          style={{ background: "var(--river-teal-soft)", borderColor: "var(--line)", color: "var(--ink-soft)" }}
        >
          <span className="font-semibold" style={{ color: "var(--ink)" }}>
            在地人小提醒：
          </span>
          若地圖上老街周邊（和平路、中山路一帶）有施工或管制，改走外圍道路繞行通常比卡在路口等紅燈快。
        </div>
        <a
          href="https://rmic.tycg.gov.tw/TYRGIS/Map/index"
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-between rounded-2xl border px-4 py-3 text-[13px] font-semibold transition-opacity active:opacity-70"
          style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--river-teal)" }}
        >
          桃園道管即時影像系統
          <span aria-hidden>↗</span>
        </a>
      </div>
    </div>
  );
}
