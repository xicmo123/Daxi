import EmergencyPanel from "@/components/EmergencyPanel";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/skin/Skin.module.css";
import { getDaxiAEDStations } from "@/lib/aedService";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/aed",
  title: "大溪 AED 位置地圖",
  description: "查詢桃園市大溪區所有 AED 自動體外心臟電擊去顫器的設置地點，依目前位置由近到遠排列，資料來自衛福部全國 AED 急救資訊網。",
});

export const dynamic = "force-dynamic";

const OFFICIAL_MAP = "https://tw-aed.mohw.gov.tw/";

function formatFetchedAt(ms: number): string {
  return new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(ms);
}

export default async function ResidentAEDPage() {
  // Never waits more than a few seconds on the ministry's feed: an emergency
  // page that spins is worse than one that points at the official map.
  const { stations, fetchedAt } = await getDaxiAEDStations();

  return (
    <main>
      <ResidentPageHeader href="/resident/aed" title="尋找 AED" lead="大溪區自動體外心臟電擊去顫器位置，由近到遠排列。" />
      <div className={styles.body}>
        <a href="tel:119" className={styles.btn} data-variant="alert">
          發現有人倒下？先撥 119
        </a>
        {stations.length > 0 ? (
          <EmergencyPanel stations={stations} />
        ) : (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>AED 資料暫時連不上</h2>
            <p className={styles.panelLead}>
              衛福部的 AED 資料目前無法從嗨大溪讀取。請直接開啟衛福部的全國 AED 地圖找最近的一台；撥打 119 時，派遣員也會告訴你最近的 AED 在哪裡。
            </p>
            <div className={styles.btnRow} style={{ marginTop: 14 }}>
              <a className={styles.btn} href={OFFICIAL_MAP} target="_blank" rel="noopener noreferrer">
                開啟衛福部 AED 地圖 ↗
              </a>
            </div>
          </div>
        )}
        <p className={styles.note}>
          資料來源：
          <a href={OFFICIAL_MAP} target="_blank" rel="noopener noreferrer">
            衛生福利部全國AED急救資訊網 ↗
          </a>
          （僅列出大溪區站點{fetchedAt ? `，資料更新於 ${formatFetchedAt(fetchedAt)}` : ""}）。
        </p>
      </div>
    </main>
  );
}
