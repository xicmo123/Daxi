import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { fetchDaxiParking, type LiveParkingLot } from "@/lib/tycgParking";
import { fetchNearbyParking, type NearbyParkingLot } from "@/lib/googlePlacesParking";
import { parkingCongestion } from "@/lib/experience";
import ParkingAlertBanner from "@/components/ParkingAlertBanner";
import ParkingMap, { type ParkingMapLot, type ParkingMapLandmark } from "@/components/ParkingMap";
import { getAllPlaces, filterVisiblePlaces, readDetails } from "@/lib/placesStore";

// Rough average walking pace (~80m/min) — a static, indicative label only.
export const revalidate = 60;

type Row =
  | ({ kind: "public" } & LiveParkingLot)
  | ({ kind: "private" } & NearbyParkingLot);

export default async function ParkingPage() {
  let lots: LiveParkingLot[] = [];
  let liveDataFailed = false;

  try {
    lots = await fetchDaxiParking();
  } catch {
    liveDataFailed = true;
  }

  let nearbyLots: NearbyParkingLot[] = [];
  try {
    nearbyLots = await fetchNearbyParking(lots.map((l) => ({ lat: l.lat, lng: l.lng })));
  } catch {
    nearbyLots = [];
  }

  const rows: Row[] = [
    ...lots.map((l): Row => ({ kind: "public", ...l })),
    ...nearbyLots.map((l): Row => ({ kind: "private", ...l })),
  ].sort((a, b) => a.distanceMeters - b.distanceMeters);
  const congestion = parkingCongestion(lots);

  const mapLots: ParkingMapLot[] = rows.map((row) => {
    const key = row.kind === "public" ? row.name : row.placeId;
    if (row.kind === "public") {
      const isFull = row.status === "full";
      const availability = isFull ? "目前滿位" : row.isOpenAccess ? "開放式車位" : `剩餘 ${row.surplus}/${row.total}`;
      return {
        id: key,
        name: row.name,
        lat: row.lat,
        lng: row.lng,
        kind: "public",
        status: row.status,
        isFull,
        note: `${availability}・距老街 ${row.distanceLabel}`,
        mapsUrl: row.mapsUrl,
      };
    }
    return {
      id: key,
      name: row.name,
      lat: row.lat,
      lng: row.lng,
      kind: "private",
      note: `僅供位置參考・距老街 ${row.distanceLabel}`,
      mapsUrl: row.mapsUrl,
    };
  });

  let landmarks: ParkingMapLandmark[] = [];
  try {
    const [rawPlaces, details] = await Promise.all([getAllPlaces(), readDetails()]);
    const places = filterVisiblePlaces(rawPlaces, details);
    landmarks = places
      .filter((p) => p.tag === "景點")
      .map((p) => ({ id: p.placeId, name: p.name, lat: p.lat, lng: p.lng }));
  } catch {
    landmarks = [];
  }

  return (
    <div className="pt-2">
      <PageHeader
        title="周邊停車"
        subtitle={liveDataFailed ? "即時資料暫時整理中" : "距大溪老街由近到遠・每分鐘更新"}
        tint="river"
      />

      {congestion.isCongested ? (
        <ParkingAlertBanner
          occupancyPct={congestion.occupancyPct}
          alternatives={congestion.alternatives}
          lateBirdExtraMinutes={congestion.lateBirdExtraMinutes}
        />
      ) : null}

      <div className="safe-page-x pb-3 fade-in">
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=24.8809,121.2868&travelmode=transit"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-opacity active:opacity-70"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--paper-2)", color: "var(--ink)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="4" width="14" height="13" rx="3" />
                <path d="M5 13.5h14M8.5 17v2.2M15.5 17v2.2" />
                <circle cx="8.5" cy="10" r="0.8" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="10" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className="block min-w-0 truncate text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
              不開車？查大眾運輸路線
            </span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--ink-soft)" }}>
            <path d="m9 5 7 7-7 7" />
          </svg>
        </a>

        <Link
          href="/weather"
          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-opacity active:opacity-70"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--paper-2)", color: "var(--ink)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="7" width="10.5" height="8.5" rx="2.3" />
                <path d="m14.5 10 5.5-2.8v8.6L14.5 13" />
              </svg>
            </span>
            <span className="block min-w-0 truncate text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
              即時影像與天氣路況
            </span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--ink-soft)" }}>
            <path d="m9 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {mapLots.length > 0 ? (
        <div className="safe-page-x pb-5 fade-in">
          <ParkingMap lots={mapLots} landmarks={landmarks} />
        </div>
      ) : null}

      {liveDataFailed ? (
        <div className="safe-page-x pb-4">
          <div className="text-[13px] py-4" style={{ color: "var(--ink-soft)", borderTop: "1px solid var(--line)" }}>
            即時停車資料暫時整理中，請稍後再回來看看。
          </div>
        </div>
      ) : null}

      <div className="safe-page-x pb-10 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        資料來源：
        <a href="https://data.gov.tw/dataset/25940" target="_blank" rel="noopener noreferrer" className="underline">
          桃園市路外停車資訊｜政府資料開放平臺
        </a>
        （公有路外停車場，含即時空位；距離以大溪老街和平路豆干街一帶為基準點）、
        <a
          href="https://developers.google.com/maps/documentation/places/web-service/nearby-search"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Google Maps Places API
        </a>
        （半徑 3 公里內的其他停車場，僅列出位置，車位數量與即時空位 Google 未開放查詢，請以現場狀況為準）
      </div>
    </div>
  );
}
