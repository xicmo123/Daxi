"use client";

import { useState } from "react";
import Image from "next/image";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import type { LiveParkingLot } from "@/lib/tycgParking";
import { experienceTags } from "@/lib/experience";
import BusinessDetailModal from "./BusinessDetailModal";
import PlaceholderIcon from "./PlaceholderIcon";

export default function SpotsList({
  spots,
  featuredSpots,
  allBusinesses,
  photos,
  details,
  lots = [],
}: {
  spots: Business[];
  featuredSpots?: Business[];
  allBusinesses: Business[];
  photos: Record<string, PhotoCredit>;
  details: Record<string, PlaceDetail>;
  lots?: LiveParkingLot[];
}) {
  const [openBusiness, setOpenBusiness] = useState<Business | null>(null);
  const featuredRows = featuredSpots ?? [];
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSpots = spots;
  const rows = normalizedQuery
    ? visibleSpots.filter((s) => {
        const detail = details[s.placeId];
        return [s.name, s.address, detail?.category, detail?.story, ...(detail?.tags ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
    : visibleSpots;

  return (
    <div>
      {featuredRows.length > 0 ? (
        <>
          <div className="safe-page-x pt-1 pb-4 fade-in">
            <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--ink-soft)" }}>
              Featured
            </div>
            <h2 className="font-serif text-[17px] font-semibold">精選推薦</h2>
          </div>
          <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 fade-in">
            <div className="flex gap-4 safe-page-x">
            {featuredRows.map((b, i) => {
              const photo = photos[b.placeId];
              const tags = experienceTags(b, details[b.placeId]);
              return (
                <button
                  key={`featured-${b.placeId}`}
                  onClick={() => setOpenBusiness(b)}
                  className="group relative h-[210px] w-[82%] max-w-[330px] shrink-0 snap-center overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.99] sm:h-[240px] sm:max-w-[390px] lg:h-[280px]"
                  style={{
                    background: "var(--card)",
                    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.12)",
                    animationDelay: `${Math.min(i, 4) * 40}ms`,
                  }}
                >
                  {photo ? (
                    <Image
                      src={photo.src}
                      alt={b.name}
                      fill
                      sizes="(max-width: 768px) 82vw, (max-width: 1200px) 390px, 430px"
                      className="object-cover transition-transform duration-500 group-active:scale-[1.02]"
                      style={{ filter: "saturate(0.9) contrast(0.98)" }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 100%)",
                      }}
                    >
                      <PlaceholderIcon kind="景點" />
                    </div>
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(15,23,42,0.06) 0%, rgba(15,23,42,0.18) 45%, rgba(15,23,42,0.86) 100%)",
                    }}
                  />
                  <div
                    className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold backdrop-blur-md"
                    style={{ background: "rgba(255,255,255,0.82)", color: "var(--ink)" }}
                  >
                    {b.distanceLabel}
                  </div>
                  {featuredRows.length > 1 ? (
                    <div
                      className="absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md"
                      style={{ background: "rgba(15,23,42,0.2)", color: "#fff" }}
                    >
                      {i + 1}/{featuredRows.length}
                    </div>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-serif text-[24px] font-bold leading-tight text-white">{b.name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.86)" }}>
                        {categoryLabel(details[b.placeId]?.category, b.googleType, b.tag)}
                      </span>
                      {tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        </>
      ) : null}

      <div className="safe-page-x pt-2 pb-4 fade-in">
        <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--ink-soft)" }}>
          More
        </div>
        <h2 className="font-serif text-[17px] font-semibold">全部景點</h2>
      </div>

      <div className="safe-page-x pb-4 fade-in">
        <label
          className="flex items-center gap-3 rounded-full px-4 py-3"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="輸入想查尋的名稱"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none"
            style={{ color: "var(--ink)" }}
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--daxi-red)" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
        </label>
        <div className="pt-5 text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>
          共 {rows.length} 個景點
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 safe-page-x pb-10 fade-in md:grid-cols-2 lg:grid-cols-3">
        {rows.map((b, i) => {
          const photo = photos[b.placeId];
          const tags = experienceTags(b, details[b.placeId]);
          return (
            <button
              key={b.placeId}
              onClick={() => setOpenBusiness(b)}
              className="group relative h-[224px] w-full overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.99] sm:h-[250px] md:h-[230px] lg:h-[250px]"
              style={{
                background: "var(--card)",
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.12)",
                animationDelay: `${Math.min(i, 8) * 40}ms`,
              }}
            >
              {photo ? (
                <Image
                  src={photo.src}
                  alt={b.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-active:scale-[1.02]"
                  style={{ filter: "saturate(0.9) contrast(0.98)" }}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 100%)",
                  }}
                >
                  <PlaceholderIcon kind="景點" />
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.2) 44%, rgba(15,23,42,0.86) 100%)",
                }}
              />
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold backdrop-blur-md"
                style={{ background: "rgba(255,255,255,0.82)", color: "var(--ink)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.2" />
                </svg>
                {b.distanceLabel}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-serif text-[24px] font-bold leading-tight text-white">
                  {b.name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: "rgba(255,255,255,0.86)" }}
                >
                  {categoryLabel(details[b.placeId]?.category, b.googleType, b.tag)}
                </span>
                  {tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
        {rows.length === 0 ? (
          <div className="rounded-xl px-4 py-5 text-[13px]" style={{ background: "var(--card)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}>
            找不到符合的景點。
          </div>
        ) : null}
      </div>

      {openBusiness ? (
        <BusinessDetailModal
          business={openBusiness}
          photo={photos[openBusiness.placeId]}
          detail={details[openBusiness.placeId]}
          allBusinesses={allBusinesses}
          photos={photos}
          lots={lots}
          onSelect={setOpenBusiness}
          onClose={() => setOpenBusiness(null)}
        />
      ) : null}
    </div>
  );
}
