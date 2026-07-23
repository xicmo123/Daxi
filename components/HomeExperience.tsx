"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackClick } from "@/lib/trackClient";
import type { CouponWithBusiness } from "./CouponList";
import CouponRedeemModal from "./CouponRedeemModal";
import PlaceholderIcon from "./PlaceholderIcon";

export type FeedSpot = {
  placeId: string;
  name: string;
  category: string;
  walkTime: string;
  distanceMeters: number;
  featured: boolean;
  photoSrc?: string;
};

export type HomeMode = "explore" | "local";

const MODE_STORAGE_KEY = "daxi-home-mode";

function sortSpots(spots: FeedSpot[], mode: HomeMode): FeedSpot[] {
  if (mode === "local") {
    return [...spots].sort((a, b) => a.distanceMeters - b.distanceMeters);
  }
  return [...spots].sort((a, b) => Number(b.featured) - Number(a.featured));
}

function sortCoupons(coupons: CouponWithBusiness[], mode: HomeMode): CouponWithBusiness[] {
  if (mode === "local") {
    return [...coupons].sort((a, b) => a.businessName.localeCompare(b.businessName, "zh-Hant"));
  }
  return coupons;
}

export default function HomeExperience({
  townName,
  hasRecentAnnouncement,
  spots,
  coupons,
}: {
  townName: string;
  hasRecentAnnouncement: boolean;
  spots: FeedSpot[];
  coupons: CouponWithBusiness[];
}) {
  const router = useRouter();
  // Server-rendered HTML always starts on "explore" — reading localStorage
  // synchronously here (rather than via an effect) avoids a render just to
  // restore last session's choice, at the cost of not restoring it before
  // the first paint. Good enough for a session-scoped preference.
  const [mode, setMode] = useState<HomeMode>("explore");
  const [query, setQuery] = useState("");
  const [openCoupon, setOpenCoupon] = useState<CouponWithBusiness | null>(null);

  const setModeAndPersist = (next: HomeMode) => {
    setMode(next);
    window.localStorage.setItem(MODE_STORAGE_KEY, next);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "夜深了";
    if (hour < 11) return "早安";
    if (hour < 14) return "午安";
    if (hour < 18) return "下午好";
    return "晚安";
  }, []);

  const visibleSpots = useMemo(() => sortSpots(spots, mode).slice(0, 8), [spots, mode]);
  const visibleCoupons = useMemo(() => sortCoupons(coupons, mode).slice(0, 6), [coupons, mode]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    trackClick("map_card", "search", q, mode);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div>
      {/* Hero color-block banner: greeting/bell + mode toggle + search all
          sit on one solid coral panel, chicTrip-style, instead of blending
          into the page background. */}
      <div
        className="safe-page-x pt-6 pb-5 fade-in"
        style={{
          background: "linear-gradient(160deg, var(--block-coral) 0%, var(--block-coral-deep) 100%)",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        {/* 1. Greeting + town name + notification bell */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.8)" }}>
              {greeting}
            </div>
            <div className="text-[18px] font-bold" style={{ color: "var(--block-fg)" }}>
              {townName}
            </div>
          </div>
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#fff" }} aria-hidden />
            ) : null}
          </Link>
        </div>

        {/* 2. Explore / Local mode toggle */}
        <div className="pt-4">
          <div className="inline-flex p-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
            {([
              { value: "explore" as const, label: "探索模式" },
              { value: "local" as const, label: "在地模式" },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setModeAndPersist(opt.value)}
                className="px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
                style={{
                  background: mode === opt.value ? "#ffffff" : "transparent",
                  color: mode === opt.value ? "var(--block-coral-deep)" : "rgba(255,255,255,0.9)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Search bar */}
        <form onSubmit={onSearch} className="pt-3">
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
      </div>

      {/* 4. Map nav card — solid teal block */}
      <div className="safe-page-x pt-4 fade-in">
        <Link
          href="/parking"
          onClick={() => trackClick("map_card", "map", "地圖導覽", mode)}
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 card-shadow transition-opacity active:opacity-70"
          style={{ background: "linear-gradient(135deg, var(--block-teal) 0%, var(--block-teal-deep) 100%)" }}
        >
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)", color: "var(--block-fg)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5.2 4.5 6.9v12.4L9 17.6l6 2.5 4.5-1.7V6l-4.5 1.7-6-2.5Z" />
              <path d="M9 5.2v12.4M15 7.7V20" />
            </svg>
          </span>
          <span className="flex-1">
            <span className="block text-[13px] font-medium" style={{ color: "var(--block-fg)" }}>
              地圖導覽
            </span>
            <span className="block text-[11.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>
              景點與停車位置一覽
            </span>
          </span>
          <span className="shrink-0 text-[10px] font-medium rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,0.2)", color: "var(--block-fg)" }}>
            支援離線快取
          </span>
        </Link>
      </div>

      {/* 5. Featured spots — horizontal cards, reordered by mode */}
      {visibleSpots.length > 0 ? (
        <div className="pt-5 fade-in">
          <div className="flex items-center justify-between safe-page-x mb-2">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--daxi-red)" }}>
              {mode === "explore" ? "熱門景點" : "順路景點"}
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
                onClick={() => trackClick("spot", s.placeId, s.name, mode)}
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
                  style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0.15) 45%, rgba(15,23,42,0.88) 100%)" }}
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
                  trackClick("coupon", c.id, c.title, mode);
                  setOpenCoupon(c);
                }}
                className="flex items-center gap-3 rounded-2xl px-3.5 py-3 card-shadow text-left transition-opacity active:opacity-70"
                style={{
                  background:
                    i % 2 === 0
                      ? "linear-gradient(135deg, var(--block-coral) 0%, var(--block-coral-deep) 100%)"
                      : "linear-gradient(135deg, var(--block-gold) 0%, var(--block-gold-deep) 100%)",
                }}
              >
                <span
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.22)", color: "var(--block-fg)" }}
                  aria-hidden
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 9.8a2.2 2.2 0 0 0 0-3.6V5.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v.7a2.2 2.2 0 0 0 0 3.6v3.4a2.2 2.2 0 0 0 0 3.6v.7a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-.7a2.2 2.2 0 0 0 0-3.6Z" />
                    <path d="M9.5 5v14" strokeDasharray="1.6 1.8" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold truncate" style={{ color: "var(--block-fg)" }}>
                    {c.title}
                  </div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.82)" }}>
                    {c.businessName}
                  </div>
                </div>
                <span className="shrink-0 text-[9.5px] font-medium rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.22)", color: "var(--block-fg)" }}>
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
