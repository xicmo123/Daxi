import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteNavGroup } from "@/lib/siteNav";
import styles from "./Skin.module.css";

// Jeju-style footer: the whole site map in columns, a highlight card on the
// right, and the data-source line. Sits above the tab bar (app-screen pads
// for it).
export default function SkinFooter({
  groups,
  aside,
  sources,
  links,
}: {
  groups: SiteNavGroup[];
  aside: ReactNode;
  sources: string;
  links: ReactNode;
}) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <nav className={styles.footerNav} aria-label="網站導覽">
          {groups.map((group) => (
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
        {aside}
      </div>
      <div className={styles.footerBottom}>
        <span>{sources}</span>
        <span className="flex gap-4">{links}</span>
      </div>
    </footer>
  );
}
