"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackClick } from "@/lib/trackClient";
import { writeIdentity } from "@/lib/identity";
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

// Tag used only for click-tracking context, not for reordering content
// anymore — "我是大溪人" now navigates to the separate /resident section
// (see IdentityGate) rather than re-sorting this page in place.
const TRACK_TAG = "tourist";

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
  const [query, setQuery] = useState("");
  const [openCoupon, setOpenCoupon] = useState<CouponWithBusiness | null>(null);
  const [switching, setSwitching] = useState(false);

  const goResident = () => {
    setSwitching(true);
    writeIdentity("resident");
    router.push("/resident");
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "夜深了";
    if (hour < 11) return "早安";
    if (hour < 14) return "午安";
    if (hour < 18) return "下午好";
    return "晚安";
  }, []);

  const visibleSpots = useMemo(
    () => [...spots].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 8),
    [spots]
  );
  const visibleCoupons = useMemo(() => coupons.slice(0, 6), [coupons]);

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
      <div
        className="safe-page-x pt-6 pb-5 fade-in"
        style={{
          background: "linear-gradient(160deg, rgba(215,160,107,0.94) 0%, rgba(184,129,76,0.92) 100%)",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          boxShadow: "var(--shadow-float)",
        }}
      >
        {/* 1. Greeting + town name + notification bell */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px]" style={{ color: "rgba(43,36,32,0.7)" }}>
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 0 1.5px rgba(255,255,255,0.9)" }} aria-hidden />
            ) : null}
          </Link>
        </div>

        {/* 2. Identity switcher — 我是遊客 stays here; 我是大溪人 leaves for
            the separate /resident section entirely (different nav, different
            content), not just a re-sort of this page. */}
        <div className="pt-4">
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
          onClick={() => trackClick("map_card", "map", "地圖導覽", TRACK_TAG)}
          className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 card-shadow transition-opacity active:opacity-70"
          style={{ background: "var(--card)", borderColor: "var(--line)" }}
        >
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5.2 4.5 6.9v12.4L9 17.6l6 2.5 4.5-1.7V6l-4.5 1.7-6-2.5Z" />
              <path d="M9 5.2v12.4M15 7.7V20" />
            </svg>
          </span>
          <span className="flex-1">
            <span className="block text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
              地圖導覽
            </span>
            <span className="block text-[11.5px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
              景點與停車位置一覽
            </span>
          </span>
          <span className="shrink-0 text-[10px] font-medium rounded-full px-2.5 py-1" style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}>
            支援離線快取
          </span>
        </Link>
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
