import { pageMetadata } from "@/lib/seo";
import TouristPageHeader from "@/components/TouristPageHeader";
import LiveModeSwitcher from "@/components/LiveModeSwitcher";
import WeatherOverview from "@/components/WeatherOverview";
import { fetchDaxiRoadCctvs, type RoadCctvFeed } from "@/lib/tdxRoadCctv";
import { readTrafficAlerts } from "@/lib/trafficAlerts";
import { getCachedWeather } from "@/lib/cachedSources";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/weather",
  title: "大溪天氣與路況",
  description: "大溪即時天氣、逐時預報、公路即時影像與交通管制公告，資料來源為中央氣象署與交通部 TDX。",
});

const alertDot: Record<string, string> = {
  block: "var(--bordeaux)",
  warn: "var(--cognac-deep)",
  info: "var(--cognac)",
};

export default async function RoadConditionsPage() {
  const [trafficAlerts, roadCctvResult, weather] = await Promise.all([
    readTrafficAlerts(),
    fetchDaxiRoadCctvs()
      .then((feed): { feed: RoadCctvFeed; error?: string } => ({ feed }))
      .catch((error): { feed: null; error: string } => ({
        feed: null,
        error: error instanceof Error ? error.message : "道路 CCTV 資料載入失敗",
      })),
    getCachedWeather().catch(() => null),
  ]);

  return (
    <div>
      <TouristPageHeader href="/weather" title="天氣與即時影像" subtitle="大溪天氣、道路 CCTV 與景點直播" />

      <WeatherOverview weather={weather} />

      <LiveModeSwitcher roadFeed={roadCctvResult.feed} roadError={roadCctvResult.error} />

      <div className="safe-page-x pt-6 pb-3">
        <h2 className="font-serif text-app-heading font-semibold">交通管制公告</h2>
      </div>
      <div className="safe-page-x fade-in" style={{ borderTop: "1px solid var(--line)" }}>
        {trafficAlerts.length === 0 ? (
          <div className="py-5 text-app-label" style={{ color: "var(--ink-soft)" }}>
            目前沒有交通管制公告
          </div>
        ) : null}
        {trafficAlerts.map((a) => (
          <div key={a.id} className="flex gap-3.5 py-5" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: alertDot[a.level] }} />
            <div>
              <div className="text-app-body font-medium mb-1">{a.title}</div>
              <div className="text-app-label leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {a.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="safe-page-x pt-3 pb-10 text-app-label leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        逐日交通管制尚未有公開資料源，僅列出官方已公告的開幕日管制範圍。
      </div>
    </div>
  );
}
