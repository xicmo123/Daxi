import SkinFooter from "@/components/skin/SkinFooter";
import styles from "@/components/skin/Skin.module.css";
import { RESIDENT_NAV } from "@/lib/residentNav";
import { ABOUT_HREF } from "@/lib/aboutOwner";

export const DAXI_OFFICE_URL = "https://www.daxi.tycg.gov.tw";

export default function ResidentFooter() {
  return (
    <SkinFooter
      groups={RESIDENT_NAV}
      aside={
        <a href="tel:1999" className={styles.hotline}>
          <small>桃園市民專線（陳情・報修）</small>
          <b>1999</b>
        </a>
      }
      sources="資料來源：大溪區公所、台灣自來水公司、台灣電力公司、交通部 TDX、衛福部 AED 急救資訊網、健保署。資訊僅供參考，以官方公告為準。"
      links={
        <>
          <a href={ABOUT_HREF}>關於本站</a>
          <a href={DAXI_OFFICE_URL} target="_blank" rel="noreferrer">
            大溪區公所官網 ↗
          </a>
        </>
      }
    />
  );
}
