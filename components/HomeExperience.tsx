"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackClick } from "@/lib/trackClient";
import { writeIdentity } from "@/lib/identity";
import type { CouponWithBusiness } from "./CouponList";
import CouponRedeemModal from "./CouponRedeemModal";
import PlaceholderIcon from "./PlaceholderIcon";
import HeroCarousel, { type HeroSlide } from "./HeroCarousel";
import { HeaderShapes } from "./PageHeader";

export type FeedSpot = {
  placeId: string;
  name: string;
  category: string;
  walkTime: string;
  distanceMeters: number;
  featured: boolean;
  photoSrc?: string;
  indoor?: boolean;
};

// Tag used only for click-tracking context, not for reordering content
// anymore — "我是大溪人" now navigates to the separate /resident section
// (see IdentityGate) rather than re-sorting this page in place.
const TRACK_TAG = "tourist";

export default function HomeExperience({
  todayLabel,
  hasRecentAnnouncement,
  spots,
  coupons,
  weatherMood = "normal",
  weatherSummary = null,
  heroSlides = [],
  initialSlideIndex = 0,
}: {
  todayLabel: string;
  hasRecentAnnouncement: boolean;
  spots: FeedSpot[];
  coupons: CouponWithBusiness[];
  weatherMood?: "hot" | "rain" | "normal";
  weatherSummary?: { icon: string; temp: number; text: string } | null;
  heroSlides?: HeroSlide[];
  initialSlideIndex?: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [openCoupon, setOpenCoupon] = useState<CouponWithBusiness | null>(null);
  const [switching, setSwitching] = useState(false);

  const goResident = () => {
    setSwitching(true);
    writeIdentity("resident");
    router.push("/resident");
  };

  const wantsIndoor = weatherMood === "hot" || weatherMood === "rain";
  const visibleSpots = useMemo(
    () =>
      [...spots]
        .sort((a, b) => {
          if (wantsIndoor) {
            const indoorDiff = Number(b.indoor) - Number(a.indoor);
            if (indoorDiff !== 0) return indoorDiff;
          }
          return Number(b.featured) - Number(a.featured);
        })
        .slice(0, 8),
    [spots, wantsIndoor]
  );
  const visibleCoupons = useMemo(() => coupons.slice(0, 6), [coupons]);

  const heroGradient =
    weatherMood === "hot"
      ? "linear-gradient(160deg, rgba(224,122,79,0.95) 0%, rgba(196,84,60,0.92) 100%)"
      : weatherMood === "rain"
        ? "linear-gradient(160deg, rgba(90,124,150,0.95) 0%, rgba(58,90,115,0.92) 100%)"
        : "linear-gradient(160deg, rgba(215,160,107,0.94) 0%, rgba(184,129,76,0.92) 100%)";

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    trackClick("map_card", "search", q, TRACK_TAG);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div>
      {/* Hero color-block banner: greeting/bell + identity switcher + search all
          sit on one solid coral panel, chicTrip-style, instead of blending
          into the page background. */}
      <motion.div
        className="relative overflow-hidden safe-page-x pt-6 pb-5 fade-in"
        animate={{ background: heroGradient }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          boxShadow: "var(--shadow-float)",
        }}
      >
        <HeaderShapes />
        {/* 1. "Daxi Today" eyebrow + headline, weather chip + bell + profile */}
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase" style={{ color: "rgba(43,36,32,0.7)" }}>
              Daxi Today · {todayLabel}
            </div>
            <div className="font-serif text-[19px] font-bold leading-tight" style={{ color: "var(--block-fg)" }}>
              臺灣十大觀光小城 - 大溪
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {weatherSummary ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                style={{ background: "rgba(255,255,255,0.32)", color: "var(--block-fg)" }}
              >
                {weatherSummary.icon} {weatherSummary.temp}°
              </span>
            ) : null}
            <Link
              href="/announcements"
              aria-label="通知"
              className="relative w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
              style={{ background: "rgba(255,255,255,0.2)", color: "var(--block-fg)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 10.5a6 6 0 0 1 12 0c0 3.5 1 5 1.6 5.8H4.4C5 15.5 6 14 6 10.5Z" />
                <path d="M10.2 19.5a1.9 1.9 0 0 0 3.6 0" />
              </svg>
              {hasRecentAnnouncement ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 0 1.5px rgba(255,255,255,0.9)" }} aria-hidden />
              ) : null}
            </Link>
            <Link
              href="/profile"
              aria-label="我的"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
              style={{ background: "rgba(255,255,255,0.2)", color: "var(--block-fg)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8.3" r="3.3" />
                <path d="M5.3 19.8c1-3.2 3.6-5 6.7-5s5.7 1.8 6.7 5" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 2. Identity switcher — 我是遊客 stays here; 我是大溪人 leaves for
            the separate /resident section entirely (different nav, different
            content), not just a re-sort of this page. */}
        <div className="relative pt-4">
          <div className="inline-flex p-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
            <span
              className="px-4 py-1.5 rounded-full text-[12.5px] font-medium"
              style={{ background: "#ffffff", color: "var(--block-wood-deep)" }}
            >
              我是遊客
            </span>
            <button
              type="button"
              onClick={goResident}
              disabled={switching}
              className="px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
              style={{ background: "transparent", color: "rgba(43,36,32,0.72)", opacity: switching ? 0.6 : 1 }}
            >
              {switching ? "切換中…" : "我是大溪人"}
            </button>
          </div>
        </div>

        {/* 3. Search bar */}
        <form onSubmit={onSearch} className="relative pt-3">
          <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: "#ffffff" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--ink-soft)" }}>
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m20 20-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋景點、店家、活動"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: "var(--ink)" }}
            />
          </div>
        </form>
      </motion.div>

      {/* 4. Event carousel — the festival highlight reel, front and center */}
      {heroSlides.length > 0 ? (
        <div id="event-carousel" className="pt-4 fade-in scroll-mt-6">
          <HeroCarousel slides={heroSlides} initialIndex={initialSlideIndex} compact />
        </div>
      ) : null}

      {/* 4b. Quick actions — bus / spots / businesses / live cams, one tap from home */}
      <div className="grid grid-cols-4 gap-2 safe-page-x pt-4 fade-in">
        {[
          {
            href: "/bus",
            label: "公車資訊",
            icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4.5" y="4" width="15" height="13" rx="3" />
                <path d="M4.5 13.5h15M8.5 17v2.2M15.5 17v2.2" />
                <circle cx="8.5" cy="10" r="0.8" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="10" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            ),
          },
          {
            href: "/spots",
            label: "景點資訊",
            icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
                <circle cx="12" cy="9.5" r="2.2" />
              </svg>
            ),
          },
          {
            href: "/businesses",
            label: "店家資訊",
            icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 9.5h14l-1.1-4h-11.8Z" />
                <path d="M6 9.5v9h12v-9" />
                <path d="M8 9.5v1.2a2 2 0 0 0 4 0V9.5" />
                <path d="M12 9.5v1.2a2 2 0 0 0 4 0V9.5" />
                <path d="M9 18.5v-4h6v4" />
              </svg>
            ),
          },
          {
            href: "/weather",
            label: "直播",
            live: true,
            icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
                <path d="M15.5 10.5 21 7.5v9l-5.5-3Z" />
              </svg>
            ),
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => trackClick("map_card", action.href, action.label, TRACK_TAG)}
            className="relative flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 card-shadow transition-opacity active:opacity-70"
            style={{ background: "var(--card)", borderColor: "var(--line)" }}
          >
            {action.live ? (
              <span
                className="absolute right-1.5 top-1.5 text-[8.5px] font-bold rounded-full px-1.5 py-0.5"
                style={{ background: "var(--festival-gold)", color: "#fff" }}
              >
                LIVE
              </span>
            ) : null}
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}>
              {action.icon}
            </span>
            <span className="text-[11px] font-semibold leading-tight text-center" style={{ color: "var(--ink)" }}>
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* 5. Featured spots — horizontal cards */}
      {visibleSpots.length > 0 ? (
        <div className="pt-5 fade-in">
          <div className="flex items-center justify-between safe-page-x mb-2">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--daxi-red)" }}>
              熱門景點
            </div>
            <Link href="/spots" className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
              查看全部
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto safe-page-x pb-1" style={{ scrollbarWidth: "none" }}>
            {visibleSpots.map((s) => (
              <Link
                key={s.placeId}
                href="/spots"
                onClick={() => trackClick("spot", s.placeId, s.name, TRACK_TAG)}
                className="group relative shrink-0 w-36 h-44 rounded-2xl overflow-hidden card-shadow transition-transform active:scale-[0.98]"
                style={{ background: "var(--card)" }}
              >
                {s.photoSrc ? (
                  <Image
                    src={s.photoSrc}
                    alt={s.name}
                    fill
                    sizes="144px"
                    className="object-cover transition-transform duration-500 group-active:scale-[1.03]"
                    style={{ filter: "saturate(0.9) contrast(0.98)" }}
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 100%)" }}
                  >
                    <PlaceholderIcon kind="景點" />
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.08) 48%, rgba(15,23,42,0.74) 100%)" }}
                />
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <div className="text-[12.5px] font-semibold leading-tight text-white truncate">{s.name}</div>
                  <div className="text-[10.5px] mt-1 truncate" style={{ color: "rgba(255,255,255,0.78)" }}>
                    {s.category}
                  </div>
                  <div className="text-[10px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.92)" }}>
                    步行 {s.walkTime}
                  </div>
                </div>
                {wantsIndoor && s.indoor ? (
                  <span
                    className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9.5px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.92)", color: "var(--river-teal)" }}
                  >
                    室內冷氣
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* 6. Today's coupons */}
      {visibleCoupons.length > 0 ? (
        <div className="pt-5 fade-in">
          <div className="flex items-center justify-between safe-page-x mb-2">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--daxi-red)" }}>
              今日優惠店家
            </div>
            <Link href="/coupons" className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
              查看全部
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 safe-page-x">
            {visibleCoupons.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  trackClick("coupon", c.id, c.title, TRACK_TAG);
                  setOpenCoupon(c);
                }}
                className="relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 card-shadow text-left transition-opacity active:opacity-70"
                style={{ background: "var(--card)", borderColor: "var(--line)" }}
              >
                <span
                  className="absolute inset-y-3 left-0 w-1 rounded-r-full"
                  style={{ background: i % 2 === 0 ? "var(--block-wood)" : "var(--block-moss)" }}
                  aria-hidden
                />
                <span
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: i % 2 === 0 ? "var(--daxi-red-soft)" : "rgba(111,169,155,0.18)",
                    color: i % 2 === 0 ? "var(--daxi-red)" : "var(--status-ok)",
                  }}
                  aria-hidden
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 9.8a2.2 2.2 0 0 0 0-3.6V5.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v.7a2.2 2.2 0 0 0 0 3.6v3.4a2.2 2.2 0 0 0 0 3.6v.7a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-.7a2.2 2.2 0 0 0 0-3.6Z" />
                    <path d="M9.5 5v14" strokeDasharray="1.6 1.8" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold truncate" style={{ color: "var(--ink)" }}>
                    {c.title}
                  </div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                    {c.businessName}
                  </div>
                </div>
                <span className="shrink-0 text-[9.5px] font-medium rounded-full px-2 py-0.5" style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}>
                  掃碼核銷
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {openCoupon ? <CouponRedeemModal coupon={openCoupon} businessName={openCoupon.businessName} onClose={() => setOpenCoupon(null)} /> : null}
    </div>
  );
}
