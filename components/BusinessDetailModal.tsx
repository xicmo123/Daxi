"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import { findNearestLot, haversineMeters, formatDistance, type LiveParkingLot } from "@/lib/tycgParking";
import { statusBarColor } from "@/lib/status";
import PlaceholderIcon from "./PlaceholderIcon";
import ReservationBooking from "./ReservationBooking";

function nearbyBusinesses(business: Business, all: Business[], limit = 3) {
  return all
    .filter((b) => b.placeId !== business.placeId)
    .map((b) => ({ business: b, distanceMeters: haversineMeters(business, b) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

export default function BusinessDetailModal({
  business,
  photo,
  detail,
  allBusinesses,
  photos,
  lots = [],
  onSelect,
  onClose,
}: {
  business: Business;
  photo: PhotoCredit | undefined;
  detail: PlaceDetail | undefined;
  allBusinesses: Business[];
  photos: Record<string, PhotoCredit>;
  lots?: LiveParkingLot[];
  onSelect?: (b: Business) => void;
  onClose: () => void;
}) {
  const nearest = findNearestLot(business, lots);
  const nearby = nearbyBusinesses(business, allBusinesses);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={business.name}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fade-in"
      style={{ background: "rgba(15,17,22,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-[24px] sm:rounded-[24px] card-shadow"
        style={{ background: "var(--paper)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-bleed photo — no margin, story overlaid directly on the image */}
        <div className="relative h-64 shrink-0">
          {photo ? (
            <Image
              src={photo.src}
              alt={business.name}
              fill
              sizes="(max-width: 448px) 100vw, 420px"
              className="object-cover"
              style={{ filter: "sepia(0.06) saturate(0.85) contrast(0.97)" }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 60%, #0f0d0a 100%)",
              }}
            >
              <PlaceholderIcon kind={business.tag} />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(15,17,22,0.05) 0%, rgba(15,17,22,0.15) 45%, rgba(15,17,22,0.88) 100%)" }}
          />
          <button
            onClick={onClose}
            aria-label="關閉"
            className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
            style={{ background: "rgba(15,17,22,0.4)", color: "#fff" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <div className="absolute left-5 right-5 bottom-4">
            <span
              className="inline-flex text-[10.5px] tracking-wide rounded-full px-2.5 py-1 mb-2"
              style={{ background: "rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.9)" }}
            >
              {categoryLabel(detail?.category, business.googleType, business.tag)}
            </span>
            {business.businessStatus && business.businessStatus !== "OPERATIONAL" ? (
              <span
                className="inline-flex text-[10.5px] tracking-wide rounded-full px-2.5 py-1 mb-2 ml-1.5"
                style={{ background: "rgba(224,90,70,0.28)", color: "#ffd9d0" }}
              >
                {business.businessStatus === "CLOSED_PERMANENTLY" ? "已歇業" : "暫停營業"}
              </span>
            ) : null}
            <h3 className="font-serif font-semibold text-[20px] text-white mb-1.5">{business.name}</h3>
            {detail?.story ? (
              <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
                {detail.story}
              </p>
            ) : null}
          </div>
        </div>

        <div className="p-6">
          {detail?.reservation ? (
            <ReservationBooking placeId={business.placeId} reservation={detail.reservation} />
          ) : null}

          {detail?.tags && detail.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {detail.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] tracking-wide rounded-full px-2.5 py-1"
                  style={{ background: "var(--line)", color: "var(--ink-soft)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 text-[13.5px]" style={{ color: "var(--ink)" }}>
            {business.address ? (
              <div className="flex items-start gap-2.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mt-0.5 shrink-0" style={{ color: "var(--ink-soft)" }}>
                  <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.2" />
                </svg>
                <span className="leading-relaxed">{business.address}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0" style={{ color: "var(--ink-soft)" }}>
                <path d="M9 21 10.5 3M15 21 13.5 3" />
                <path d="M12 5.5v2.5M12 11v2.5M12 16.5V19" />
              </svg>
              <span>距老街 {business.distanceLabel}</span>
            </div>
            {business.phone ? (
              <a href={`tel:${business.phone}`} className="flex items-center gap-2.5 transition-opacity active:opacity-60">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0" style={{ color: "var(--ink-soft)" }}>
                  <path d="M4.5 4.5h4l1.5 4.5-2.5 1.5a11 11 0 0 0 5.5 5.5l1.5-2.5 4.5 1.5v4a1 1 0 0 1-1.1 1C10.7 19.2 4.8 13.3 3.5 6.1A1 1 0 0 1 4.5 4.5Z" />
                </svg>
                <span>{business.phone}</span>
              </a>
            ) : null}
            {business.rating !== null ? (
              <div className="flex items-center gap-2.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" style={{ color: "var(--ink-soft)" }}>
                  <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8Z" />
                </svg>
                <span>
                  {business.rating.toFixed(1)}・{business.reviewCount.toLocaleString()} 則評論
                </span>
              </div>
            ) : null}
          </div>

          {nearest ? (
            <div
              className="flex items-center gap-3 mt-4 rounded-xl px-3.5 py-3"
              style={{ background: "var(--paper-2)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0" style={{ color: "var(--ink-soft)" }}>
                <rect x="4" y="4" width="16" height="16" rx="4" />
                <path d="M10 16V8h3.2a2.6 2.6 0 1 1 0 5.2H10" />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] mb-0.5" style={{ color: "var(--ink-soft)" }}>
                  距此最近的停車場・{nearest.distanceLabel}
                </div>
                <div className="text-[13px] font-medium truncate" style={{ color: "var(--ink)" }}>
                  {nearest.lot.name}
                </div>
              </div>
              <div className="text-right shrink-0">
                {nearest.lot.status === "full" ? (
                  <span className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                    已滿
                  </span>
                ) : nearest.lot.isOpenAccess ? (
                  <span className="text-[12px] font-medium" style={{ color: "var(--status-ok)" }}>
                    開放中
                  </span>
                ) : (
                  <span className="text-[13px] font-medium tabular-nums" style={{ color: statusBarColor[nearest.lot.status] }}>
                    剩餘 {nearest.lot.surplus}/{nearest.lot.total}
                  </span>
                )}
              </div>
            </div>
          ) : null}

          <a
            href={business.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity active:opacity-60"
            style={{ color: "var(--ink)", borderBottom: "1px solid var(--ink)" }}
          >
            開啟導航
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        </div>

        {/* Explore nearby — geographic proximity, not a curated theme */}
        {nearby.length > 0 ? (
          <div className="pb-6">
            <div className="px-6 mb-3 text-[11px] tracking-[0.15em] uppercase" style={{ color: "var(--ink-soft)" }}>
              周邊探索
            </div>
            <div className="flex gap-3 px-6 overflow-x-auto no-scrollbar">
              {nearby.map(({ business: nb, distanceMeters }) => {
                const nbPhoto = photos[nb.placeId];
                return (
                  <button
                    key={nb.placeId}
                    onClick={() => onSelect?.(nb)}
                    className="w-28 shrink-0 text-left transition-opacity active:opacity-70"
                  >
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden mb-1.5">
                      {nbPhoto ? (
                        <Image
                          src={nbPhoto.src}
                          alt={nb.name}
                          fill
                          sizes="112px"
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
                          <PlaceholderIcon kind={nb.tag} />
                        </div>
                      )}
                    </div>
                    <div className="text-[12px] font-medium truncate" style={{ color: "var(--ink)" }}>
                      {nb.name}
                    </div>
                    <div className="text-[10.5px]" style={{ color: "var(--ink-soft)" }}>
                      {formatDistance(distanceMeters)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
