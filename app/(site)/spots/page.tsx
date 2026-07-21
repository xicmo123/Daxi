import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import SpotsList from "@/components/SpotsList";
import { discoverItems } from "@/lib/data";
import { getAllPlaces, readPhotos, readDetails, filterVisiblePlaces } from "@/lib/placesStore";
import { fetchDaxiParking, type LiveParkingLot } from "@/lib/tycgParking";

export const dynamic = "force-dynamic";

export default async function SpotsPage() {
  const [rawPlaces, photos, details] = await Promise.all([getAllPlaces(), readPhotos(), readDetails()]);
  const allPlaces = filterVisiblePlaces(rawPlaces, details);
  const spots = allPlaces.filter((b) => b.tag === "景點");
  const creditedSpots = spots.filter((b) => photos[b.placeId]?.author);

  let lots: LiveParkingLot[] = [];
  try {
    lots = await fetchDaxiParking();
  } catch {
    lots = [];
  }

  return (
    <div className="pt-2">
      <PageHeader title="景點" subtitle="老街周邊精選景點與順路走走" />

      <div className="px-6 pt-1 pb-4 fade-in">
        <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--ink-soft)" }}>
          Discover
        </div>
        <h2 className="font-serif text-[17px] font-semibold">精選推薦</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 px-6 pb-4 fade-in">
        {discoverItems.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl overflow-hidden card-shadow transition-opacity active:opacity-70"
            style={{ background: "var(--card)" }}
          >
            <div className="relative h-28">
              <Image
                src={item.photo.src}
                alt={item.title}
                fill
                sizes="(max-width: 448px) 50vw, 220px"
                className="object-cover"
                style={{ filter: "saturate(0.82) contrast(0.96)" }}
              />
              <div className="absolute inset-0" style={{ background: "rgba(30,41,59,0.1)" }} />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)" }}
              />
              <span className="absolute left-2.5 bottom-2.5 text-[10px] font-normal tracking-wide text-white/90">
                {item.tag}
              </span>
            </div>
            <div className="p-3.5">
              <h4 className="font-serif text-[14px] font-semibold mb-1">{item.title}</h4>
              <p className="text-[11.5px] leading-snug" style={{ color: "var(--ink-soft)" }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 pt-6 pb-4 fade-in">
        <div className="text-[11px] font-normal tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--ink-soft)" }}>
          More
        </div>
        <h2 className="font-serif text-[17px] font-semibold">更多景點</h2>
      </div>
      <SpotsList spots={spots} allBusinesses={allPlaces} photos={photos} details={details} lots={lots} />

      <div className="px-6 pb-10 text-[10.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        精選景點圖片來源：Wikimedia Commons（CC BY-SA），攝影：
        {discoverItems.map((item, i) => (
          <span key={item.title}>
            {i > 0 ? "、" : " "}
            <a href={item.photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {item.title} - {item.photo.author}
            </a>
          </span>
        ))}
        {creditedSpots.length > 0 ? (
          <>
            、
            {creditedSpots.map((b, i) => (
              <span key={b.placeId}>
                {i > 0 ? "、" : ""}
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
        ) : null}
        。其餘景點資料來源：Google Maps Places API，每週更新一次，非即時。
      </div>
    </div>
  );
}
