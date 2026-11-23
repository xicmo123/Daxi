"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { writeIdentity } from "@/lib/identity";
import { RESIDENT_NAV, RESIDENT_PROFILE_ITEM } from "@/lib/residentNav";
import ResidentIcon from "./ResidentIcon";
import styles from "./ResidentSkin.module.css";

// Desktop GNB — the first destination of each menu group, so the bar stays
// one line. The full menu (☰) holds everything.
const GNB = [
  { href: "/resident/outages", label: "民生示警" },
  { href: "/resident/bus", label: "交通出行" },
  { href: "/resident/clinics", label: "醫療安全" },
  { href: "/resident/events", label: "社區生活" },
  { href: "/resident/services", label: "里民服務" },
];

export default function ResidentHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const goTourist = () => {
    setSwitching(true);
    writeIdentity("tourist");
    router.push("/");
  };

  return (
    <>
      <header className={styles.header}>
        <Link href="/resident" className={styles.brand} aria-label="我是大溪人首頁">
          <span className={styles.brandMark} aria-hidden>溪</span>
          <span className={styles.brandText}>
            <strong>我是大溪人</strong>
            <small>大溪通 · 居民生活資訊</small>
          </span>
        </Link>

        <nav className={styles.gnb} aria-label="主選單">
          {GNB.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.gnbLink}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <button type="button" className={styles.modeSwitch} onClick={goTourist} disabled={switching}>
            {switching ? "切換中…" : "遊客模式"}
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setMenuOpen(true)}
            aria-label="開啟全部選單"
            aria-expanded={menuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && typeof document !== "undefined"
        ? createPortal(
            <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)}>
              <div
                className={styles.menuPanel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="resident-menu-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.menuHead}>
                  <h2 id="resident-menu-title">全部選單</h2>
                  <button type="button" className={styles.iconButton} onClick={() => setMenuOpen(false)} aria-label="關閉選單">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </div>

                <div className={styles.menuGroups}>
                  {RESIDENT_NAV.map((group) => (
                    <section key={group.key} className={styles.menuGroup}>
                      <h3>{group.label}</h3>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item.key}>
                            <Link href={item.href} className={styles.menuLink} onClick={() => setMenuOpen(false)}>
                              <span>
                                <ResidentIcon name={item.icon} size={19} />
                              </span>
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>

                <div className={styles.menuFoot}>
                  <Link href={RESIDENT_PROFILE_ITEM.href} className={styles.modeSwitch} onClick={() => setMenuOpen(false)}>
                    {RESIDENT_PROFILE_ITEM.label}
                  </Link>
                  <Link href="/resident/about" className={styles.modeSwitch} onClick={() => setMenuOpen(false)}>
                    關於
                  </Link>
                  <a href="tel:1999" className={styles.modeSwitch}>
                    市民專線 1999
                  </a>
                  <button type="button" className={styles.modeSwitch} onClick={goTourist} disabled={switching}>
                    切換為遊客模式
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
