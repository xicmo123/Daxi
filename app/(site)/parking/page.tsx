import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import TouristPageHeader from "@/components/TouristPageHeader";
import ParkingDirectory from "@/components/ParkingDirectory";
import ParkingAlertBanner from "@/components/ParkingAlertBanner";
import type { ParkingMapLandmark, ParkingMapLot } from "@/components/ParkingMap";
import { getCachedNearbyParking, getCachedParkingSnapshot } from "@/lib/cachedSources";
import { parkingCongestion } from "@/lib/experience";
import { TAOYUAN_PARKING_CATALOG, TDX_PARKING_CATALOG } from "@/lib/parkingFeed";
import { haversineMeters, parkingAvailabilityLabel } from "@/lib/tycgParking";
import { getAllPlaces, filterVisiblePlaces, readDetails } from "@/lib/placesStore";
import styles from "@/components/TouristInterior.module.css";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/parking",
  title: "大溪停車場與即時空位",
  description: "查詢大溪老街周邊停車場位置、空位和開車導航。未回報數字的車場標示空位未知。",
});

async function readLandmarks(): Promise<ParkingMapLandmark[]> {
  const [places, details] = await Promise.all([getAllPlaces(), readDetails()]);
  return filterVisiblePlaces(places, details)
    .filter((place) => place.tag === "景點")
    .map(({ placeId, name, lat, lng }) => ({ id: placeId, name, lat, lng }));
}

function comparableName(name: string) {
  return name.replace(/^(桃園市|大溪區|大溪)/, "").replace(/\s|[（(]桃交[）)]/g, "");
}

export default async function ParkingPage() {
  const [snapshot, nearbyLots, landmarks] = await Promise.all([
    getCachedParkingSnapshot(),
    getCachedNearbyParking().catch(() => []),
    readLandmarks().catch(() => []),
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
      <TouristPageHeader href="/parking" title="周邊停車" subtitle="查看老街周邊停車場、已回報的即時空位和開車導航。" />
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
        <ParkingDirectory lots={mappedLots} landmarks={landmarks} updatedAt={snapshot.updatedAt} source={snapshot.source} />
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
