import { pageMetadata } from "@/lib/seo";
import DaxiWalk from "@/components/DaxiWalk";
import TouristPageHeader from "@/components/TouristPageHeader";
import styles from "@/components/TouristGuide.module.css";
import { daxiWalkHref, daxiWalkLength, daxiWalkTitle, daxiWalkVisitTime } from "@/lib/daxiWalk";

export const metadata = pageMetadata({
  path: daxiWalkHref,
  title: daxiWalkTitle,
  description: "漫步大溪老城，從和平老街走到普濟堂、中正公園和武德殿。查看步行路線、各站故事與導航。",
});

export default function OldStreetWalkPage() {
  return (
    <main>
      <TouristPageHeader href={daxiWalkHref} title={daxiWalkTitle} subtitle="從和平老街出發。可依序散步，也可選一站直接導航。">
        <div className={styles.walkMeta}>
          <span>4 站 · {daxiWalkLength}</span>
          <span>步行約 15 分鐘</span>
          <span>{daxiWalkVisitTime}（含停留）</span>
        </div>
      </TouristPageHeader>
      <div className={`${styles.walkPage} pt-4`}>
        <DaxiWalk />
        <p className={styles.credits}>
          路線與時間依 <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer">FOSSGIS 步行路網</a>估算。
          站點資料參考 <a href="https://travel.tycg.gov.tw/zh-tw/travel/tour/335" target="_blank" rel="noreferrer">桃園觀光導覽網</a>、
          <a href="https://wem.tycg.gov.tw/News_Content.aspx?n=14933&s=1157539&sms=17238" target="_blank" rel="noreferrer">大溪木藝生態博物館</a>。
        </p>
      </div>
    </main>
  );
}
