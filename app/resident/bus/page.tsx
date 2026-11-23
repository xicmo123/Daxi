import BusMap from "@/components/BusMap";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/skin/Skin.module.css";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/bus",
  title: "大溪公車即時位置",
  description: "以目前位置為中心，查看大溪地區公車與客運的即時 GPS 位置，資料來源交通部 TDX，每 15 秒更新。",
});

export default function ResidentBusPage() {
  return (
    <main>
      <ResidentPageHeader href="/resident/bus" title="客運動態" lead="以目前位置為中心，看公車現在開到哪。" />
      <div className={styles.body}>
        <BusMap />
        <p className={styles.note}>
          資料來源：交通部運輸資料流通服務平台（TDX），每 15 秒更新一次即時公車 GPS 位置，僅顯示目前有 GPS 回傳訊號的車輛；未列出路線代表該路線暫無班次在路上，並非停駛。
        </p>
      </div>
    </main>
  );
}
