"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DivIcon,
  LatLngBoundsExpression,
  LayerGroup,
  Map as LeafletMap,
  Polyline,
  TileLayer,
} from "leaflet";
import type { GarbageRealtime, GarbageRoute } from "@/lib/taoyuanGarbage";

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

function boundsFor(realtime: GarbageRealtime): LatLngBoundsExpression | null {
  const points: Array<[number, number]> = [
    ...realtime.path,
    ...realtime.stops.map((stop) => [stop.lat, stop.lng] as [number, number]),
    ...realtime.vehicles.map((vehicle) => [vehicle.lat, vehicle.lng] as [number, number]),
  ];
  return points.length > 0 ? points : null;
}

export default function GarbageTruckMap() {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const vehicleLayerRef = useRef<LayerGroup | null>(null);
  const stopLayerRef = useRef<LayerGroup | null>(null);
  const pathLayerRef = useRef<Polyline | null>(null);
  const routeIdRef = useRef<string>("");

  const [routes, setRoutes] = useState<GarbageRoute[]>([]);
  const [routeId, setRouteId] = useState("");
  const [state, setState] = useState<LoadState>("loading");
  const [latestGpsTime, setLatestGpsTime] = useState<number | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [vehicleCount, setVehicleCount] = useState(0);

  useEffect(() => {
    routeIdRef.current = routeId;
  }, [routeId]);

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
      stopLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => map.invalidateSize(), 120);
    }

    setupMap();

    return () => {
      cancelled = true;
      tileRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRoutes() {
      setState("loading");
      try {
        const response = await fetch("/api/resident/garbage/routes", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load routes.");
        const data = (await response.json()) as { routes: GarbageRoute[] };
        if (cancelled) return;
        setRoutes(data.routes);
        setRouteId((current) => current || data.routes[0]?.id || "");
        setState(data.routes.length > 0 ? "ready" : "empty");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    loadRoutes();
    return () => {
      cancelled = true;
    };
  }, []);

  const drawRealtime = useCallback((realtime: GarbageRealtime, shouldFit: boolean) => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const vehicleLayer = vehicleLayerRef.current;
    const stopLayer = stopLayerRef.current;
    if (!L || !map || !vehicleLayer || !stopLayer) return;

    vehicleLayer.clearLayers();
    stopLayer.clearLayers();
    pathLayerRef.current?.remove();

    if (realtime.path.length > 1) {
      pathLayerRef.current = L.polyline(realtime.path, {
        color: "#4a7594",
        opacity: 0.72,
        weight: 4,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
    }

    realtime.stops.forEach((stop) => {
      L.circleMarker([stop.lat, stop.lng], {
        radius: stop.passed ? 3 : 4,
        color: stop.passed ? "rgba(125,106,88,0.34)" : "#7da8c9",
        fillColor: stop.passed ? "rgba(125,106,88,0.34)" : "#ffffff",
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip(`${stop.seq}. ${stop.name}`, { direction: "top", opacity: 0.9 })
        .addTo(stopLayer);
    });

    const makeTruckIcon = (type: string): DivIcon =>
      L.divIcon({
        className: truckClass(type),
        html: `<span aria-hidden="true"></span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

    realtime.vehicles.forEach((vehicle) => {
      L.marker([vehicle.lat, vehicle.lng], { icon: makeTruckIcon(vehicle.type) })
        .bindTooltip(`${vehicle.type} ${vehicle.id}`, { direction: "top", opacity: 0.95 })
        .addTo(vehicleLayer);
    });

    const bounds = boundsFor(realtime);
    if (shouldFit && bounds) {
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
    }

    setVehicleCount(realtime.vehicles.length);
    setLatestGpsTime(realtime.latestGpsTime);
    setSyncedAt(realtime.updatedAt);
    setState(realtime.vehicles.length > 0 || realtime.path.length > 0 ? "ready" : "empty");

  }, []);

  const loadRealtime = useCallback(
    async (selectedRouteId: string, shouldFit = false) => {
      if (!selectedRouteId) return;
      try {
        const response = await fetch(`/api/resident/garbage/realtime?routeId=${encodeURIComponent(selectedRouteId)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Unable to load realtime.");
        const realtime = (await response.json()) as GarbageRealtime;
        if (routeIdRef.current === selectedRouteId) {
          drawRealtime(realtime, shouldFit);
        }
      } catch {
        setState("error");
      }
    },
    [drawRealtime],
  );

  useEffect(() => {
    if (!routeId) return;
    // The selected route is the subscription key for the external GPS feed.
    // Loading here keeps the map in sync when routes change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRealtime(routeId, true);
    const interval = window.setInterval(() => loadRealtime(routeId), 15000);
    return () => window.clearInterval(interval);
  }, [loadRealtime, routeId]);

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: "var(--line)" }}>
        <select
          value={routeId}
          onChange={(event) => {
            setState("loading");
            setRouteId(event.target.value);
          }}
          aria-label="垃圾清運路線"
          className="min-w-0 flex-1 rounded-full px-3 py-2 text-[13px] font-semibold outline-none"
          style={{ background: "var(--paper-2)", color: "var(--ink)", border: "1px solid var(--line)" }}
        >
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.displayName}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setState("loading");
            loadRealtime(routeId, true);
          }}
          aria-label="重新定位垃圾車"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
          style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.6-6.4" />
            <path d="M21 4.5V10h-5.5" />
          </svg>
        </button>
      </div>

      <div className="relative h-[420px] min-h-[60vh]">
        <div ref={mapNodeRef} className="absolute inset-0" aria-label="大溪垃圾車即時地圖" />
        <div className="pointer-events-none absolute left-3 right-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink)" }}>
            {vehicleCount > 0 ? `${vehicleCount} 車` : state === "loading" ? "定位中" : "無車輛"}
          </span>
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--river-teal)" }}>
            每 {REFRESH_SECONDS} 秒更新
          </span>
          {routes.find((route) => route.id === routeId)?.areaLabel ? (
            <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--river-teal)" }}>
              {routes.find((route) => route.id === routeId)?.areaLabel}
            </span>
          ) : null}
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
    </div>
  );
}
