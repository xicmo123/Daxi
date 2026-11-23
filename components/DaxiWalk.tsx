"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Map as LeafletMap, Marker } from "leaflet";
import { daxiWalkStops, photoLicense, walkNavigationHref } from "@/lib/daxiWalk";
import { daxiWalkPath } from "@/lib/daxiWalkPath";
import styles from "./TouristGuide.module.css";

export default function DaxiWalk() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "failed">("loading");
  const mapElement = useRef<HTMLDivElement>(null);
  const markers = useRef<Marker[]>([]);
  const stop = daxiWalkStops[activeIndex];
  const nextStop = daxiWalkStops[activeIndex + 1];

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;

    import("leaflet").then((L) => {
      if (disposed || !mapElement.current) return;
      const guideMap = L.map(mapElement.current, {
        attributionControl: true,
        zoomControl: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
      });
      map = guideMap;
      guideMap.attributionControl.setPrefix(false);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(guideMap);

      const path = L.polyline(daxiWalkPath, {
        color: "#873a30",
        weight: 5,
        opacity: 0.9,
        interactive: false,
      }).addTo(guideMap);
      const fitRoute = () => guideMap.fitBounds(path.getBounds(), { padding: [28, 25], maxZoom: 18 });
      fitRoute();
      guideMap.on("resize", fitRoute);

      markers.current = daxiWalkStops.map((item, index) => {
        const marker = L.marker(item.coordinates, {
          alt: `第 ${index + 1} 站 ${item.name}`,
          icon: L.divIcon({
            className: styles.mapMarker,
            html: String(index + 1),
            iconSize: [28, 28],
          }),
        }).addTo(guideMap);
        marker.on("click", () => setActiveIndex(index));
        return marker;
      });
      setMapStatus("ready");
    }).catch(() => {
      if (!disposed) setMapStatus("failed");
    });

    return () => {
      disposed = true;
      map?.remove();
      markers.current = [];
    };
  }, []);

  useEffect(() => {
    if (mapStatus !== "ready") return;
    markers.current.forEach((marker, index) => {
      const isActive = index === activeIndex;
      const element = marker.getElement();
      element?.classList.toggle("walk-marker-active", isActive);
      element?.setAttribute("aria-pressed", String(isActive));
      element?.setAttribute("aria-label", `第 ${index + 1} 站 ${daxiWalkStops[index].name}`);
      marker.setZIndexOffset(isActive ? 500 : 0);
    });
  }, [activeIndex, mapStatus]);

  return (
    <div className={styles.walkLayout}>
      <div className={`${styles.mapCard} ${styles.walkMap}`}>
        <div ref={mapElement} className={styles.map} role="region" aria-label="老街散步地圖與四個站點">
          {mapStatus === "failed" ? <p className="p-4 text-sm text-[#3a241f]">地圖暫時無法載入，仍可從站點清單開啟導航。</p> : null}
        </div>
      </div>

      <article className={`${styles.stopCard} ${styles.walkStop}`} aria-labelledby="current-walk-stop">
        <div className={styles.stopPhoto}>
          <Image src={stop.photo.src} alt={stop.photo.alt} fill sizes="(max-width: 767px) 92vw, 480px" />
        </div>
        <div className={styles.stopBody}>
          <div aria-live="polite" aria-atomic="true">
            <div className={styles.stopProgress}>第 {activeIndex + 1} 站／共 {daxiWalkStops.length} 站</div>
            <h2 id="current-walk-stop">{stop.name}</h2>
          </div>
          <p className={styles.stopAddress}>{stop.address}</p>
          <div className={styles.stopActions}>
            <a
              className={styles.primaryAction}
              href={walkNavigationHref(stop)}
              aria-label={`步行導航到${stop.name}`}
              target="_blank"
              rel="noreferrer"
            >
              步行導航到這站 <span aria-hidden>↗</span>
            </a>
            {nextStop ? (
              <button
                type="button"
                className={styles.quietAction}
                onClick={() => setActiveIndex(activeIndex + 1)}
              >
                下一站 <span aria-hidden>→</span>
              </button>
            ) : (
              <button type="button" className={styles.quietAction} onClick={() => setActiveIndex(0)}>回到起點</button>
            )}
          </div>
          <p className={styles.stopDescription}>{stop.description}</p>
          <p className={styles.credits}>
            <a href={stop.photo.sourceUrl} target="_blank" rel="noreferrer">攝影 {stop.photo.author}</a>
            {" · "}
            <a href={photoLicense} target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
          </p>
        </div>
      </article>

      <section className={`${styles.mapCard} ${styles.walkStops}`} aria-label="散步站點順序">
        <ol className={styles.stopList}>
          {daxiWalkStops.map((item, index) => (
            <li key={item.name}>
              <button
                type="button"
                className={styles.stopButton}
                onClick={() => setActiveIndex(index)}
                aria-current={activeIndex === index ? "step" : undefined}
                aria-controls="current-walk-stop"
              >
                <span className={styles.stopNumber}>{index + 1}</span>
                <span className={styles.stopName}>{item.name}</span>
                <span className={styles.stopLeg}>{item.minutesFromPrevious ? `從前一站約 ${item.minutesFromPrevious} 分鐘` : "起點"}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
