import type { Metadata } from "next";
import ExploreTabs from "@/components/ExploreTabs";
import PageHeader from "@/components/PageHeader";
import SpotsList from "@/components/SpotsList";
import { getAllPlaces, readPhotos, readDetails, filterVisiblePlaces } from "@/lib/placesStore";
import type { LiveParkingLot } from "@/lib/tycgParking";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrapper is immune to it. See lib/cachedSources.ts.
import { getCachedParking } from "@/lib/cachedSources";
import { buildSuggestedRoutes } from "@/lib/experience";
import { listActiveCoupons } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "大溪景點",
  description: "大溪老街周邊景點一次看：大溪橋、普濟堂、武德殿、中正公園與石門水庫，含步行距離、順路主題路線與無障礙資訊。",
  alternates: { canonical: "/spots" },
  openGraph: {
    title: "大溪景點 ｜ 大溪通",
    description: "大溪老街周邊景點、步行距離與順路主題路線。",
    url: "/spots",
  },
};

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
    <div className="pt-2">
      <PageHeader title="景點" subtitle="老街周邊景點與順路走走" tint="moss" />
      <ExploreTabs />

      <SpotsList spots={spots} featuredSpots={featuredSpots} allBusinesses={allPlaces} photos={photos} details={details} lots={lots} routes={routes} coupons={coupons} />

      {creditedSpots.length > 0 ? (
        <div className="safe-page-x pb-10 text-[10.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
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
