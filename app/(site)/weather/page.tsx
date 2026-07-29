import PageHeader from "@/components/PageHeader";
import LiveModeSwitcher from "@/components/LiveModeSwitcher";
import { fetchDaxiRoadCctvs, type RoadCctvFeed } from "@/lib/tdxRoadCctv";
import { readTrafficAlerts } from "@/lib/trafficAlerts";

export const dynamic = "force-dynamic";

const alertDot: Record<string, string> = {
  block: "var(--bordeaux)",
  warn: "var(--cognac-deep)",
  info: "var(--cognac)",
};

export default async function RoadConditionsPage() {
  const [trafficAlerts, roadCctvResult] = await Promise.all([
    readTrafficAlerts(),
    fetchDaxiRoadCctvs()
      .then((feed): { feed: RoadCctvFeed; error?: string } => ({ feed }))
      .catch((error): { feed: null; error: string } => ({
        feed: null,
        error: error instanceof Error ? error.message : "道路 CCTV 資料載入失敗",
      })),
  ]);

  return (
    <div className="pt-2">
      <PageHeader title="即時影像" subtitle="大溪區・道路 CCTV 與景點直播" tint="river" />

      <LiveModeSwitcher roadFeed={roadCctvResult.feed} roadError={roadCctvResult.error} />

      <div className="px-6 pt-10 pb-4">
        <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--ink-soft)" }}>
          Alerts
        </div>
        <h2 className="font-serif text-[17px] font-semibold">交通管制公告</h2>
      </div>
      <div className="px-6 fade-in" style={{ borderTop: "1px solid var(--line)" }}>
        {trafficAlerts.length === 0 ? (
          <div className="py-5 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
            目前沒有交通管制公告
          </div>
        ) : null}
        {trafficAlerts.map((a) => (
          <div key={a.id} className="flex gap-3.5 py-5" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: alertDot[a.level] }} />
            <div>
              <div className="text-[13.5px] font-medium mb-1">{a.title}</div>
              <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {a.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 pt-4 pb-10 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        逐日交通管制尚未有公開資料源，僅列出官方已公告的開幕日管制範圍。
      </div>
    </div>
  );
}
