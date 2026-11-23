"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Status } from "@/lib/data";
import { formatDistance, haversineMeters } from "@/lib/tycgParking";
import { useUserLocation } from "@/lib/useUserLocation";
import ParkingMap, { type ParkingMapLandmark, type ParkingMapLot } from "./ParkingMap";
import styles from "./TouristInterior.module.css";

const REFRESH_INTERVAL = 60_000;
const parkingTime = new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const statusClass: Record<Status, string> = { ok: styles.available, mid: styles.almostFull, full: styles.full };

export default function ParkingDirectory({
  lots,
  landmarks,
  updatedAt,
  source,
}: {
  lots: ParkingMapLot[];
  landmarks: ParkingMapLandmark[];
  updatedAt: string | null;
  source: "taoyuan" | "tdx" | "reference";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const userLocation = useUserLocation();

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) startTransition(() => router.refresh());
    }, REFRESH_INTERVAL);
    return () => window.clearInterval(timer);
  }, [router]);

  const rows = useMemo(
    () => lots.map((lot) => ({
      ...lot,
      distance: userLocation ? haversineMeters(userLocation, lot) : lot.distanceMeters,
    })).sort((a, b) => a.distance - b.distance),
    [lots, userLocation],
  );

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

      <div className={styles.parkingGrid}>
        <section className={styles.parkingSection} aria-labelledby="parking-map-title">
          <h2 id="parking-map-title">停車地圖</h2>
          <ParkingMap lots={lots} landmarks={landmarks} userLocation={userLocation} />
        </section>
        <section className={styles.parkingSection} aria-labelledby="parking-list-title">
          <h2 id="parking-list-title">附近停車場</h2>
          <ul className={styles.lotList}>
            {rows.map((lot) => (
              <li key={lot.id} className={styles.lotRow}>
                <div>
                  <h3>{lot.name}</h3>
                  {lot.address ? <p>{lot.address}</p> : null}
                  <p>{userLocation ? "距你" : "距老街"} {formatDistance(lot.distance)} · 直線距離</p>
                </div>
                <div className={styles.lotAction}>
                  <span className={lot.status ? statusClass[lot.status] : styles.unknown}>{lot.availability}</span>
                  <a
                    className={styles.navigation}
                    href={lot.mapsUrl}
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
