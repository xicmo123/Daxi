"use client";

import { useSyncExternalStore } from "react";
import { isFavorite, toggleFavorite, subscribeFavorites } from "@/lib/favorites";

function alwaysFalse() {
  return false;
}

export default function FavoriteButton({ placeId, size = 32 }: { placeId: string; size?: number }) {
  const fav = useSyncExternalStore(subscribeFavorites, () => isFavorite(placeId), alwaysFalse);

  return (
    <button
      type="button"
      aria-label={fav ? "取消收藏" : "加入收藏"}
      aria-pressed={fav}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(placeId);
      }}
      className="rounded-full flex items-center justify-center transition-transform active:scale-90"
      style={{ width: size, height: size, background: "rgba(15,17,22,0.4)", color: fav ? "#ff8a73" : "#fff" }}
    >
      <svg
        width={size * 0.45}
        height={size * 0.45}
        viewBox="0 0 24 24"
        fill={fav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 2 4.6 5.2 3.7c2.1-.6 4.2.3 5.4 2.1l1.4 2 1.4-2c1.2-1.8 3.3-2.7 5.4-2.1 3.2.9 4.6 4.3 3 7.7-2.3 4.5-9.8 9.1-9.8 9.1Z" />
      </svg>
    </button>
  );
}
