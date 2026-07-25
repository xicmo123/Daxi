"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import type { LiveParkingLot } from "@/lib/tycgParking";
import type { Coupon } from "@/lib/coupons";
import { readFavoritesRaw, subscribeFavorites } from "@/lib/favorites";
import PlaceholderIcon from "./PlaceholderIcon";
import BusinessDetailModal from "./BusinessDetailModal";

function emptyRaw() {
  return "[]";
}

export default function FavoritesView({
  allPlaces,
  photos,
  details,
  lots = [],
  coupons = [],
}: {
  allPlaces: Business[];
  photos: Record<string, PhotoCredit>;
  details: Record<string, PlaceDetail>;
  lots?: LiveParkingLot[];
  coupons?: Coupon[];
}) {
  const [openBusiness, setOpenBusiness] = useState<Business | null>(null);
  const idsRaw = useSyncExternalStore(subscribeFavorites, readFavoritesRaw, emptyRaw);

  const favorites = useMemo(() => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(idsRaw) as string[];
    } catch {
      ids = [];
    }
    const idSet = new Set(ids);
    return allPlaces.filter((p) => idSet.has(p.placeId));
  }, [allPlaces, idsRaw]);

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border px-5 py-10 text-center" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
        <div
          className="mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 2 4.6 5.2 3.7c2.1-.6 4.2.3 5.4 2.1l1.4 2 1.4-2c1.2-1.8 3.3-2.7 5.4-2.1 3.2.9 4.6 4.3 3 7.7-2.3 4.5-9.8 9.1-9.8 9.1Z" />
          </svg>
        </div>
        <div className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
          還沒有收藏的地方
        </div>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          逛景點或商家時點開詳情、按愛心，就會收在這裡。
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {favorites.map((b) => {
          const photo = photos[b.placeId];
          return (
            <button
              key={b.placeId}
              type="button"
              onClick={() => setOpenBusiness(b)}
              className="group relative h-[150px] w-full overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.98]"
              style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
            >
              {photo ? (
                <Image
                  src={photo.src}
                  alt={b.name}
                  fill
                  sizes="50vw"
                  className="object-cover transition-transform duration-500 group-active:scale-[1.03]"
                  style={{ filter: "saturate(0.9) contrast(0.98)" }}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 100%)" }}
                >
                  <PlaceholderIcon kind={b.tag} />
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.1) 45%, rgba(15,23,42,0.78) 100%)" }}
              />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="text-[13px] font-semibold leading-tight text-white truncate">{b.name}</div>
                <div className="text-[10.5px] mt-1 truncate" style={{ color: "rgba(255,255,255,0.78)" }}>
                  {categoryLabel(details[b.placeId]?.category, b.googleType, b.tag)}
                </div>
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
          allDetails={details}
          allBusinesses={allPlaces}
          photos={photos}
          lots={lots}
          coupons={coupons}
          onClose={() => setOpenBusiness(null)}
        />
      ) : null}
    </>
  );
}
