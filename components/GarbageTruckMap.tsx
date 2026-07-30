"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DivIcon, LayerGroup, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import type { GarbageRealtime, GarbageVehicle } from "@/lib/taoyuanGarbage";
import { animateMarkerTo } from "@/lib/leafletAnimate";

type LeafletModule = typeof import("leaflet");

type LoadState = "loading" | "ready" | "empty" | "error";

const DAXI_CENTER: [number, number] = [24.884, 121.288];
const REFRESH_SECONDS = 15;

function formatTime(value: string | number) {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function truckClass(type: string) {
  return type === "資源回收車" ? "garbage-marker garbage-marker-recycle" : "garbage-marker garbage-marker-trash";
}

function vehicleLabel(vehicle: GarbageVehicle) {
  const parts = vehicle.id.split(":");
  const id = vehicle.id.includes(":") ? parts[parts.length - 1] : vehicle.id;
  return `${vehicle.routeName ? `${vehicle.routeName} ` : ""}${vehicle.type} ${id}`;
}

function boundsForVehicles(vehicles: GarbageVehicle[]): Array<[number, number]> | null {
  const points = vehicles.map((vehicle) => [vehicle.lat, vehicle.lng] as [number, number]);
  return points.length > 0 ? points : null;
}

export default function GarbageTruckMap() {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const vehicleLayerRef = useRef<LayerGroup | null>(null);
  const vehicleMarkersRef = useRef<Map<string, Marker>>(new Map());

  const [state, setState] = useState<LoadState>("loading");
  const [latestGpsTime, setLatestGpsTime] = useState<number | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [vehicles, setVehicles] = useState<GarbageVehicle[]>([]);

  const drawRealtime = useCallback((realtime: GarbageRealtime, fit: "none" | "auto") => {
    const currentVehicles = realtime.vehicles;

    setVehicleCount(currentVehicles.length);
    setVehicles(currentVehicles);
    setLatestGpsTime(realtime.latestGpsTime);
    setSyncedAt(realtime.updatedAt);
    setState(currentVehicles.length > 0 ? "ready" : "empty");

    const L = leafletRef.current;
    const map = mapRef.current;
    const vehicleLayer = vehicleLayerRef.current;
    if (!L || !map || !vehicleLayer) return;

    const makeTruckIcon = (type: string): DivIcon =>
      L.divIcon({
        className: truckClass(type),
        html: `<span aria-hidden="true"></span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

    const seenIds = new Set<string>();
    const markers = vehicleMarkersRef.current;
    currentVehicles.forEach((vehicle) => {
      seenIds.add(vehicle.id);
      const existing = markers.get(vehicle.id);
      if (existing) {
        existing.setIcon(makeTruckIcon(vehicle.type));
        existing.setTooltipContent(vehicleLabel(vehicle));
        animateMarkerTo(existing, [vehicle.lat, vehicle.lng]);
      } else {
        const marker = L.marker([vehicle.lat, vehicle.lng], { icon: makeTruckIcon(vehicle.type) })
          .bindTooltip(vehicleLabel(vehicle), { direction: "top", opacity: 0.95 })
          .addTo(vehicleLayer);
        markers.set(vehicle.id, marker);
      }
    });
    markers.forEach((marker, id) => {
      if (!seenIds.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    });

    const shouldFit = fit === "auto";
    if (!shouldFit) return;
    const bounds = boundsForVehicles(currentVehicles);
    if (bounds) map.flyToBounds(bounds, { padding: [24, 24], maxZoom: 16, duration: 0.8 });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      const L = await import("leaflet");
      if (cancelled || !mapNodeRef.current || mapRef.current) return;

      leafletRef.current = L;
      const map = L.map(mapNodeRef.current, {
        attributionControl: true,
        zoomControl: false,
      }).setView(DAXI_CENTER, 14);
      mapRef.current = map;
      map.attributionControl.setPrefix("");

      tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      vehicleLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => map.invalidateSize(), 120);
      setMapReady(true);
    }

    setupMap();

    return () => {
      cancelled = true;
      tileRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const loadRealtime = useCallback(
    async (fit: "none" | "auto" = "none") => {
      try {
        const response = await fetch("/api/resident/garbage/realtime", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load realtime.");
        const realtime = (await response.json()) as GarbageRealtime;
        drawRealtime(realtime, fit);
      } catch {
        setState("error");
      }
    },
    [drawRealtime],
  );

  useEffect(() => {
    if (!mapReady) return;
    const initialLoad = window.setTimeout(() => {
      void loadRealtime("auto");
    }, 0);
    const interval = window.setInterval(() => loadRealtime(), REFRESH_SECONDS * 1000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadRealtime, mapReady]);

  const statusText = "顯示大溪區目前在線清運車";
  const emptyText = "目前沒有在線車輛";

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="border-b px-3 py-3" style={{ borderColor: "var(--line)" }}>
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: "var(--block-wood-deep)" }}>
              清運車即時位置
            </div>
            <div className="mt-0.5 text-[14px] font-bold leading-tight" style={{ color: "var(--ink)" }}>
              {statusText}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full px-2.5 py-1 text-[10.5px] font-bold" style={{ background: vehicleCount > 0 ? "var(--river-teal-soft)" : "var(--cognac-tint)", color: vehicleCount > 0 ? "var(--river-teal)" : "var(--ink-soft)" }}>
              {state === "loading" ? "載入中" : vehicleCount > 0 ? `${vehicleCount} 車` : "目前無車"}
            </span>
            <button
              type="button"
              onClick={() => {
                setState("loading");
                void loadRealtime("auto");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity active:opacity-70"
              style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}
              aria-label="更新垃圾車位置"
              title="更新"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-2.6-6.4" />
                <path d="M21 4.5V10h-5.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-[420px] min-h-[60vh]">
        <div ref={mapNodeRef} className="absolute inset-0" aria-label="大溪垃圾車即時地圖" />
        <div className="pointer-events-none absolute left-3 right-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink)" }}>
            {state === "loading" ? "載入中" : vehicleCount > 0 ? `${vehicleCount} 車` : emptyText}
          </span>
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--river-teal)" }}>
            每 {REFRESH_SECONDS} 秒更新
          </span>
          {latestGpsTime ? (
            <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
              GPS {formatTime(latestGpsTime)}
            </span>
          ) : syncedAt ? (
            <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
              同步 {formatTime(syncedAt)}
            </span>
          ) : null}
        </div>
        {state === "error" ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--daxi-red)" }}>
            即時位置暫時無法載入
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t px-3 py-3" style={{ borderColor: "var(--line)" }}>
        {vehicles.length > 0 ? (
          <div className="grid gap-2">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="rounded-2xl px-3 py-2.5" style={{ background: "var(--river-teal-soft)" }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 text-[12.5px] font-bold" style={{ color: "var(--ink)" }}>
                    {vehicle.routeName ? `${vehicle.routeName}・` : ""}
                    {vehicle.type} {vehicle.id.includes(":") ? vehicle.id.split(":").pop() : vehicle.id}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold" style={{ color: "var(--river-teal)" }}>
                    {vehicle.gpsTime ? `GPS ${formatTime(vehicle.gpsTime)}` : vehicle.status ?? "即時位置"}
                  </span>
                </div>
                {vehicle.address ? (
                  <div className="mt-0.5 text-[11px]" style={{ color: "var(--ink-soft)" }}>
                    目前約在 {vehicle.address}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl px-3 py-2.5 text-[12.5px] font-semibold" style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}>
            {emptyText}
          </div>
        )}

      </div>
    </div>
  );
}
