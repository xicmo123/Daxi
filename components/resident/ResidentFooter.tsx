import Link from "next/link";
import { RESIDENT_NAV } from "@/lib/residentNav";
import styles from "./ResidentSkin.module.css";

export const DAXI_OFFICE_URL = "https://www.daxi.tycg.gov.tw";

// Jeju-style footer: the whole site map in columns, a big hotline card, and
// the data-source line. Sits above the tab bar (app-screen pads for it).
export default function ResidentFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <nav className={styles.footerNav} aria-label="網站導覽">
          {RESIDENT_NAV.map((group) => (
            <div key={group.key}>
              <h4>{group.label}</h4>
              {group.items.map((item) => (
                <Link key={item.key} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <a href="tel:1999" className={styles.hotline}>
          <small>桃園市民專線（陳情・報修）</small>
          <b>1999</b>
        </a>
      </div>
      <div className={styles.footerBottom}>
        <span>
          資料來源：大溪區公所、台灣自來水公司、台灣電力公司、交通部 TDX、衛福部 AED 急救資訊網。資訊僅供參考，以官方公告為準。
        </span>
        <span className="flex gap-4">
          <Link href="/resident/about">關於本站</Link>
          <a href={DAXI_OFFICE_URL} target="_blank" rel="noreferrer">
            大溪區公所官網 ↗
          </a>
        </span>
      </div>
    </footer>
  );
}
