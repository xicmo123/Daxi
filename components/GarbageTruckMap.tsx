"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DivIcon, LayerGroup, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import type { GarbageRealtime, GarbageVehicle } from "@/lib/taoyuanGarbage";
import { animateMarkerTo } from "@/lib/leafletAnimate";
import { useGarbageAlert } from "@/lib/useGarbageAlert";
import { getCurrentPosition } from "@/lib/geolocation";
import { calculateDistance } from "@/lib/geo";

type LeafletModule = typeof import("leaflet");

type LoadState = "loading" | "ready" | "empty" | "error";
type LocationState = "locating" | "ready" | "error";
type UserLocation = { lat: number; lng: number };
type DisplayVehicle = GarbageVehicle & { distanceMeters?: number };

const DAXI_CENTER: [number, number] = [24.884, 121.288];
const REFRESH_SECONDS = 15;
const NEARBY_RADIUS_METERS = 500;
const LOCATE_ZOOM = 16;

function formatTime(value: string | number) {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} 公尺`;
  return `${(meters / 1000).toFixed(1)} 公里`;
}

function buildAlertPointIcon(L: LeafletModule): DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px 999px 999px 0;transform:rotate(45deg);background:#c98a2e;border:2px solid #fff;box-shadow:0 6px 14px rgba(43,36,32,0.3);"><span style="transform:rotate(-45deg);font-size:14px;">🗑️</span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

function buildLocationIcon(L: LeafletModule): DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;background:#4a7594;border:3px solid #fff;box-shadow:0 4px 12px rgba(43,36,32,0.26);"><span style="width:7px;height:7px;border-radius:999px;background:#fff;"></span></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function truckClass(type: string) {
  return type === "資源回收車" ? "garbage-marker garbage-marker-recycle" : "garbage-marker garbage-marker-trash";
}

function filterNearbyVehicles(vehicles: GarbageVehicle[], location: UserLocation | null): DisplayVehicle[] {
  if (!location) return vehicles;
  return vehicles
    .map((vehicle) => ({
      ...vehicle,
      distanceMeters: calculateDistance(location.lat, location.lng, vehicle.lat, vehicle.lng),
    }))
    .filter((vehicle) => vehicle.distanceMeters <= NEARBY_RADIUS_METERS)
    .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
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
  const alertPointLayerRef = useRef<LayerGroup | null>(null);
  const locationLayerRef = useRef<LayerGroup | null>(null);
  const vehicleMarkersRef = useRef<Map<string, Marker>>(new Map());
  const didLocateRef = useRef(false);
  const latestRealtimeRef = useRef<GarbageRealtime | null>(null);
  const userLocationRef = useRef<UserLocation | null>(null);
  const pickingPointRef = useRef(false);

  const [state, setState] = useState<LoadState>("loading");
  const [locationState, setLocationState] = useState<LocationState>("locating");
  const [latestGpsTime, setLatestGpsTime] = useState<number | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [totalVehicleCount, setTotalVehicleCount] = useState(0);
  const [pickingPoint, setPickingPoint] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [vehicles, setVehicles] = useState<DisplayVehicle[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const { point: alertPoint, setPoint: setAlertPoint, permission: notifyPermission, requestPermission } = useGarbageAlert();

  useEffect(() => {
    pickingPointRef.current = pickingPoint;
  }, [pickingPoint]);

  const drawRealtime = useCallback((realtime: GarbageRealtime, fit: "none" | "auto" | "user") => {
    latestRealtimeRef.current = realtime;
    const nearbyVehicles = filterNearbyVehicles(realtime.vehicles, userLocationRef.current);

    setVehicleCount(nearbyVehicles.length);
    setTotalVehicleCount(realtime.vehicles.length);
    setVehicles(nearbyVehicles);
    setLatestGpsTime(realtime.latestGpsTime);
    setSyncedAt(realtime.updatedAt);
    setState(nearbyVehicles.length > 0 ? "ready" : "empty");

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
    nearbyVehicles.forEach((vehicle) => {
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

    const shouldFit = fit === "user" || (fit === "auto" && !didLocateRef.current);
    if (!shouldFit) return;
    const location = userLocationRef.current;
    if (location) {
      map.flyTo([location.lat, location.lng], LOCATE_ZOOM, { duration: 0.8 });
      return;
    }
    const bounds = boundsForVehicles(nearbyVehicles.length > 0 ? nearbyVehicles : realtime.vehicles);
    if (bounds) map.flyToBounds(bounds, { padding: [24, 24], maxZoom: 16, duration: 0.8 });
  }, []);

  const locateUser = useCallback(
    (fit: "none" | "user" = "user") => {
      setLocationState("locating");
      getCurrentPosition(
        (position) => {
          const next = { lat: position.coords.latitude, lng: position.coords.longitude };
          userLocationRef.current = next;
          setUserLocation(next);
          setLocationState("ready");
          didLocateRef.current = true;
          mapRef.current?.invalidateSize();
          if (fit === "user") mapRef.current?.flyTo([next.lat, next.lng], LOCATE_ZOOM, { duration: 1 });
          if (latestRealtimeRef.current) drawRealtime(latestRealtimeRef.current, fit);
        },
        () => {
          setLocationState("error");
          if (latestRealtimeRef.current) drawRealtime(latestRealtimeRef.current, "auto");
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
      );
    },
    [drawRealtime],
  );

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
      alertPointLayerRef.current = L.layerGroup().addTo(map);
      locationLayerRef.current = L.layerGroup().addTo(map);

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        if (!pickingPointRef.current) return;
        setAlertPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
        setPickingPoint(false);
      });

      setTimeout(() => map.invalidateSize(), 120);
      setMapReady(true);
      locateUser("user");
    }

    setupMap();

    return () => {
      cancelled = true;
      tileRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [locateUser, setAlertPoint]);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = locationLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    if (!userLocation) return;
    L.circle([userLocation.lat, userLocation.lng], {
      radius: NEARBY_RADIUS_METERS,
      color: "#4a7594",
      fillColor: "#4a7594",
      fillOpacity: 0.08,
      opacity: 0.28,
      weight: 2,
    }).addTo(layer);
    L.marker([userLocation.lat, userLocation.lng], { icon: buildLocationIcon(L) })
      .bindTooltip("目前位置", { direction: "top", opacity: 0.95 })
      .addTo(layer);
  }, [userLocation, mapReady]);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = alertPointLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    if (!alertPoint) return;
    L.marker([alertPoint.lat, alertPoint.lng], { icon: buildAlertPointIcon(L) })
      .bindTooltip("我的倒垃圾點", { direction: "top", opacity: 0.95 })
      .addTo(layer);
  }, [alertPoint, mapReady]);

  const loadRealtime = useCallback(
    async (fit: "none" | "auto" | "user" = "none") => {
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

  const statusText =
    locationState === "ready"
      ? `顯示目前位置 ${NEARBY_RADIUS_METERS} 公尺內`
      : locationState === "locating"
        ? "正在定位目前位置"
        : "定位未開，先顯示大溪全部在線車輛";
  const emptyText = locationState === "ready" ? "500 公尺內目前沒有垃圾車" : "目前沒有在線車輛";

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="border-b px-3 py-3" style={{ borderColor: "var(--line)" }}>
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: "var(--block-wood-deep)" }}>
              附近垃圾車
            </div>
            <div className="mt-0.5 text-[14px] font-bold leading-tight" style={{ color: "var(--ink)" }}>
              {statusText}
            </div>
          </div>
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-bold" style={{ background: vehicleCount > 0 ? "var(--river-teal-soft)" : "var(--cognac-tint)", color: vehicleCount > 0 ? "var(--river-teal)" : "var(--ink-soft)" }}>
            {state === "loading" ? "載入中" : vehicleCount > 0 ? `${vehicleCount} 車附近` : "目前無車"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => locateUser("user")}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-2xl px-2 text-[12px] font-bold transition-opacity active:opacity-70"
            style={{ background: "var(--paper-2)", color: "var(--ink)", border: "1px solid var(--line)" }}
          >
            <span aria-hidden="true">📍</span>
            定位
          </button>
          <button
            type="button"
            onClick={() => {
              setState("loading");
              loadRealtime("user");
            }}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-2xl px-2 text-[12px] font-bold transition-opacity active:opacity-70"
            style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.6-6.4" />
              <path d="M21 4.5V10h-5.5" />
            </svg>
            更新
          </button>
          <button
            type="button"
            onClick={() => setPickingPoint((prev) => !prev)}
            aria-pressed={pickingPoint}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-2xl px-2 text-[12px] font-bold transition-opacity active:opacity-70"
            style={
              pickingPoint
                ? { background: "#c98a2e", color: "#fff" }
                : { background: "var(--paper-2)", color: "var(--ink)", border: "1px solid var(--line)" }
            }
          >
            <span aria-hidden="true">📌</span>
            {alertPoint ? "改點" : "提醒"}
          </button>
        </div>
      </div>

      <div className="relative h-[420px] min-h-[60vh]">
        <div ref={mapNodeRef} className="absolute inset-0" aria-label="大溪垃圾車即時地圖" />
        <div className="pointer-events-none absolute left-3 right-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink)" }}>
            {state === "loading" ? "載入中" : vehicleCount > 0 ? `${vehicleCount} 車` : emptyText}
          </span>
          {locationState === "ready" ? (
            <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--river-teal)" }}>
              500 公尺
            </span>
          ) : null}
          {totalVehicleCount > 0 ? (
            <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
              全區 {totalVehicleCount} 車
            </span>
          ) : null}
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
        {pickingPoint ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-center text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "#c98a2e" }}>
            點擊地圖，設定你的倒垃圾點
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
                    {vehicle.distanceMeters !== undefined ? formatDistance(vehicle.distanceMeters) : vehicle.gpsTime ? `GPS ${formatTime(vehicle.gpsTime)}` : vehicle.status ?? "即時位置"}
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

        {alertPoint ? (
          <div className="rounded-2xl px-3 py-2.5" style={{ background: "var(--cognac-tint)" }}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11.5px] font-semibold" style={{ color: notifyPermission === "denied" ? "var(--daxi-red)" : "var(--ink)" }}>
                {notifyPermission === "granted"
                  ? "垃圾車進入 300 公尺內會通知你"
                  : notifyPermission === "denied"
                    ? "通知已被瀏覽器封鎖"
                    : notifyPermission === "unsupported"
                      ? "此瀏覽器不支援通知提醒"
                      : "已設定倒垃圾點"}
              </div>
              <button
                type="button"
                onClick={() => setAlertPoint(null)}
                className="shrink-0 text-[11.5px] font-bold transition-opacity active:opacity-70"
                style={{ color: "var(--daxi-red)" }}
              >
                清除
              </button>
            </div>
            {notifyPermission === "default" ? (
              <button
                type="button"
                onClick={() => requestPermission()}
                className="mt-2 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[12.5px] font-bold transition-opacity active:opacity-70"
                style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}
              >
                開啟通知，靠近時提醒我
              </button>
            ) : null}
          </div>
        ) : (
          <div className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
            點「提醒」後再點地圖上的倒垃圾位置，垃圾車靠近 300 公尺內可提醒你。
          </div>
        )}
      </div>
    </div>
  );
}
