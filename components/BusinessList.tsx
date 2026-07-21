"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Business, BusinessTag } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import type { LiveParkingLot } from "@/lib/tycgParking";
import BusinessDetailModal from "./BusinessDetailModal";
import PlaceholderIcon from "./PlaceholderIcon";

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

  return (
    <div>
      <div className="flex items-center justify-between gap-2 px-6 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActive(tab.value)}
              aria-pressed={active === tab.value}
              className="shrink-0 text-[12.5px] font-semibold rounded-full px-3.5 py-1.5 transition-transform active:scale-95"
              style={
                active === tab.value
                  ? { background: "var(--accent)", color: "var(--accent-fg)" }
                  : { background: "var(--card)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="排序方式"
          className="shrink-0 text-[12px] font-medium rounded-full px-2.5 py-1.5 outline-none"
          style={{ background: "var(--card)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 px-6 pb-10 fade-in">
        {rows.map((b, i) => {
          const photo = photos[b.placeId];
          return (
            <button
              key={b.placeId}
              onClick={() => setOpenBusiness(b)}
              className="text-left rounded-2xl overflow-hidden card-shadow transition-opacity active:opacity-70"
              style={{ background: "var(--card)", animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="relative w-full aspect-[4/5]">
                {photo ? (
                  <Image
                    src={photo.src}
                    alt={b.name}
                    fill
                    sizes="(max-width: 448px) 50vw, 220px"
                    className="object-cover"
                    style={{ filter: "sepia(0.06) saturate(0.85) contrast(0.97)" }}
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
                {b.businessStatus && b.businessStatus !== "OPERATIONAL" ? (
                  <span
                    className="absolute left-2 top-2 text-[10px] font-medium rounded-full px-2 py-0.5"
                    style={{ background: "rgba(15,17,22,0.7)", color: "#ffd9d0" }}
                  >
                    {b.businessStatus === "CLOSED_PERMANENTLY" ? "已歇業" : "暫停營業"}
                  </span>
                ) : null}
              </div>
              <div className="p-3">
                <div className="text-[13.5px] font-serif mb-1 truncate" style={{ color: "var(--ink)" }}>
                  {b.name}
                </div>
                <div className="flex items-center gap-1.5 mb-1.5 text-[11px]" style={{ color: "var(--ink-soft)" }}>
                  {b.rating !== null ? (
                    <span className="flex items-center gap-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8Z" />
                      </svg>
                      {b.rating.toFixed(1)}
                    </span>
                  ) : null}
                  {b.rating !== null ? <span>・</span> : null}
                  <span>{b.distanceLabel}</span>
                </div>
                <span
                  className="inline-flex text-[10.5px] tracking-wide rounded-full px-2 py-0.5"
                  style={{ background: "var(--line)", color: "var(--ink-soft)" }}
                >
                  {categoryLabel(details[b.placeId]?.category, b.googleType, b.tag)}
                </span>
              </div>
            </button>
          );
        })}
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
