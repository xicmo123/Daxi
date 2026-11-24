"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { isFavorite, subscribeFavorites, toggleFavorite } from "@/lib/favorites";
import styles from "./PlacePage.module.css";

function alwaysFalse() {
  return false;
}

const I = {
  nav: <path d="M12 2.8 20 21l-8-4-8 4 8-18.2Z" />,
  call: <path d="M6.6 3.5h3l1.5 4.2-2 1.4a12 12 0 0 0 5.8 5.8l1.4-2 4.2 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />,
  web: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5Z" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" />
      <path d="M5 12v7.5h14V12" />
    </>
  ),
};

function Action({ label, icon, href, onClick, pressed, primary }: { label: string; icon: ReactNode; href?: string; onClick?: () => void; pressed?: boolean; primary?: boolean }) {
  const inner = (
    <>
      <span className={styles.actionIcon} data-primary={primary ? "true" : undefined}>
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {icon}
        </svg>
      </span>
      <span className={styles.actionLabel}>{label}</span>
    </>
  );
  return href ? (
    <a className={styles.action} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <button type="button" className={styles.action} onClick={onClick} aria-pressed={pressed}>
      {inner}
    </button>
  );
}

// The Google Maps-style row of round actions under a shop's name.
export default function PlaceActions({ placeId, name, mapsUrl, phone, website }: { placeId: string; name: string; mapsUrl: string; phone?: string; website?: string }) {
  const saved = useSyncExternalStore(subscribeFavorites, () => isFavorite(placeId), alwaysFalse);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Cancelled share sheet — nothing to do.
    }
  };

  return (
    <div className={styles.actions}>
      <Action label="導航" icon={I.nav} href={mapsUrl} primary />
      {phone ? <Action label="撥打" icon={I.call} href={`tel:${phone.replace(/[^\d+]/g, "")}`} /> : null}
      {website ? <Action label="網站" icon={I.web} href={website} /> : null}
      <Action
        label={saved ? "已收藏" : "收藏"}
        pressed={saved}
        onClick={() => toggleFavorite(placeId)}
        icon={<path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 2 4.6 5.2 3.7c2.1-.6 4.2.3 5.4 2.1l1.4 2 1.4-2c1.2-1.8 3.3-2.7 5.4-2.1 3.2.9 4.6 4.3 3 7.7-2.3 4.5-9.8 9.1-9.8 9.1Z" fill={saved ? "currentColor" : "none"} />}
      />
      <Action label={copied ? "已複製" : "分享"} icon={I.share} onClick={share} />
    </div>
  );
}
