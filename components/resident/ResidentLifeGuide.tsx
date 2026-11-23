"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import GarbageTruckMap from "@/components/GarbageTruckMap";
import { RESIDENT_NAV } from "@/lib/residentNav";
import ResidentIcon from "./ResidentIcon";
import ResidentSheet from "./ResidentSheet";
import styles from "./ResidentSkin.module.css";

// The Jeju 「玩樂指南」 block — tabs across the top, a photo card naming the
// group on the left, its destinations on the right. 垃圾清運 has no page of
// its own; it opens the live truck map as a sheet, addressable as
// /resident?open=garbage so the menu, finder and hero can link to it.
export default function ResidentLifeGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [tab, setTab] = useState(RESIDENT_NAV[0].key);
  const garbageOpen = params.get("open") === "garbage";

  const closeGarbage = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const group = RESIDENT_NAV.find((g) => g.key === tab) ?? RESIDENT_NAV[0];

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label="生活指南分類">
        {RESIDENT_NAV.map((g) => (
          <button
            key={g.key}
            type="button"
            role="tab"
            id={`guide-tab-${g.key}`}
            aria-selected={g.key === tab}
            aria-controls="guide-panel"
            className={styles.tab}
            onClick={() => setTab(g.key)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div id="guide-panel" role="tabpanel" aria-labelledby={`guide-tab-${group.key}`} className={styles.guide}>
        <div className={styles.guideFeature}>
          <Image src={group.photo.src} alt="" fill sizes="(max-width: 767px) 100vw, 480px" />
          <h3>{group.label}</h3>
          <p>{group.intro}</p>
          <a className={styles.guideCredit} href={group.photo.sourceUrl} target="_blank" rel="noreferrer">
            攝影 {group.photo.author}
          </a>
        </div>
        <div className={styles.guideList}>
          {group.items.map((item) => (
            <Link key={item.key} href={item.href} scroll={item.sheet ? false : undefined} className={styles.guideItem}>
              <span className={styles.guideIcon}>
                <ResidentIcon name={item.icon} />
              </span>
              <strong>{item.label}</strong>
              <small>{item.desc}</small>
              <span className={styles.guideArrow} aria-hidden>{item.sheet ? "↗" : "→"}</span>
            </Link>
          ))}
        </div>
      </div>

      {garbageOpen ? (
        <ResidentSheet title="垃圾車即時位置" eyebrow={<span className={styles.badge} data-tone="main">垃圾清運</span>} wide onClose={closeGarbage}>
          <GarbageTruckMap />
        </ResidentSheet>
      ) : null}
    </>
  );
}
