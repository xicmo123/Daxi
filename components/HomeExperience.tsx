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

type TouristQuickActionKind = "bus" | "spot" | "store" | "live";

function QuickActionIllustration({ kind }: { kind: TouristQuickActionKind }) {
  if (kind === "bus") {
    return (
      <svg viewBox="0 0 180 132" aria-hidden="true" className="absolute bottom-0 right-0 h-[48px] w-[62px] opacity-90 md:h-[66px] md:w-[84px]">
        <path d="M16 104c21-34 39-52 64-54 31-3 55 19 84-18" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="8" strokeLinecap="round" />
        <path d="M24 110h124" stroke="rgba(43,36,32,0.18)" strokeWidth="5" strokeLinecap="round" />
        <rect x="50" y="38" width="90" height="52" rx="17" fill="rgba(255,255,255,0.9)" />
        <path d="M63 54h26M101 54h25" stroke="#4a7594" strokeWidth="10" strokeLinecap="round" />
        <path d="M66 74h58" stroke="#2b2420" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />
        <circle cx="72" cy="91" r="10" fill="#2b2420" />
        <circle cx="119" cy="91" r="10" fill="#2b2420" />
        <circle cx="72" cy="91" r="4" fill="#d7a06b" />
        <circle cx="119" cy="91" r="4" fill="#d7a06b" />
      </svg>
    );
  }

  if (kind === "spot") {
    return (
      <svg viewBox="0 0 120 88" aria-hidden="true" className="absolute bottom-0 right-0 h-[46px] w-[66px] opacity-90 md:h-[62px] md:w-[88px]">
        <path d="M8 72 39 38l18 18 16-24 39 40Z" fill="rgba(255,255,255,0.72)" />
        <path d="m8 72 31-34 18 18 16-24 39 40" fill="none" stroke="#4f8478" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="92" cy="23" r="9" fill="rgba(255,255,255,0.72)" />
        <path d="M92 17v12M86 23h12" stroke="#b8814c" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "store") {
    return (
      <svg viewBox="0 0 120 84" aria-hidden="true" className="absolute bottom-0 right-0 h-[46px] w-[66px] opacity-90 md:h-[60px] md:w-[88px]">
        <path d="M15 35h90l-7-18H22Z" fill="rgba(255,255,255,0.84)" />
        <path d="M17 35v36h86V35" fill="rgba(255,255,255,0.46)" />
        <path d="M17 35v7a10 10 0 0 0 20 0v-7a10 10 0 0 0 20 0v-7a10 10 0 0 0 20 0v7a10 10 0 0 0 20 0v-7" fill="none" stroke="#4a7594" strokeWidth="5" />
        <path d="M49 71V51h22v20M28 50h10M82 50h10" fill="none" stroke="#2b2420" strokeOpacity="0.28" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 78" aria-hidden="true" className="absolute bottom-0 right-0 h-[44px] w-[68px] opacity-95 md:h-[58px] md:w-[88px]">
      <path d="M10 58c22-18 40-24 58-18 18 7 28 2 42-14" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="7" strokeLinecap="round" />
      <rect x="34" y="22" width="47" height="31" rx="9" fill="rgba(255,255,255,0.88)" />
      <path d="m81 32 23-10v31L81 43Z" fill="rgba(255,255,255,0.7)" />
      <circle cx="55" cy="38" r="9" fill="#2b2420" fillOpacity="0.18" />
      <circle cx="55" cy="38" r="4" fill="#4a7594" />
      <path d="M44 58h31" stroke="rgba(43,36,32,0.2)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function QuickActionArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

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
  const visibleSpots = useMemo(() => spots.slice(0, 8), [spots]);
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

      {/* 4b. Tourist priority actions use the same visual language as the resident home cards. */}
      <section className="safe-page-x pt-4 fade-in" aria-labelledby="tourist-priority-title">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--block-wood-deep)" }}>
              旅遊動線
            </div>
            <h2 id="tourist-priority-title" className="text-[15px] font-black leading-tight" style={{ color: "var(--ink)" }}>
              出發前先看
            </h2>
          </div>
          <span className="text-[11px] font-semibold" style={{ color: "var(--ink-soft)" }}>
            快速資訊
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 md:gap-2.5">
          {[
            {
              href: "/bus",
              label: "公車資訊",
              title: "公車在哪",
              detail: "位置 / 時刻",
              kind: "bus" as const,
              background: "linear-gradient(140deg, var(--block-river) 0%, var(--block-moss) 100%)",
            },
            {
              href: "/spots",
              label: "景點資訊",
              title: "景點去哪裡",
              detail: "熱門 / 地圖",
              kind: "spot" as const,
              background: "linear-gradient(145deg, var(--block-moss) 0%, var(--block-wood) 100%)",
            },
            {
              href: "/businesses",
              label: "店家資訊",
              title: "吃喝買什麼",
              detail: "在地店家 / 優惠",
              kind: "store" as const,
              background: "linear-gradient(140deg, var(--block-wood) 0%, var(--block-river) 100%)",
            },
            {
              href: "/weather",
              label: "即時影像",
              title: "先看路況",
              detail: "CCTV / 景點",
              kind: "live" as const,
              live: true,
              background: "linear-gradient(140deg, var(--block-river) 0%, var(--block-wood) 100%)",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => trackClick("map_card", action.href, action.label, TRACK_TAG)}
              className="group relative block h-[112px] min-w-0 overflow-hidden rounded-[16px] px-1.5 py-2 transition-transform active:scale-[0.98] md:h-[138px] md:rounded-[20px] md:px-2.5 md:py-3"
              style={{ background: action.background, boxShadow: "var(--shadow-float)", color: "var(--block-fg)" }}
            >
              <QuickActionIllustration kind={action.kind} />
              <div className="relative z-10 flex h-full flex-col justify-between gap-2">
                <div className="min-w-0">
                  <div className="mb-1 inline-flex max-w-full items-center rounded-full px-1.5 py-0.5 text-[8.5px] font-bold md:mb-1.5 md:px-2 md:text-[10px]" style={{ background: "rgba(255,255,255,0.5)" }}>
                    {action.label}
                  </div>
                  <div className="truncate text-[12px] font-black leading-tight md:text-[15px]">{action.title}</div>
                </div>
                <div className="flex items-center justify-between gap-1 text-[8.5px] font-bold md:gap-1.5 md:text-[10.5px]">
                  <span className="min-w-0 truncate leading-tight">{action.detail}</span>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1 md:h-6 md:w-6" style={{ background: "rgba(255,255,255,0.42)" }}>
                    <QuickActionArrow />
                  </span>
                </div>
              </div>
              {action.live ? (
                <span
                  className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold"
                  style={{ background: "rgba(255,255,255,0.72)", color: "var(--daxi-red)" }}
                >
                  LIVE
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

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
