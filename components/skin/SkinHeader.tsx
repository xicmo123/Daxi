"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { writeIdentity, type Identity } from "@/lib/identity";
import type { SiteNavGroup } from "@/lib/siteNav";
import SkinIcon from "./SkinIcon";
import styles from "./Skin.module.css";

export type SkinHeaderProps = {
  brand: string;
  /** How the name is drawn in the header when it differs from the plain
   *  name — 「嗨！大溪」 is the logo, 「嗨大溪」 the name in text. */
  logo?: string;
  sub: string;
  homeHref: string;
  /** Desktop top-bar links; the ☰ menu holds everything. */
  gnb: Array<{ href: string; label: string; alsoActiveOn?: string[] }>;
  groups: SiteNavGroup[];
  /** Pills under the menu groups (settings, hotline, …). */
  menuExtras: Array<{ href: string; label: string }>;
  switchTo: { identity: Identity; href: string; label: string; menuLabel: string };
};

// Sticky Visit Jeju-style header shared by 嗨大溪 and 我是大溪人: wordmark,
// desktop GNB, a mode-switch pill and the full menu (전체메뉴) drawer.
export default function SkinHeader({ brand, logo, sub, homeHref, gnb, groups, menuExtras, switchTo }: SkinHeaderProps) {
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

  const switchMode = () => {
    setSwitching(true);
    writeIdentity(switchTo.identity);
    router.push(switchTo.href);
  };

  return (
    <>
      <header className={styles.header}>
        <Link href={homeHref} className={styles.brand} aria-label={`${brand}首頁`}>
          <span className={styles.brandMark} aria-hidden>
            <Image src="/icon-96.png" alt="" width={34} height={34} priority />
          </span>
          <span className={styles.brandText}>
            <strong>
              {(logo ?? brand).split(/(！)/).map((part, i) =>
                part === "！" ? (
                  <span key={i} style={{ color: "var(--rj-main)" }}>
                    {part}
                  </span>
                ) : (
                  part
                ),
              )}
            </strong>
            <small>{sub}</small>
          </span>
        </Link>

        <nav className={styles.gnb} aria-label="主選單">
          {gnb.map((item) => {
            const active = pathname === item.href || Boolean(item.alsoActiveOn?.includes(pathname));
            return (
              <Link key={item.href} href={item.href} className={styles.gnbLink} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.headerActions}>
          <button type="button" className={styles.modeSwitch} onClick={switchMode} disabled={switching}>
            {switching ? "切換中…" : switchTo.label}
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
                aria-labelledby="skin-menu-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.menuHead}>
                  <h2 id="skin-menu-title">全部選單</h2>
                  <button type="button" className={styles.iconButton} onClick={() => setMenuOpen(false)} aria-label="關閉選單">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </div>

                <div className={styles.menuGroups}>
                  {groups.map((group) => (
                    <section key={group.key} className={styles.menuGroup}>
                      <h3>{group.label}</h3>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item.key}>
                            <Link href={item.href} className={styles.menuLink} onClick={() => setMenuOpen(false)}>
                              <span>
                                <SkinIcon name={item.icon} size={19} />
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
                  {menuExtras.map((extra) =>
                    extra.href.startsWith("tel:") ? (
                      <a key={extra.href} href={extra.href} className={styles.modeSwitch}>
                        {extra.label}
                      </a>
                    ) : (
                      <Link key={extra.href} href={extra.href} className={styles.modeSwitch} onClick={() => setMenuOpen(false)}>
                        {extra.label}
                      </Link>
                    ),
                  )}
                  <button type="button" className={styles.modeSwitch} onClick={switchMode} disabled={switching}>
                    {switchTo.menuLabel}
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
