import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import ExploreTabs from "@/components/ExploreTabs";
import TouristPageHeader from "@/components/TouristPageHeader";
import SpotsList from "@/components/SpotsList";
import styles from "@/components/TouristGuide.module.css";
import { getAllPlaces, readPhotos, readDetails, filterVisiblePlaces } from "@/lib/placesStore";
import type { LiveParkingLot } from "@/lib/tycgParking";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrapper is immune to it. See lib/cachedSources.ts.
import { getCachedParking } from "@/lib/cachedSources";
import { buildSuggestedRoutes } from "@/lib/experience";
import { listActiveCoupons } from "@/lib/coupons";
import { daxiWalkHref, daxiWalkTitle, daxiWalkVisitTime } from "@/lib/daxiWalk";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/spots",
  title: "大溪景點",
  description: "大溪老街周邊景點一次看：大溪橋、普濟堂、武德殿、中正公園與石門水庫，含步行距離、順路主題路線與無障礙資訊。",
});

export default async function SpotsPage() {
  const [rawPlaces, photos, details] = await Promise.all([
    getAllPlaces(),
    readPhotos(),
    readDetails(),
  ]);
  const allPlaces = filterVisiblePlaces(rawPlaces, details);
  const spots = allPlaces.filter((b) => b.tag === "景點");
  const featuredSpots = spots.filter((b) => details[b.placeId]?.featured);
  const creditedSpots = spots.filter((b) => photos[b.placeId]?.author);
  const routes = buildSuggestedRoutes(allPlaces, details);

  let lots: LiveParkingLot[] = [];
  try {
    lots = await getCachedParking();
  } catch {
    lots = [];
  }

  let coupons: Awaited<ReturnType<typeof listActiveCoupons>> = [];
  try {
    coupons = await listActiveCoupons();
  } catch {
    coupons = [];
  }

  return (
    <div>
      <TouristPageHeader title="探索大溪景點" subtitle="從老街、木藝展館，到大漢溪畔的步道。" photo={photos["custom-tycg-414"]} />
      <ExploreTabs />

      <div className="safe-page-x pb-4">
        <Link className={styles.routeEntry} href={daxiWalkHref}>
          <span><strong>{daxiWalkTitle}</strong><small>4 站步行導覽 · {daxiWalkVisitTime}</small></span>
          <span aria-hidden>→</span>
        </Link>
      </div>
      <SpotsList spots={spots} featuredSpots={featuredSpots} allBusinesses={allPlaces} photos={photos} details={details} lots={lots} routes={routes} coupons={coupons} />

      {creditedSpots.length > 0 ? (
        <div className="safe-page-x pb-10 text-app-label leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          景點圖片來源：Wikimedia Commons（CC BY-SA）／桃園市政府觀光旅遊局，攝影：
          <>
            {creditedSpots.map((b, i) => (
              <span key={b.placeId}>
                {i > 0 ? "、" : " "}
                {photos[b.placeId].sourceUrl ? (
                  <a href={photos[b.placeId].sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    {b.name} - {photos[b.placeId].author}
                  </a>
                ) : (
                  <>
                    {b.name} - {photos[b.placeId].author}
                  </>
                )}
              </span>
            ))}
          </>
          。其餘景點資料來源：Google Maps Places API，每週更新一次，非即時。
        </div>
      ) : null}
    </div>
  );
}
