import { pageMetadata } from "@/lib/seo";
import TouristPageHeader from "@/components/TouristPageHeader";
import BusMap from "@/components/BusMap";
import Link from "next/link";
import styles from "@/components/TouristInterior.module.css";

export const metadata = pageMetadata({
  path: "/bus",
  title: "大溪公車即時動態",
  description: "大溪地區公車即時 GPS 位置與到站時間，資料來源為交通部運輸資料流通服務平台（TDX），每 15 秒更新。",
});

export default function BusPage() {
  return (
    <div>
      <TouristPageHeader title="大溪公車" subtitle="查路線、停靠站和到站時間，並在地圖上看即時車輛位置。">
        <Link href="/parking" className={styles.secondaryLink}>找停車場 <span aria-hidden>→</span></Link>
      </TouristPageHeader>

      <div className="safe-page-x page-after-header pb-10 fade-in flex flex-col gap-3">
        <BusMap />
        <div className="rounded-2xl border px-4 py-3.5 text-app-label leading-relaxed" style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink-soft)" }}>
          資料來源：交通部運輸資料流通服務平台（TDX），每 15 秒更新一次即時公車 GPS 位置，僅顯示目前有 GPS 回傳訊號的車輛；未列出路線代表該路線暫無班次在路上，並非停駛。
        </div>
      </div>
    </div>
  );
}
