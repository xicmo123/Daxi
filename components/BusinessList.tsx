"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { businesses, type Business, type BusinessTag } from "@/lib/businesses";
import { businessPhotos } from "@/lib/businessPhotos";
import { categoryLabel } from "@/lib/placeDetails";
import type { LiveParkingLot } from "@/lib/tycgParking";
import BusinessDetailModal from "./BusinessDetailModal";
import PlaceholderIcon from "./PlaceholderIcon";

// 景點-tagged businesses live on /spots, alongside the curated highlights —
// keep this list focused on 美食/市集 so the two pages don't duplicate content.
const listable = businesses.filter((b) => b.tag !== "景點");

const TABS: { label: string; value: BusinessTag | "全部" }[] = [
  { label: "全部", value: "全部" },
  { label: "美食", value: "美食" },
  { label: "市集", value: "市集" },
];

function isBusinessTag(value: string | null): value is BusinessTag {
  return value === "美食" || value === "市集";
}

export default function BusinessList({ lots = [] }: { lots?: LiveParkingLot[] }) {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat");
  const [active, setActive] = useState<BusinessTag | "全部">(isBusinessTag(initialCat) ? initialCat : "全部");
  const [openBusiness, setOpenBusiness] = useState<Business | null>(null);
  const rows = active === "全部" ? listable : listable.filter((b) => b.tag === active);

  return (
    <div>
      <div className="flex gap-2 px-6 pb-3 overflow-x-auto no-scrollbar">
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

      <div className="grid grid-cols-2 gap-3 px-6 pb-10 fade-in">
        {rows.map((b, i) => {
          const photo = businessPhotos[b.placeId];
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
              </div>
              <div className="p-3">
                <div className="text-[13.5px] font-serif mb-1.5 truncate" style={{ color: "var(--ink)" }}>
                  {b.name}
                </div>
                <span
                  className="inline-flex text-[10.5px] tracking-wide rounded-full px-2 py-0.5"
                  style={{ background: "var(--line)", color: "var(--ink-soft)" }}
                >
                  {categoryLabel(b.placeId, b.googleType, b.tag)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {openBusiness ? (
        <BusinessDetailModal
          business={openBusiness}
          photo={businessPhotos[openBusiness.placeId]}
          lots={lots}
          onSelect={setOpenBusiness}
          onClose={() => setOpenBusiness(null)}
        />
      ) : null}
    </div>
  );
}
