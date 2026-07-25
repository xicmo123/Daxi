"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import type { Coupon } from "@/lib/coupons";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import { findNearestLot, haversineMeters, formatDistance, type LiveParkingLot } from "@/lib/tycgParking";
import { statusBarColor } from "@/lib/status";
import { experienceTags } from "@/lib/experience";
import PlaceholderIcon from "./PlaceholderIcon";
import ReservationBooking from "./ReservationBooking";
import FavoriteButton from "./FavoriteButton";
import CouponRedeemModal from "./CouponRedeemModal";

function nearbyBusinesses(business: Business, all: Business[], limit = 3) {
  return all
    .filter((b) => b.placeId !== business.placeId)
    .map((b) => ({ business: b, distanceMeters: haversineMeters(business, b) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

function normalizeExternalUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("@")) return `https://www.instagram.com/${trimmed.slice(1)}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

type ContactLink = {
  label: string;
  href: string;
  external: boolean;
  icon: React.ReactNode;
};

export default function BusinessDetailModal({
  business,
  photo,
  detail,
  allDetails = {},
  allBusinesses,
  photos,
  lots = [],
  couponPlaceIds = [],
  coupons = [],
  onSelect,
  onClose,
}: {
  business: Business;
  photo: PhotoCredit | undefined;
  detail: PlaceDetail | undefined;
  allDetails?: Record<string, PlaceDetail>;
  allBusinesses: Business[];
  photos: Record<string, PhotoCredit>;
  lots?: LiveParkingLot[];
  couponPlaceIds?: string[];
  coupons?: Coupon[];
  onSelect?: (b: Business) => void;
  onClose: () => void;
}) {
  const [openCoupon, setOpenCoupon] = useState<Coupon | null>(null);
  const myCoupons = coupons.filter((c) => c.placeId === business.placeId);
  const nearest = findNearestLot(business, lots, business.placeId);
  const recommendedLot = detail?.recommendedParkingName
    ? lots.find((lot) => lot.name === detail.recommendedParkingName)
    : undefined;
  const parking = recommendedLot
    ? {
        lot: recommendedLot,
        distanceMeters: haversineMeters(business, recommendedLot),
        distanceLabel: formatDistance(haversineMeters(business, recommendedLot)),
        crossesRiver: false,
        isManual: true,
      }
    : nearest
      ? { ...nearest, isManual: false }
      : null;
  const nearby = nearbyBusinesses(business, allBusinesses);
  const decisionTags = experienceTags(business, detail);
  const couponSet = new Set(couponPlaceIds);

  // 智能分流推薦: when this business is visibly busy or sold out, surface
  // nearby alternatives that are currently free of the same problem —
  // coupon-bearing ones first, since that's the strongest nudge to switch.
  const liveStatus = detail?.liveStatus;
  const isBusy = Boolean(liveStatus?.soldOut) || (liveStatus?.queueMinutes ?? 0) >= 15;
  const overflowPicks = isBusy
    ? nearbyBusinesses(business, allBusinesses, 8)
        .filter(({ business: nb }) => {
          const nbStatus = allDetails[nb.placeId]?.liveStatus;
          return !nbStatus?.soldOut && (nbStatus?.queueMinutes ?? 0) < 15;
        })
        .sort((a, b) => Number(couponSet.has(b.business.placeId)) - Number(couponSet.has(a.business.placeId)))
        .slice(0, 3)
    : [];
  const displayPhone = detail?.contact?.phone?.trim() || business.phone || undefined;
  const contactLinks: ContactLink[] = [];
  if (displayPhone) {
    contactLinks.push({
      label: "電話",
      href: `tel:${displayPhone}`,
      external: false,
      icon: (
        <path d="M4.5 4.5h4l1.5 4.5-2.5 1.5a11 11 0 0 0 5.5 5.5l1.5-2.5 4.5 1.5v4a1 1 0 0 1-1.1 1C10.7 19.2 4.8 13.3 3.5 6.1A1 1 0 0 1 4.5 4.5Z" />
      ),
    });
  }
  const facebookUrl = normalizeExternalUrl(detail?.contact?.facebook);
  if (facebookUrl) {
    contactLinks.push({
      label: "FB",
      href: facebookUrl,
      external: true,
      icon: <path d="M14 8h2V5h-2.4C10.9 5 10 6.7 10 8.6V11H8v3h2v5h3v-5h2.4l.6-3h-3V8.8c0-.5.2-.8 1-.8Z" />,
    });
  }
  const instagramUrl = normalizeExternalUrl(detail?.contact?.instagram);
  if (instagramUrl) {
    contactLinks.push({
      label: "IG",
      href: instagramUrl,
      external: true,
      icon: (
        <>
          <rect x="5" y="5" width="14" height="14" rx="4" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M16.5 7.8h.01" />
        </>
      ),
    });
  }
  const websiteUrl = normalizeExternalUrl(detail?.contact?.website);
  if (websiteUrl) {
    contactLinks.push({
      label: "官網",
      href: websiteUrl,
      external: true,
      icon: (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16" />
        </>
      ),
    });
  }

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

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={business.name}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 fade-in sm:p-5"
      style={{ background: "rgba(15,17,22,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[88svh] overflow-y-auto rounded-[22px] card-shadow sm:max-w-lg sm:rounded-[24px] lg:max-w-2xl"
        style={{ background: "var(--paper)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-bleed photo with identity only; richer story sits in the card body. */}
        <div className="relative h-48 shrink-0 sm:h-56 lg:h-64">
          {photo ? (
            <Image
              src={photo.src}
              alt={business.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 544px, 672px"
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
          <div className="absolute left-3 top-3">
            <FavoriteButton placeId={business.placeId} />
          </div>
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
            {liveStatus?.soldOut ? (
              <span
                className="inline-flex text-[10.5px] tracking-wide rounded-full px-2.5 py-1 mb-2 ml-1.5"
                style={{ background: "rgba(15,17,22,0.55)", color: "#fff" }}
              >
                今日已完售
              </span>
            ) : liveStatus?.queueMinutes ? (
              <span
                className="inline-flex text-[10.5px] tracking-wide rounded-full px-2.5 py-1 mb-2 ml-1.5"
                style={{ background: "rgba(224,90,70,0.55)", color: "#fff" }}
              >
                大排長龍・約等 {liveStatus.queueMinutes} 分鐘
              </span>
            ) : null}
            <h3 className="font-serif font-semibold text-[20px] text-white mb-1.5">{business.name}</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 lg:p-7">
          {detail?.story ? (
            <div className="mb-5 rounded-xl px-4 py-3" style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }}>
              <div className="mb-1 text-[10.5px] tracking-[0.16em] uppercase" style={{ color: "var(--ink-soft)" }}>
                推薦重點
              </div>
              <p className="font-serif text-[14px] leading-relaxed" style={{ color: "var(--ink)" }}>
                {detail.story}
              </p>
            </div>
          ) : null}

          {myCoupons.length > 0 ? (
            <div className="mb-5 flex flex-col gap-2">
              <div className="text-[10.5px] tracking-[0.16em] uppercase" style={{ color: "var(--daxi-red)" }}>
                本店優惠
              </div>
              {myCoupons.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setOpenCoupon(c)}
                  className="relative flex items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-opacity active:opacity-70"
                  style={{ background: "var(--card)", borderColor: "var(--line)" }}
                >
                  <span
                    className="absolute inset-y-2.5 left-0 w-1 rounded-r-full"
                    style={{ background: "var(--daxi-red)" }}
                    aria-hidden
                  />
                  <span
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}
                    aria-hidden
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 9.8a2.2 2.2 0 0 0 0-3.6V5.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v.7a2.2 2.2 0 0 0 0 3.6v3.4a2.2 2.2 0 0 0 0 3.6v.7a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-.7a2.2 2.2 0 0 0 0-3.6Z" />
                      <path d="M9.5 5v14" strokeDasharray="1.6 1.8" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold truncate" style={{ color: "var(--ink)" }}>
                      {c.title}
                    </div>
                    <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                      {c.desc}
                    </div>
                  </div>
                  <span className="shrink-0 text-[9.5px] font-medium rounded-full px-2 py-0.5" style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}>
                    掃碼核銷
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {overflowPicks.length > 0 ? (
            <div className="mb-5 rounded-xl px-4 py-4" style={{ background: "var(--daxi-red-soft)" }}>
              <div className="mb-3 text-[12.5px] font-semibold" style={{ color: "var(--daxi-red)" }}>
                {liveStatus?.soldOut ? "已完售，先逛逛這幾家吧" : "現場大排長龍，免排隊優質好店推薦"}
              </div>
              <div className="flex flex-col gap-2">
                {overflowPicks.map(({ business: nb }, i) => {
                  const nbPhoto = photos[nb.placeId];
                  const hasCoupon = couponSet.has(nb.placeId);
                  return (
                    <motion.button
                      key={nb.placeId}
                      type="button"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 320, damping: 24 }}
                      onClick={() => onSelect?.(nb)}
                      className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-opacity active:opacity-70"
                      style={{ background: "var(--card)" }}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                        {nbPhoto ? (
                          <Image src={nbPhoto.src} alt={nb.name} fill sizes="48px" className="object-cover" />
                        ) : (
                          <div className="absolute inset-0" style={{ background: "var(--bordeaux-surface)" }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>
                          {nb.name}
                        </div>
                        <div className="text-[10.5px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                          {nb.distanceLabel}
                        </div>
                      </div>
                      {hasCoupon ? (
                        <span
                          className="shrink-0 text-[9.5px] font-semibold rounded-full px-2 py-1"
                          style={{ background: "var(--daxi-red)", color: "#fff" }}
                        >
                          限時優惠
                        </span>
                      ) : null}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {detail?.reservation ? (
            <ReservationBooking placeId={business.placeId} reservation={detail.reservation} />
          ) : null}

          {decisionTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {decisionTags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] tracking-wide rounded-full px-2.5 py-1"
                  style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}
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
            {displayPhone ? (
              <a href={`tel:${displayPhone}`} className="flex items-center gap-2.5 transition-opacity active:opacity-60">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0" style={{ color: "var(--ink-soft)" }}>
                  <path d="M4.5 4.5h4l1.5 4.5-2.5 1.5a11 11 0 0 0 5.5 5.5l1.5-2.5 4.5 1.5v4a1 1 0 0 1-1.1 1C10.7 19.2 4.8 13.3 3.5 6.1A1 1 0 0 1 4.5 4.5Z" />
                </svg>
                <span>{displayPhone}</span>
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

          {contactLinks.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold transition-opacity active:opacity-80"
                  style={{ background: "var(--paper-2)", color: "var(--ink)", border: "1px solid var(--line)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    {link.icon}
                  </svg>
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}

          {parking ? (
            <div
              className="mt-4 flex flex-col gap-3 rounded-xl px-3.5 py-3 sm:flex-row sm:items-center"
              style={{ background: "var(--paper-2)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0" style={{ color: "var(--ink-soft)" }}>
                <rect x="4" y="4" width="16" height="16" rx="4" />
                <path d="M10 16V8h3.2a2.6 2.6 0 1 1 0 5.2H10" />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] mb-0.5" style={{ color: "var(--ink-soft)" }}>
                  {parking.isManual ? "推薦停車場" : "距此最近的停車場"}・直線距離 {parking.distanceLabel}
                  {parking.crossesRiver ? "・需過橋" : ""}
                </div>
                <div className="text-[13px] font-medium truncate" style={{ color: "var(--ink)" }}>
                  {parking.lot.name}
                </div>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                {parking.lot.status === "full" ? (
                  <span className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                    已滿
                  </span>
                ) : parking.lot.isOpenAccess ? (
                  <span className="text-[12px] font-medium" style={{ color: "var(--status-ok)" }}>
                    開放中
                  </span>
                ) : (
                  <span className="text-[13px] font-medium tabular-nums" style={{ color: statusBarColor[parking.lot.status] }}>
                    剩餘 {parking.lot.surplus}/{parking.lot.total}
                  </span>
                )}
              </div>
            </div>
          ) : null}

          <a
            href={business.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-[13px] font-semibold transition-opacity active:opacity-80"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
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
            <div className="px-5 mb-3 text-[11px] tracking-[0.15em] uppercase sm:px-6" style={{ color: "var(--ink-soft)" }}>
              周邊探索
            </div>
            <div className="flex gap-3 overflow-x-auto px-5 no-scrollbar sm:px-6">
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
      {openCoupon ? <CouponRedeemModal coupon={openCoupon} businessName={business.name} onClose={() => setOpenCoupon(null)} /> : null}
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
