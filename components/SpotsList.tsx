"use client";

import { useState } from "react";
import Image from "next/image";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import type { LiveParkingLot } from "@/lib/tycgParking";
import BusinessDetailModal from "./BusinessDetailModal";
import PlaceholderIcon from "./PlaceholderIcon";

export default function SpotsList({
  spots,
  allBusinesses,
  photos,
  details,
  lots = [],
}: {
  spots: Business[];
  allBusinesses: Business[];
  photos: Record<string, PhotoCredit>;
  details: Record<string, PlaceDetail>;
  lots?: LiveParkingLot[];
}) {
  const [openBusiness, setOpenBusiness] = useState<Business | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 px-6 pb-10 fade-in">
        {spots.map((b, i) => {
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
                    <PlaceholderIcon kind="景點" />
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
