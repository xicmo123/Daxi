import PageHeader from "@/components/PageHeader";
import RoadworksMap from "@/components/RoadworksMap";

export const dynamic = "force-dynamic";

export default function ResidentRoadworksPage() {
  return (
    <div className="pt-2">
      <PageHeader title="道路施工" subtitle="今日道路申挖與施工位置" tint="river" />
      <div className="safe-page-x pb-10 fade-in">
        <RoadworksMap />
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
