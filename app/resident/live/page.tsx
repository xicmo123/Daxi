import LiveModeSwitcher from "@/components/LiveModeSwitcher";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/skin/Skin.module.css";
import { fetchDaxiRoadCctvs, type RoadCctvFeed } from "@/lib/tdxRoadCctv";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/live",
  title: "大溪即時影像與路況",
  description: "大溪道路 CCTV 與景點即時影像，出門前先看塞不塞車，資料來源交通部 TDX。",
});

export const dynamic = "force-dynamic";

export default async function ResidentLivePage() {
  const roadCctvResult = await fetchDaxiRoadCctvs()
    .then((feed): { feed: RoadCctvFeed; error?: string } => ({ feed }))
    .catch((error): { feed: null; error: string } => ({
      feed: null,
      error: error instanceof Error ? error.message : "道路 CCTV 資料載入失敗",
    }));

  return (
    <main>
      <ResidentPageHeader href="/resident/live" title="即時影像" lead="出門前先看大溪道路與景點畫面。" />
      <div>
        <LiveModeSwitcher roadFeed={roadCctvResult.feed} roadError={roadCctvResult.error} />
      </div>
      <div className={styles.body}>
        <p className={styles.note}>
          道路 CCTV 以大溪區周邊座標與常用道路名稱篩選；影像僅供出門前判斷路況參考，實際交通仍以現場與官方公告為準。
        </p>
      </div>
    </main>
  );
}
