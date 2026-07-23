"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Business, BusinessTag } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import type { LiveParkingLot } from "@/lib/tycgParking";
import { experienceTags } from "@/lib/experience";
import BusinessDetailModal from "./BusinessDetailModal";
import PlaceholderIcon from "./PlaceholderIcon";

const tabIcon = {
  全部: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.3" />
      <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.3" />
      <rect x="4.5" y="13" width="6.5" height="6.5" rx="1.3" />
      <rect x="13" y="13" width="6.5" height="6.5" rx="1.3" />
    </svg>
  ),
  美食: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 12.2h13a6.5 6.5 0 0 1-13 0Z" />
      <path d="M8.2 18.7h7.6" />
      <path d="M7.3 9.2 16.8 4" />
      <path d="M10.1 9.2 19.5 4" />
    </svg>
  ),
  市集: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 9.5 6 4.5h12l1.5 5" />
      <path d="M4.5 9.5v9.8h15V9.5" />
      <path d="M4.5 9.5a2.6 2.6 0 0 0 5 1.3 2.6 2.6 0 0 0 5 0 2.6 2.6 0 0 0 5-1.3" />
      <path d="M10 19.3v-5.5h4v5.5" />
    </svg>
  ),
} as const;

const TABS: { label: string; value: BusinessTag | "全部" }[] = [
  { label: "全部", value: "全部" },
  { label: "美食", value: "美食" },
  { label: "市集", value: "市集" },
];

const SORTS: { label: string; value: SortKey }[] = [
  { label: "預設", value: "default" },
  { label: "評分最高", value: "rating" },
  { label: "距離最近", value: "distance" },
];

type SortKey = "default" | "rating" | "distance";
type BusinessSection = { title: string; rows: Business[] };

function isBusinessTag(value: string | null): value is BusinessTag {
  return value === "美食" || value === "市集";
}

export default function BusinessList({
  businesses,
  photos,
  details,
  lots = [],
}: {
  businesses: Business[];
  photos: Record<string, PhotoCredit>;
  details: Record<string, PlaceDetail>;
  lots?: LiveParkingLot[];
}) {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat");
  const [active, setActive] = useState<BusinessTag | "全部">(isBusinessTag(initialCat) ? initialCat : "全部");
  const [sort, setSort] = useState<SortKey>("default");
  const [openBusiness, setOpenBusiness] = useState<Business | null>(null);
  const filtered = active === "全部" ? businesses : businesses.filter((b) => b.tag === active);
  const rows =
    sort === "rating"
      ? [...filtered].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
      : sort === "distance"
        ? [...filtered].sort((a, b) => a.distanceMeters - b.distanceMeters)
        : filtered;
  const manualFeatured = rows.filter((b) => details[b.placeId]?.featured);
  const sections: BusinessSection[] = [
    { title: "大溪精選推薦", rows: manualFeatured },
    { title: "全部商家", rows },
  ].filter((section) => section.rows.length > 0);

  const renderCard = (b: Business, i: number) => {
    const photo = photos[b.placeId];
    const tags = experienceTags(b, details[b.placeId]);
    const promo = tags[0] ?? categoryLabel(details[b.placeId]?.category, b.googleType, b.tag);

    return (
      <button
        key={`${b.placeId}-${i}`}
        onClick={() => setOpenBusiness(b)}
        className="w-[72vw] max-w-[220px] shrink-0 text-left transition-transform active:scale-[0.98] sm:w-[210px] md:w-full md:max-w-none"
      >
        <div
          className="relative h-[132px] w-full overflow-hidden rounded-2xl sm:h-[142px] md:h-[158px]"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          {photo ? (
            <Image
              src={photo.src}
              alt={b.name}
              fill
              sizes="(max-width: 768px) 72vw, (max-width: 1200px) 33vw, 260px"
              className="object-cover"
              style={{ filter: "saturate(0.96) contrast(0.98)" }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 100%)",
              }}
            >
              <PlaceholderIcon kind={b.tag} />
            </div>
          )}
          <div
            className="absolute left-2.5 top-2.5 max-w-[150px] rounded-md px-2 py-1 text-[11px] font-bold leading-none"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            {promo}
          </div>
        </div>
        <div className="pt-2.5">
          <h3 className="truncate text-[17px] font-black leading-tight" style={{ color: "var(--ink)" }}>
            {b.name}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-[12.5px]" style={{ color: "var(--daxi-red)" }}>
            <span>{b.distanceLabel}</span>
            <span style={{ color: "var(--ink-soft)" }}>・</span>
            <span style={{ color: "var(--ink-soft)" }}>{b.rating !== null ? `${b.rating.toFixed(1)} 分` : "地圖導航"}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "var(--ink)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8Z" />
            </svg>
            <span>{categoryLabel(details[b.placeId]?.category, b.googleType, b.tag)}</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-3 safe-page-x pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 no-scrollbar sm:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActive(tab.value)}
              aria-pressed={active === tab.value}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-black transition-transform active:scale-95"
              style={
                active === tab.value
                  ? { background: "var(--paper-2)", color: "var(--ink)" }
                  : { background: "var(--card)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
              }
            >
              <span className="h-4 w-4 shrink-0">{tabIcon[tab.value as keyof typeof tabIcon]}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="排序方式"
          className="w-full shrink-0 rounded-full px-3 py-2 text-[13px] font-bold outline-none sm:w-auto"
          style={{ background: "var(--paper-2)", color: "var(--ink)", border: "1px solid var(--line)" }}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-9 pb-10 fade-in">
        {sections.map((section) => (
          <section key={section.title}>
            <div className="mb-4 flex items-center justify-between safe-page-x">
              <h2 className="text-[22px] font-black tracking-normal sm:text-[25px]" style={{ color: "var(--ink)" }}>
                {section.title}
              </h2>
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: "var(--paper-2)", color: "var(--ink)" }}
                aria-hidden
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto safe-page-x pb-1 no-scrollbar md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
              {section.rows.map(renderCard)}
            </div>
          </section>
        ))}
      </div>

      {openBusiness ? (
        <BusinessDetailModal
          business={openBusiness}
          photo={photos[openBusiness.placeId]}
          detail={details[openBusiness.placeId]}
          allBusinesses={businesses}
          photos={photos}
          lots={lots}
          onSelect={setOpenBusiness}
          onClose={() => setOpenBusiness(null)}
        />
      ) : null}
    </div>
  );
}
