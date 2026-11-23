"use client";

import { useSyncExternalStore } from "react";
import { isFavorite, toggleFavorite, subscribeFavorites } from "@/lib/favorites";
import styles from "@/components/skin/Skin.module.css";

function alwaysFalse() {
  return false;
}

// 收藏 as a full-size skin button for the place pages; same store as the
// heart on the detail modal, so either one shows up under 我的收藏.
export default function PlaceSaveButton({ placeId }: { placeId: string }) {
  const saved = useSyncExternalStore(subscribeFavorites, () => isFavorite(placeId), alwaysFalse);
  return (
    <button type="button" className={styles.btn} data-variant="line" aria-pressed={saved} onClick={() => toggleFavorite(placeId)}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ color: saved ? "var(--rj-main)" : undefined }}>
        <path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 2 4.6 5.2 3.7c2.1-.6 4.2.3 5.4 2.1l1.4 2 1.4-2c1.2-1.8 3.3-2.7 5.4-2.1 3.2.9 4.6 4.3 3 7.7-2.3 4.5-9.8 9.1-9.8 9.1Z" />
      </svg>
      {saved ? "已收藏" : "加入收藏"}
    </button>
  );
}
