"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SiteNavGroup } from "@/lib/siteNav";
import SkinIcon from "./SkinIcon";
import styles from "./Skin.module.css";

// The Jeju 「玩樂指南」 block — tabs across the top, a photo card naming the
// group on the left, its destinations on the right.
export default function SkinGuide({ groups, label }: { groups: SiteNavGroup[]; label: string }) {
  const [tab, setTab] = useState(groups[0]?.key);
  const group = groups.find((g) => g.key === tab) ?? groups[0];
  if (!group) return null;

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label={label}>
        {groups.map((g) => (
          <button
            key={g.key}
            type="button"
            role="tab"
            id={`guide-tab-${g.key}`}
            aria-selected={g.key === group.key}
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
                <SkinIcon name={item.icon} />
              </span>
              <strong>{item.label}</strong>
              <small>{item.desc}</small>
              <span className={styles.guideArrow} aria-hidden>
                {item.sheet ? "↗" : "→"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
