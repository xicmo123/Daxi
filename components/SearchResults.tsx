"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import { trackClick } from "@/lib/trackClient";

export default function SearchResults({
  places,
  details,
  initialQuery,
}: {
  places: Business[];
  details: Record<string, PlaceDetail>;
  photos: Record<string, PhotoCredit>;
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
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
      .slice(0, 40);
  }, [places, details, normalized]);

  return (
    <div className="safe-page-x pb-10">
      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 mb-4" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--ink-soft)" }}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m20 20-4.3-4.3" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋景點、店家、活動"
          className="flex-1 bg-transparent text-[13px] outline-none"
          style={{ color: "var(--ink)" }}
        />
      </div>

      {!normalized ? (
        <div className="text-center text-[12.5px] py-8" style={{ color: "var(--ink-soft)" }}>
          輸入關鍵字開始搜尋
        </div>
      ) : results.length === 0 ? (
        <div className="text-center text-[12.5px] py-8" style={{ color: "var(--ink-soft)" }}>
          找不到「{query}」相關結果
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((p) => (
            <Link
              key={p.placeId}
              href={p.tag === "景點" ? "/spots" : "/businesses"}
              onClick={() => trackClick(p.tag === "景點" ? "spot" : "business", p.placeId, p.name)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 card-shadow transition-opacity active:opacity-70"
              style={{ background: "var(--card)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>
                  {p.name}
                </div>
                <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                  {categoryLabel(details[p.placeId]?.category, p.googleType, p.tag)} · {p.distanceLabel}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
