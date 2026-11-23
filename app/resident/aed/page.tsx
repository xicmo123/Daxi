import EmergencyPanel from "@/components/EmergencyPanel";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/skin/Skin.module.css";
import { fetchDaxiAEDStations } from "@/lib/aedService";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/aed",
  title: "大溪 AED 位置地圖",
  description: "查詢桃園市大溪區所有 AED 自動體外心臟電擊去顫器的設置地點，依目前位置由近到遠排列，資料來自衛福部全國 AED 急救資訊網。",
});

export const dynamic = "force-dynamic";

export default async function ResidentAEDPage() {
  const stations = await fetchDaxiAEDStations().catch(() => []);

  return (
    <main>
      <ResidentPageHeader href="/resident/aed" title="尋找 AED" lead="大溪區自動體外心臟電擊去顫器位置，由近到遠排列。" />
      <div className={styles.body}>
        <a href="tel:119" className={styles.btn} data-variant="alert">
          發現有人倒下？先撥 119
        </a>
        <EmergencyPanel stations={stations} />
        <p className={styles.note}>
          資料來源：
          <a href="https://tw-aed.mohw.gov.tw/" target="_blank" rel="noopener noreferrer">
            衛生福利部全國AED急救資訊網 ↗
          </a>
          （每日自動更新，僅列出大溪區站點）。
        </p>
      </div>
    </main>
  );
}
