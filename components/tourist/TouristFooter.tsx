import Link from "next/link";
import SkinFooter from "@/components/skin/SkinFooter";
import styles from "@/components/skin/Skin.module.css";
import { daxiWalkHref, daxiWalkVisitTime } from "@/lib/daxiWalk";
import { TOURIST_NAV } from "@/lib/touristNav";
import { ABOUT_HREF } from "@/lib/aboutOwner";

export default function TouristFooter() {
  return (
    <SkinFooter
      groups={TOURIST_NAV}
      aside={
        <Link href={daxiWalkHref} className={styles.hotline}>
          <small>第一次來大溪？</small>
          <b>老街散步 →</b>
          <small>4 站步行導覽 · {daxiWalkVisitTime}</small>
        </Link>
      }
      sources="資料來源：桃園市政府觀光旅遊局、大溪區公所、交通部 TDX、中央氣象署、桃園市交通局停車資料與店家提供資訊。資訊僅供參考，以官方公告為準。"
      links={
        <>
          <a href={ABOUT_HREF}>關於本站</a>
          <Link href="/privacy">隱私權</Link>
          <Link href="/terms">服務條款</Link>
        </>
      }
    />
  );
}
