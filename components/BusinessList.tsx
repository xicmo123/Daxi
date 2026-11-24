"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { businessGroupOf, categoryLabel, type BusinessBrowseGroup as Group, type PlaceDetail } from "@/lib/placeDetails";
import type { LiveParkingLot } from "@/lib/tycgParking";
import type { Coupon } from "@/lib/coupons";
import { experienceTags } from "@/lib/experience";
import { calculateDistance, formatDistance } from "@/lib/geo";
import { useUserLocation } from "@/lib/useUserLocation";
import { placeHref, quickLookClick, shortPlaceName } from "@/lib/placePages";
import { openStatus, priceLabel, type PlaceHours } from "@/lib/openingHours";
import BusinessDetailModal from "./BusinessDetailModal";
import styles from "./BusinessList.module.css";

// Shop categories as people browse them, not as Google types them.
const GROUPS: Group[] = ["豆干小吃", "餐廳", "咖啡甜點", "市場超市", "購物"];
const FOOD_GROUPS = new Set<Group>(["豆干小吃", "餐廳", "咖啡甜點"]);

const ICON: Record<Group | "全部", ReactNode> = {
  全部: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.3" />
      <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.3" />
      <rect x="4.5" y="13" width="6.5" height="6.5" rx="1.3" />
      <rect x="13" y="13" width="6.5" height="6.5" rx="1.3" />
    </svg>
  ),
  豆干小吃: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 12.2h13a6.5 6.5 0 0 1-13 0Z" />
      <path d="M8.2 18.7h7.6" />
      <path d="M7.3 9.2 16.8 4" />
      <path d="M10.1 9.2 19.5 4" />
    </svg>
  ),
  餐廳: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5v7.5M4.5 3.5v4.5a2.5 2.5 0 0 0 5 0V3.5M7 11v9.5" />
      <path d="M17 20.5V3.5c-2 1.2-3 3.6-3 6.5v3.5h3" />
    </svg>
  ),
  咖啡甜點: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9.5h11v4.5a5.5 5.5 0 0 1-11 0V9.5Z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8.5 3.5c-.8 1 .8 2-.1 3.2M12 3.5c-.8 1 .8 2-.1 3.2" />
    </svg>
  ),
  市場超市: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 9.5 6 4.5h12l1.5 5" />
      <path d="M4.5 9.5v9.8h15V9.5" />
      <path d="M4.5 9.5a2.6 2.6 0 0 0 5 1.3 2.6 2.6 0 0 0 5 0 2.6 2.6 0 0 0 5-1.3" />
      <path d="M10 19.3v-5.5h4v5.5" />
    </svg>
  ),
  購物: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 8h13l-1 12h-11l-1-12Z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </svg>
  ),
};

// Tinted tiles for shops without a photo, one hue per category.
const TILE: Record<Group, CSSProperties> = {
  豆干小吃: { ["--tile-bg" as string]: "#f6e7d3", ["--tile-ink" as string]: "#8a5a2b" },
  餐廳: { ["--tile-bg" as string]: "#f3e1dc", ["--tile-ink" as string]: "#93453a" },
  咖啡甜點: { ["--tile-bg" as string]: "#efe6dc", ["--tile-ink" as string]: "#6b4e37" },
  市場超市: { ["--tile-bg" as string]: "#e2ede4", ["--tile-ink" as string]: "#3f6b4b" },
  購物: { ["--tile-bg" as string]: "#e3e8f1", ["--tile-ink" as string]: "#45577a" },
};

type SortKey = "recommended" | "rating" | "distance";
const SORTS: { label: string; value: SortKey }[] = [
  { label: "推薦", value: "recommended" },
  { label: "評分", value: "rating" },
  { label: "距離", value: "distance" },
];

function withUserDistance(business: Business, location: ReturnType<typeof useUserLocation>): Business {
  if (!location) return business;
  const distanceMeters = calculateDistance(location.lat, location.lng, business.lat, business.lng);
  return { ...business, distanceMeters, distanceLabel: formatDistance(distanceMeters) };
}

// Recommended order: a review-weighted rating, so 4.8 from 12 reviews doesn't
// outrank 4.4 from 10,000 (the usual Bayesian average, prior 4.0 × 50).
function score(b: Business): number {
  const r = b.rating ?? 0;
  const n = b.reviewCount ?? 0;
  return (r * n + 4.0 * 50) / (n + 50);
}

function reviews(n: number): string {
  return n >= 10000 ? `${(n / 10000).toFixed(1)} 萬` : n.toLocaleString();
}

export default function BusinessList({
  businesses,
  photos,
  details,
  lots = [],
  couponPlaceIds = [],
  coupons = [],
  hours = {},
}: {
  hours?: Record<string, PlaceHours>;
  businesses: Business[];
  photos: Record<string, PhotoCredit>;
  details: Record<string, PlaceDetail>;
  lots?: LiveParkingLot[];
  couponPlaceIds?: string[];
  coupons?: Coupon[];
}) {
  const searchParams = useSearchParams();
  const userLocation = useUserLocation();
  const requestedPlaceId = searchParams.get("place");
  const initialCat = searchParams.get("cat");
  const [group, setGroup] = useState<Group | "全部" | "美食">(
    initialCat === "美食" ? initialCat : GROUPS.find((g) => g === initialCat) ?? "全部",
  );
  const [query, setQuery] = useState("");
  const [dealsOnly, setDealsOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [openBusiness, setOpenBusiness] = useState<Business | null>(() => businesses.find((b) => b.placeId === requestedPlaceId) ?? null);

  const deals = useMemo(() => new Set(couponPlaceIds), [couponPlaceIds]);
  const located = useMemo(() => businesses.map((b) => withUserDistance(b, userLocation)), [businesses, userLocation]);
  const groups = useMemo(() => new Map(located.map((b) => [b.placeId, businessGroupOf(b)])), [located]);
  const counts = useMemo(() => {
    const c = new Map<Group, number>();
    for (const g of groups.values()) c.set(g, (c.get(g) ?? 0) + 1);
    return c;
  }, [groups]);
  const foodCount = Array.from(FOOD_GROUPS).reduce((total, foodGroup) => total + (counts.get(foodGroup) ?? 0), 0);

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const list = located.filter((b) => {
      const businessGroup = groups.get(b.placeId);
      if (group === "美食" && (!businessGroup || !FOOD_GROUPS.has(businessGroup))) return false;
      if (group !== "全部" && group !== "美食" && businessGroup !== group) return false;
      if (dealsOnly && !deals.has(b.placeId)) return false;
      if (topRated && (b.rating ?? 0) < 4.5) return false;
      if (openNow && !openStatus(hours[b.placeId])?.open) return false;
      if (q) {
        const d = details[b.placeId];
        const hay = `${b.name} ${d?.category ?? ""} ${categoryLabel(d?.category, b.googleType, b.tag)} ${b.address ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "rating") return list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || b.reviewCount - a.reviewCount);
    if (sort === "distance") return list.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return list.sort((a, b) => Number(Boolean(photos[b.placeId])) - Number(Boolean(photos[a.placeId])) || score(b) - score(a));
  }, [located, group, groups, dealsOnly, deals, topRated, openNow, hours, q, details, sort, photos]);

  // Editor's picks: hand-picked first, then shops with a written story or a
  // coupon — only when browsing everything, so filters show plain results.
  const picks = useMemo(() => {
    if (group !== "全部" || q || dealsOnly || topRated || openNow) return [];
    return located
      .filter((b) => details[b.placeId]?.featured || details[b.placeId]?.story || deals.has(b.placeId))
      .sort((a, b) => Number(Boolean(details[b.placeId]?.featured)) - Number(Boolean(details[a.placeId]?.featured)) || score(b) - score(a))
      .slice(0, 8);
  }, [located, details, deals, group, q, dealsOnly, topRated, openNow]);

  const resetFilters = () => {
    setGroup("全部");
    setQuery("");
    setDealsOnly(false);
    setTopRated(false);
    setOpenNow(false);
  };

  const card = (b: Business, wide = false) => {
    const photo = photos[b.placeId];
    const detail = details[b.placeId];
    const g = groups.get(b.placeId) ?? "餐廳";
    const category = categoryLabel(detail?.category, b.googleType, b.tag);
    const live = detail?.liveStatus;
    const tags = experienceTags(b, detail).filter((t) => !t.startsWith("步行")).slice(0, 2);
    const open = openStatus(hours[b.placeId]);
    const price = priceLabel(hours[b.placeId]);
    const walk = b.distanceMeters <= 450 ? "步行 5 分" : b.distanceMeters <= 900 ? "步行 10 分" : null;
    const status = live?.soldOut
      ? { text: "今日完售", tone: "alert" }
      : live?.queueStatus
        ? { text: live.queueStatus, tone: live.queueStatus === "免排隊" ? "ok" : "alert" }
        : live?.queueMinutes
          ? { text: `需等 ${live.queueMinutes} 分`, tone: "alert" }
          : null;

    return (
      <Link key={b.placeId} href={placeHref(b)} onClick={quickLookClick(() => setOpenBusiness(b))} className={styles.card}>
        <div className={styles.photo} style={wide ? { aspectRatio: "16 / 10" } : undefined}>
          {photo ? (
            <Image src={photo.src} alt={shortPlaceName(b.name)} fill sizes={wide ? "320px" : "(max-width: 767px) 46vw, (max-width: 1179px) 31vw, 300px"} />
          ) : (
            <div className={styles.noPhoto} style={TILE[g]} aria-hidden>
              {ICON[g]}
              <b>{category}</b>
            </div>
          )}
          <div className={styles.badges}>
            <span>{deals.has(b.placeId) ? <span className={styles.badge} data-tone="deal">優惠券</span> : null}</span>
            <span style={{ display: "flex", gap: 6 }}>
              {status ? (
                <span className={styles.badge} data-tone={status.tone}>
                  {status.text}
                </span>
              ) : null}
              {detail?.acceptsLuggage ? (
                <span className={styles.badge} title="可寄放伴手禮">
                  可寄放
                </span>
              ) : null}
            </span>
          </div>
        </div>
        <div className={styles.body}>
          <h3 className={styles.name}>{shortPlaceName(b.name)}</h3>
          <div className={styles.meta}>
            {b.rating !== null && b.reviewCount > 0 ? (
              <>
                <span className={styles.star} aria-hidden>
                  ★
                </span>
                <span className={styles.rating}>{b.rating.toFixed(1)}</span>
                <span>({reviews(b.reviewCount)})</span>
                <span className={styles.dot} aria-hidden />
              </>
            ) : null}
            <span>{category}</span>
            {price ? (
              <>
                <span className={styles.dot} aria-hidden />
                <span>{price.replace("均消 ", "")}</span>
              </>
            ) : null}
          </div>
          {open ? (
            <div className={styles.open} data-tone={open.tone}>
              {open.label}
            </div>
          ) : null}
          <div className={styles.meta}>
            <span>
              {userLocation ? "距你" : "距老街"} {b.distanceLabel}
            </span>
            {walk && !userLocation ? (
              <>
                <span className={styles.dot} aria-hidden />
                <span>{walk}</span>
              </>
            ) : null}
          </div>
          {wide && detail?.story ? <p className={styles.lead}>{detail.story}</p> : null}
          {tags.length > 0 ? (
            <div className={styles.tags}>
              {tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
    );
  };

  return (
    <div className="safe-page-x pb-8">
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜尋店名，例如：豆干、豆花、咖啡" aria-label="搜尋店家" />
        </label>

        <div className={styles.chips} role="group" aria-label="店家分類">
          {(["全部", "美食", ...GROUPS] as const)
            .filter((g) => g === "全部" || (g === "美食" ? foodCount > 0 : (counts.get(g) ?? 0) > 0))
            .map((g) => (
              <button key={g} type="button" className={styles.chip} aria-pressed={group === g} onClick={() => setGroup(g)}>
                <span style={{ width: 17, height: 17, display: "inline-flex" }}>{ICON[g === "美食" ? "餐廳" : g]}</span>
                {g}
                <small>{g === "全部" ? located.length : g === "美食" ? foodCount : counts.get(g)}</small>
              </button>
            ))}
        </div>

        <div className={styles.filterRow}>
          <div className={styles.toggles}>
            <button type="button" className={styles.toggle} aria-pressed={openNow} onClick={() => setOpenNow((v) => !v)}>
              營業中
            </button>
            {deals.size > 0 ? (
              <button type="button" className={styles.toggle} aria-pressed={dealsOnly} onClick={() => setDealsOnly((v) => !v)}>
                有優惠券
              </button>
            ) : null}
            <button type="button" className={styles.toggle} aria-pressed={topRated} onClick={() => setTopRated((v) => !v)}>
              ★ 4.5 以上
            </button>
          </div>
          <div className={styles.sort} role="group" aria-label="排序">
            {SORTS.map((s) => (
              <button key={s.value} type="button" aria-pressed={sort === s.value} onClick={() => setSort(s.value)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {picks.length > 0 ? (
        <section style={{ marginTop: 26 }} aria-labelledby="biz-picks">
          <div className={styles.sectionHead}>
            <h2 id="biz-picks">編輯推薦</h2>
            <span>店家故事・優惠</span>
          </div>
          <div className={styles.rail}>{picks.map((b) => card(b, true))}</div>
        </section>
      ) : null}

      <section style={{ marginTop: 30 }} aria-labelledby="biz-all">
        <div className={styles.sectionHead}>
          <h2 id="biz-all">{group === "全部" ? "所有店家" : group}</h2>
          <span>共 {rows.length} 家</span>
        </div>
        {rows.length === 0 ? (
          <div className={styles.empty}>
            沒有符合條件的店家
            <br />
            <button type="button" onClick={resetFilters}>
              清除篩選
            </button>
          </div>
        ) : (
          <div className={styles.grid}>{rows.map((b) => card(b))}</div>
        )}
      </section>

      {openBusiness ? (
        <BusinessDetailModal
          business={openBusiness}
          photo={photos[openBusiness.placeId]}
          detail={details[openBusiness.placeId]}
          allDetails={details}
          allBusinesses={located}
          photos={photos}
          lots={lots}
          couponPlaceIds={couponPlaceIds}
          coupons={coupons}
          onSelect={setOpenBusiness}
          onClose={() => setOpenBusiness(null)}
        />
      ) : null}
    </div>
  );
}
