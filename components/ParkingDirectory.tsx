"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Status } from "@/lib/data";
import { formatDistance, haversineMeters } from "@/lib/tycgParking";
import { useUserLocation } from "@/lib/useUserLocation";
import ParkingMap, { type ParkingMapPlace, type ParkingMapLot, type ParkingMapSelection } from "./ParkingMap";
import styles from "./TouristInterior.module.css";

const REFRESH_INTERVAL = 60_000;
const NEARBY_LOT_COUNT = 5;
const parkingTime = new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const statusClass: Record<Status, string> = { ok: styles.available, mid: styles.almostFull, full: styles.full };

function pushParkingEvent(event: { event: "parking_business_search" } | { event: "parking_navigation_click"; navigation_source: string }) {
  const browser = window as Window & { dataLayer?: unknown[] };
  (browser.dataLayer ??= []).push(event);
}

export default function ParkingDirectory({
  lots,
  destinations,
  updatedAt,
  source,
}: {
  lots: ParkingMapLot[];
  destinations: ParkingMapPlace[];
  updatedAt: string | null;
  source: "taoyuan" | "tdx" | "reference";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const userLocation = useUserLocation();
  const [selection, setSelection] = useState<ParkingMapSelection | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedPlace = selection?.kind === "place" ? selection.place : null;
  const selectedLot = selection?.kind === "lot" ? lots.find((lot) => lot.id === selection.id) : undefined;
  const distanceOrigin = selectedPlace ?? userLocation;

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) startTransition(() => router.refresh());
    }, REFRESH_INTERVAL);
    return () => window.clearInterval(timer);
  }, [router]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [selectedPlace?.id]);

  const rows = useMemo(
    () => lots.map((lot) => ({
      ...lot,
      distance: distanceOrigin ? haversineMeters(distanceOrigin, lot) : lot.distanceMeters,
    })).sort((a, b) => a.distance - b.distance),
    [lots, distanceOrigin],
  );
  const nearbyLots = useMemo(() => selectedPlace ? rows.slice(0, NEARBY_LOT_COUNT) : [], [rows, selectedPlace]);
  const distanceLabel = selectedPlace ? "距目的地" : userLocation ? "距你" : "距老街";

  function selectDestination(next: ParkingMapSelection | null) {
    setSelection(next);
    if (next?.kind === "place" && next.place.type === "business") {
      pushParkingEvent({ event: "parking_business_search" });
    }
  }

  function trackNavigation(target: EventTarget) {
    if (selectedPlace?.type !== "business" || !(target instanceof Element)) return;
    const link = target.closest<HTMLAnchorElement>("a[data-parking-navigation]");
    const source = link?.dataset.parkingNavigation;
    if (source) pushParkingEvent({ event: "parking_navigation_click", navigation_source: source });
  }

  return (
    <>
      <div className={styles.parkingNotice}>
        <div role="status" aria-live="polite">
          <strong>{source === "reference" ? "即時空位暫無資料" : source === "tdx" ? "部分空位由交通部 TDX 提供" : "桃園市即時空位"}</strong>
          {updatedAt ? <time dateTime={updatedAt}>資料時間 {parkingTime.format(new Date(updatedAt))}</time> : null}
          <p>未回報車位數的車場會標示「空位未知」。</p>
        </div>
        <button type="button" className={styles.refresh} disabled={pending} onClick={() => startTransition(() => router.refresh())}>
          {pending ? "更新中…" : "更新空位"}
        </button>
      </div>

      <div
        className={styles.parkingGrid}
        onClickCapture={(event) => trackNavigation(event.target)}
        onAuxClickCapture={(event) => { if (event.button === 1) trackNavigation(event.target); }}
      >
        <section className={styles.parkingSection} aria-labelledby="parking-map-title">
          <h2 id="parking-map-title">停車地圖</h2>
          <ParkingMap
            lots={lots}
            destinations={destinations}
            userLocation={userLocation}
            selectedPlace={selectedPlace}
            selectedLot={selectedLot}
            nearbyLots={nearbyLots}
            onSelect={selectDestination}
          />
        </section>
        <section className={styles.parkingSection} aria-labelledby="parking-list-title">
          <h2 id="parking-list-title">附近停車場</h2>
          <ul className={styles.lotList} ref={listRef}>
            {rows.map((lot) => (
              <li key={lot.id} className={styles.lotRow}>
                <div>
                  <h3>{lot.name}</h3>
                  {lot.address ? <p>{lot.address}</p> : null}
                  <p>{distanceLabel} {formatDistance(lot.distance)} · 直線距離</p>
                </div>
                <div className={styles.lotAction}>
                  <span className={lot.status ? statusClass[lot.status] : styles.unknown}>{lot.availability}</span>
                  <a
                    className={styles.navigation}
                    href={lot.mapsUrl}
                    data-parking-navigation="list"
                    aria-label={`開車導航到${lot.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    導航 <span aria-hidden>↗</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
