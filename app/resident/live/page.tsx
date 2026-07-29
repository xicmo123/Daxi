import PageHeader from "@/components/PageHeader";
import LiveModeSwitcher from "@/components/LiveModeSwitcher";
import { fetchDaxiRoadCctvs, type RoadCctvFeed } from "@/lib/tdxRoadCctv";

export const dynamic = "force-dynamic";

export default async function ResidentLivePage() {
  const roadCctvResult = await fetchDaxiRoadCctvs()
    .then((feed): { feed: RoadCctvFeed; error?: string } => ({ feed }))
    .catch((error): { feed: null; error: string } => ({
      feed: null,
      error: error instanceof Error ? error.message : "道路 CCTV 資料載入失敗",
    }));

  return (
    <div className="pt-2">
      <PageHeader title="即時影像" subtitle="出門前先看大溪道路與景點畫面" tint="river" />
      <LiveModeSwitcher roadFeed={roadCctvResult.feed} roadError={roadCctvResult.error} />
      <div className="safe-page-x pt-4 pb-10 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        道路 CCTV 以大溪區周邊座標與常用道路名稱篩選；影像僅供出門前判斷路況參考，實際交通仍以現場與官方公告為準。
      </div>
    </div>
  );
}
