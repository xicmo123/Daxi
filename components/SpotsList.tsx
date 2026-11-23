"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import { categoryLabel, type PlaceDetail } from "@/lib/placeDetails";
import type { LiveParkingLot } from "@/lib/tycgParking";
import type { Coupon } from "@/lib/coupons";
import { experienceTags, type SuggestedRoute } from "@/lib/experience";
import { calculateDistance, formatDistance } from "@/lib/geo";
import { useUserLocation } from "@/lib/useUserLocation";
import { placeHref, quickLookClick } from "@/lib/placePages";
import BusinessDetailModal from "./BusinessDetailModal";
import PlaceholderIcon from "./PlaceholderIcon";
import EmptyState from "./EmptyState";
import styles from "./TouristInterior.module.css";

function withUserDistance(business: Business, location: ReturnType<typeof useUserLocation>): Business {
  if (!location) return business;
  const distanceMeters = calculateDistance(location.lat, location.lng, business.lat, business.lng);
  return { ...business, distanceMeters, distanceLabel: formatDistance(distanceMeters) };
}

export default function SpotsList({
  spots,
  featuredSpots,
  allBusinesses,
  photos,
  details,
  lots = [],
  routes = [],
  coupons = [],
}: {
  spots: Business[];
  featuredSpots?: Business[];
  allBusinesses: Business[];
  photos: Record<string, PhotoCredit>;
  details: Record<string, PlaceDetail>;
  lots?: LiveParkingLot[];
  routes?: SuggestedRoute[];
  coupons?: Coupon[];
}) {
  const searchParams = useSearchParams();
  const requestedPlaceId = searchParams.get("place");
  const [openBusiness, setOpenBusiness] = useState<Business | null>(() => spots.find((spot) => spot.placeId === requestedPlaceId) ?? null);
  const userLocation = useUserLocation();
  const locatedSpots = useMemo(() => spots.map((spot) => withUserDistance(spot, userLocation)), [spots, userLocation]);
  const locatedFeaturedSpots = useMemo(() => (featuredSpots ?? []).map((spot) => withUserDistance(spot, userLocation)), [featuredSpots, userLocation]);
  const locatedAllBusinesses = useMemo(() => allBusinesses.map((business) => withUserDistance(business, userLocation)), [allBusinesses, userLocation]);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const rows = normalizedQuery
    ? locatedSpots.filter((s) => {
        const detail = details[s.placeId];
        return [s.name, s.address, detail?.category, detail?.story, ...(detail?.tags ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
    : locatedSpots;

  const placeCard = (spot: Business, featured = false) => {
    const photo = photos[spot.placeId];
    const detail = details[spot.placeId];
    const tags = experienceTags(spot, detail).filter((tag) => !tag.startsWith("步行")).slice(0, 2);
    return (
      <Link
        key={spot.placeId}
        href={placeHref(spot)}
        onClick={quickLookClick(() => setOpenBusiness(spot))}
        className={featured ? `${styles.placeCard} ${styles.featuredSpot}` : styles.placeCard}
      >
        <div className={styles.placePhoto}>
          {photo ? (
            <Image src={photo.src} alt="" fill sizes="(max-width: 767px) 92vw, (max-width: 1023px) 48vw, 350px" />
          ) : <PlaceholderIcon kind="景點" />}
        </div>
        <div className={styles.placeBody}>
          <h3>{spot.name}</h3>
          <p>{categoryLabel(detail?.category, spot.googleType, spot.tag)} · {userLocation ? "距你" : "距老街"} {spot.distanceLabel}</p>
          {tags.length ? <div className={styles.placeTags}>{tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
        </div>
      </Link>
    );
  };

  return (
    <div>
      {locatedFeaturedSpots.length ? (
        <section className="safe-page-x pb-6" aria-labelledby="featured-spots">
          <h2 className={styles.sectionTitle} id="featured-spots">精選景點</h2>
          <div className={styles.featuredRail}>{locatedFeaturedSpots.map((spot) => placeCard(spot, true))}</div>
        </section>
      ) : null}

      {routes.length > 0 ? (
        <div className="safe-page-x pt-1 pb-5 fade-in flex flex-col gap-3">
          <div className="text-app-label font-normal tracking-[0.2em] uppercase" style={{ color: "var(--ink-soft)" }}>
            建議路線
          </div>
          {routes.map((r) => (
            <div key={r.id} className="rounded-2xl border px-4 py-3.5" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
              <div className="text-app-body font-bold" style={{ color: "var(--ink)" }}>
                {r.title}
              </div>
              <div className="text-app-label mt-0.5" style={{ color: "var(--ink-soft)" }}>
                {r.desc}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {r.stops.map((stop, index) => {
                  const place = locatedAllBusinesses.find((candidate) => candidate.placeId === stop.placeId);
                  const classes = "rounded-full px-2.5 py-1 text-app-label font-medium";
                  const style = { background: "var(--paper-2)", color: "var(--ink)" };
                  return (
                    <span key={stop.placeId} className="flex items-center gap-1.5">
                      {place ? (
                        <button type="button" className={`${classes} min-h-9 cursor-pointer underline underline-offset-2`}
                          style={style} onClick={() => setOpenBusiness(place)}>{stop.name}</button>
                      ) : <span className={classes} style={style}>{stop.name}</span>}
                      {index < r.stops.length - 1 ? <span aria-hidden>→</span> : null}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="safe-page-x pt-2 pb-4 fade-in">
        <h2 className={styles.sectionTitle}>全部景點</h2>
      </div>

      <div className="safe-page-x pb-4 fade-in">
        <label
          className="flex items-center gap-3 rounded-full px-4 py-3"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            aria-label="搜尋景點"
            placeholder="搜尋景點、地址或分類"
            className="min-w-0 flex-1 bg-transparent text-app-body font-medium outline-none"
            style={{ color: "var(--ink)" }}
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--daxi-red)" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
        </label>

        <div className="pt-5 text-app-body font-semibold" style={{ color: "var(--ink-soft)" }}>
          共 {rows.length} 個景點
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 safe-page-x pb-10 fade-in md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((spot) => placeCard(spot))}
        {rows.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              variant="mascot"
              title="找不到符合的景點"
              subtitle="換個關鍵字試試"
            />
          </div>
        ) : null}
      </div>

      {openBusiness ? (
        <BusinessDetailModal
          business={openBusiness}
          photo={photos[openBusiness.placeId]}
          detail={details[openBusiness.placeId]}
          allBusinesses={locatedAllBusinesses}
          photos={photos}
          lots={lots}
          coupons={coupons}
          onSelect={setOpenBusiness}
          onClose={() => setOpenBusiness(null)}
        />
      ) : null}
    </div>
  );
}
