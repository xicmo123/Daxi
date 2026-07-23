import PageHeader from "@/components/PageHeader";
import SpotsList from "@/components/SpotsList";
import { getAllPlaces, readPhotos, readDetails, filterVisiblePlaces } from "@/lib/placesStore";
import { fetchDaxiParking, type LiveParkingLot } from "@/lib/tycgParking";

export const dynamic = "force-dynamic";

export default async function SpotsPage() {
  const [rawPlaces, photos, details] = await Promise.all([getAllPlaces(), readPhotos(), readDetails()]);
  const allPlaces = filterVisiblePlaces(rawPlaces, details);
  const spots = allPlaces.filter((b) => b.tag === "景點");
  const featuredSpots = spots.filter((b) => details[b.placeId]?.featured);
  const creditedSpots = spots.filter((b) => photos[b.placeId]?.author);

  let lots: LiveParkingLot[] = [];
  try {
    lots = await fetchDaxiParking();
  } catch {
    lots = [];
  }

  return (
    <div className="pt-2">
      <PageHeader title="景點" subtitle="老街周邊景點與順路走走" tint="moss" />

      <SpotsList spots={spots} featuredSpots={featuredSpots} allBusinesses={allPlaces} photos={photos} details={details} lots={lots} />

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
