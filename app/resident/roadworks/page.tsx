import Link from "next/link";
import RoadworksMap from "@/components/RoadworksMap";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/skin/Skin.module.css";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/roadworks",
  title: "大溪道路施工地圖",
  description: "桃園市大溪區目前的道路申挖與施工位置地圖，繞路前先確認哪裡在施工。",
});

export const dynamic = "force-dynamic";

export default function ResidentRoadworksPage() {
  return (
    <main>
      <ResidentPageHeader href="/resident/roadworks" title="道路施工" lead="目前道路申挖與施工位置，繞路前先看一眼。" />
      <div className={styles.body}>
        <RoadworksMap />
        <p className={styles.note}>
          <b>在地人小提醒：</b>
          若地圖上老街周邊（和平路、中山路一帶）有施工或管制，改走外圍道路繞行通常比卡在路口等紅燈快。
        </p>
        <Link href="/resident/live" className={styles.btn} data-variant="line">
          查看大溪即時影像 <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
