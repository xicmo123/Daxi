import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import TouristPageHeader from "@/components/TouristPageHeader";
import ParkingDirectory from "@/components/ParkingDirectory";
import ParkingAlertBanner from "@/components/ParkingAlertBanner";
import type { ParkingMapPlace, ParkingMapLot } from "@/components/ParkingMap";
import { getCachedNearbyParking, getCachedParkingSnapshot } from "@/lib/cachedSources";
import { parkingCongestion } from "@/lib/experience";
import { TAOYUAN_PARKING_CATALOG, TDX_PARKING_CATALOG } from "@/lib/parkingFeed";
import { haversineMeters, parkingAvailabilityLabel } from "@/lib/tycgParking";
import { getAllPlaces, filterVisiblePlaces, readDetails } from "@/lib/placesStore";
import { businessGroupOf, categoryLabel } from "@/lib/placeDetails";
import { shortPlaceName } from "@/lib/placePages";
import styles from "@/components/TouristInterior.module.css";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/parking",
  title: "大溪停車場與即時空位",
  description: "搜尋大溪景點、店家或小吃，找離目的地最近的停車場，查即時空位與開車導航。",
});

async function readDestinations(): Promise<ParkingMapPlace[]> {
  const [places, details] = await Promise.all([getAllPlaces(), readDetails()]);
  return filterVisiblePlaces(places, details)
    .filter(({ lat, lng }) => Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180)
    .map((place) => {
      const { placeId, name, tag, googleType, address, lat, lng } = place;
      const detail = details[placeId];
      return {
        id: placeId,
        name: shortPlaceName(name),
        type: tag === "景點" ? "landmark" : "business",
        address,
        category: categoryLabel(detail?.category, googleType, tag),
        keywords: [tag, ...(tag === "景點" ? [] : [businessGroupOf(place)]), ...(detail?.tags ?? [])],
        lat,
        lng,
      };
    });
}

function comparableName(name: string) {
  return name.replace(/^(桃園市|大溪區|大溪)/, "").replace(/\s|[（(]桃交[）)]/g, "");
}

export default async function ParkingPage() {
  const [snapshot, nearbyLots, destinations] = await Promise.all([
    getCachedParkingSnapshot(),
    getCachedNearbyParking().catch(() => []),
    readDestinations().catch(() => []),
  ]);
  const officialLots = snapshot.lots;
  const mappedLots: ParkingMapLot[] = [
    ...officialLots.map((lot) => ({ ...lot, availability: parkingAvailabilityLabel(lot) })),
    ...nearbyLots
      .filter((lot) => !officialLots.some((known) =>
        comparableName(known.name) === comparableName(lot.name) || haversineMeters(known, lot) < 40,
      ))
      .map((lot) => ({ ...lot, id: lot.placeId, status: null, availability: "空位未知" })),
  ];
  const congestion = parkingCongestion(officialLots);

  return (
    <main>
      <TouristPageHeader href="/parking" title="周邊停車" subtitle="搜尋店家或景點，查附近停車場、即時空位和開車導航。" />
      {congestion.isCongested ? (
        <div className="pt-3">
          <ParkingAlertBanner
            occupancyPct={congestion.occupancyPct}
            alternatives={congestion.alternatives}
            lateBirdExtraMinutes={congestion.lateBirdExtraMinutes}
          />
        </div>
      ) : null}
      <div className={styles.content}>
        <ParkingDirectory lots={mappedLots} destinations={destinations} updatedAt={snapshot.updatedAt} source={snapshot.source} />
        <nav className={styles.parkingRelated} aria-label="其他交通資訊">
          <Link className={styles.secondaryLink} href="/bus">查公車與到站時間 <span aria-hidden>→</span></Link>
          <Link className={styles.secondaryLink} href="/weather">看天氣與路況 <span aria-hidden>→</span></Link>
          <a
            className={styles.secondaryLink}
            href="https://www.google.com/maps/dir/?api=1&destination=24.884952,121.288238&travelmode=transit"
            target="_blank"
            rel="noopener noreferrer"
          >
            查搭車路線 <span aria-hidden>↗</span>
          </a>
        </nav>
        <p className={styles.source}>
          資料來源包括 <a href={TAOYUAN_PARKING_CATALOG} target="_blank" rel="noreferrer">桃園市交通局</a>、
          <a href={TDX_PARKING_CATALOG} target="_blank" rel="noreferrer">交通部 TDX</a>及周邊車場的 Google 地圖資料。空位以現場為準。
        </p>
      </div>
    </main>
  );
}
