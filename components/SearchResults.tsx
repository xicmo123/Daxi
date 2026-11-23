"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import { trackClick } from "@/lib/trackClient";
import { calculateDistance, formatDistance } from "@/lib/geo";
import { useUserLocation } from "@/lib/useUserLocation";
import EmptyState from "@/components/EmptyState";
import styles from "./TouristInterior.module.css";

export default function SearchResults({
  places,
  details,
  photos,
  initialQuery,
}: {
  places: Business[];
  details: Record<string, PlaceDetail>;
  photos: Record<string, PhotoCredit>;
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const userLocation = useUserLocation();
  const normalized = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalized) return [];
    return places
      .filter((p) => {
        const detail = details[p.placeId];
        return [p.name, p.address, detail?.category, detail?.story, ...(detail?.tags ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .map((place) => {
        if (!userLocation) return place;
        const distanceMeters = calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng);
        return { ...place, distanceMeters, distanceLabel: formatDistance(distanceMeters) };
      })
      .slice(0, 40);
  }, [places, details, normalized, userLocation]);

  return (
    <div className="safe-page-x page-after-header pb-10">
      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 mb-4" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--ink-soft)" }}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m20 20-4.3-4.3" />
        </svg>
        <input
          type="search"
          aria-label="搜尋景點、店家"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋景點、店家"
          className="min-h-10 min-w-0 flex-1 bg-transparent text-base outline-none"
          style={{ color: "var(--ink)" }}
        />
      </div>

      {!normalized ? (
        <EmptyState variant="car" title="輸入關鍵字開始搜尋" subtitle="例如大溪橋、豆干或和平路" />
      ) : results.length === 0 ? (
        <EmptyState variant="mascot" title={`找不到「${query}」相關結果`} subtitle="換個關鍵字試試，或許是我們還沒收錄" />
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {results.map((p) => (
            <Link
              key={p.placeId}
              href={`${p.tag === "景點" ? "/spots" : "/businesses"}?place=${encodeURIComponent(p.placeId)}`}
              onClick={() => trackClick(p.tag === "景點" ? "spot" : "business", p.placeId, p.name)}
              className="flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2.5 transition-opacity active:opacity-70"
              style={{ background: "var(--card)", borderColor: "var(--line)" }}
            >
              {photos[p.placeId]?.src ? (
                <span className={styles.resultPhoto}><Image src={photos[p.placeId].src} alt="" fill sizes="50px" /></span>
              ) : null}
              <div className="flex-1 min-w-0">
                <div className="text-app-body font-semibold truncate" style={{ color: "var(--ink)" }}>
                  {p.name}
                </div>
                <div className="text-app-label mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                  {categoryLabel(details[p.placeId]?.category, p.googleType, p.tag)} · {userLocation ? "距你" : "距老街"} {p.distanceLabel}
                </div>
              </div>
              <span aria-hidden>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
