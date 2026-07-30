"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CircleMarker, DivIcon, LayerGroup, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import type { BusPosition } from "@/lib/busPositions";
import type { BusEtaStop, BusRouteMatch } from "@/lib/tdxBusRoutes";
import { animateMarkerTo } from "@/lib/leafletAnimate";
import { calculateDistance } from "@/lib/geo";
import { useUserLocation } from "@/lib/useUserLocation";

type LeafletModule = typeof import("leaflet");
type LoadState = "loading" | "ready" | "empty" | "error";
type RouteSearchState = "idle" | "loading" | "ready" | "error";

const DAXI_CENTER: [number, number] = [24.8809, 121.2868];
const REFRESH_SECONDS = 15;
const SEARCH_DEBOUNCE_MS = 400;
// ~500-1000m visible radius on a typical phone-width map.
const LOCATE_ZOOM = 16;
const DAXI_MAP_LOCATION = { lat: DAXI_CENTER[0], lng: DAXI_CENTER[1] };
const DAXI_SERVICE_RADIUS_METERS = 12_000;
const OLD_STREET_LOCATION = { lat: 24.8833, lng: 121.2862 };
const DEMO_BUS_SOURCES = [
  { id: "demo-5097-01", route: "5097", lat: 24.8838, lng: 121.2865, speedKmh: 18 },
  { id: "demo-5097-02", route: "5097", lat: 24.8816, lng: 121.2891, speedKmh: 12 },
  { id: "demo-5101-01", route: "5101", lat: 24.8848, lng: 121.2848, speedKmh: 8 },
] as const;

function readDemoLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("appstoreDemo") === "old-street" ? OLD_STREET_LOCATION : null;
}

function demoBuses(): BusPosition[] {
  const gpsTime = new Date().toISOString();
  return DEMO_BUS_SOURCES.map((bus) => ({
    ...bus,
    gpsTime,
    distanceMeters: calculateDistance(OLD_STREET_LOCATION.lat, OLD_STREET_LOCATION.lng, bus.lat, bus.lng),
  }));
}

function formatTime(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value));
}

function routeDirectionLabel(route: BusRouteMatch) {
  const firstStop = route.stops[0]?.name;
  const lastStop = route.stops[route.stops.length - 1]?.name;
  return `${route.departure || firstStop || "起點"} → 往 ${route.destination || lastStop || "目的地"}`;
}

function routeKey(route: BusRouteMatch) {
  return `${route.routeUID}-${route.direction}-${route.departure}-${route.destination}`;
}

function TimetableSheet({
  route,
  stops,
  state,
  onClose,
}: {
  route: BusRouteMatch;
  stops: BusEtaStop[];
  state: RouteSearchState;
  onClose: () => void;
}) {
  return (
    <div className="mt-3 rounded-3xl px-3 pb-3 pt-3" style={{ background: "var(--card)", border: "1px solid var(--line)", boxShadow: "var(--shadow-card)" }}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-[0.14em]" style={{ color: "var(--block-wood-deep)" }}>
              路線時刻
            </div>
            <h2 className="text-[17px] font-black leading-tight" style={{ color: "var(--ink)" }}>
              {route.routeName} 路
            </h2>
            <div className="mt-0.5 text-[12px] font-semibold" style={{ color: "var(--river-teal)" }}>
              {routeDirectionLabel(route)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉時刻表"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {state === "loading" ? (
          <div className="rounded-2xl px-4 py-5 text-center text-[12.5px]" style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}>
            載入站牌時刻中…
          </div>
        ) : null}

        {state === "error" ? (
          <div className="rounded-2xl px-4 py-5 text-center text-[12.5px] font-semibold" style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}>
            時刻表暫時無法載入
          </div>
        ) : null}

        {state === "ready" && stops.length === 0 ? (
          <div className="rounded-2xl px-4 py-5 text-center text-[12.5px]" style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}>
            此方向暫無站牌時刻資料
          </div>
        ) : null}

        {stops.length > 0 ? (
          <div className="max-h-72 overflow-auto rounded-2xl" style={{ border: "1px solid var(--line)" }}>
            {stops.map((stop) => (
              <div key={`${stop.sequence}-${stop.stopName}`} className="flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0" style={{ borderColor: "var(--line)" }}>
                <span className="min-w-0 text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
                  {stop.sequence}. {stop.stopName}
                </span>
                <span className="shrink-0 rounded-full px-2 py-1 text-[11px] font-bold" style={{ background: stop.estimateMinutes !== null && stop.estimateMinutes <= 3 ? "var(--daxi-red-soft)" : "var(--paper-2)", color: stop.estimateMinutes !== null && stop.estimateMinutes <= 3 ? "var(--daxi-red)" : "var(--ink-soft)" }}>
                  {stop.state}
                </span>
              </div>
            ))}
          </div>
        ) : null}
    </div>
  );
}

export default function BusMap({ compact = false }: { compact?: boolean }) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const busLayerRef = useRef<LayerGroup | null>(null);
  const busMarkersRef = useRef<Map<string, Marker>>(new Map());
  const locationMarkerRef = useRef<CircleMarker | null>(null);

  const [state, setState] = useState<LoadState>("loading");
  const [buses, setBuses] = useState<BusPosition[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const userLocation = useUserLocation();
  const demoLocation = readDemoLocation();
  const activeLocation = demoLocation ?? userLocation;
  const useActualLocationForMap = Boolean(
    activeLocation &&
      calculateDistance(activeLocation.lat, activeLocation.lng, DAXI_MAP_LOCATION.lat, DAXI_MAP_LOCATION.lng) <=
        DAXI_SERVICE_RADIUS_METERS,
  );
  const mapLocation = useActualLocationForMap && activeLocation ? activeLocation : DAXI_MAP_LOCATION;

  const [routeMatches, setRouteMatches] = useState<BusRouteMatch[]>([]);
  const [routeSearchState, setRouteSearchState] = useState<RouteSearchState>("idle");
  const [selectedRouteUID, setSelectedRouteUID] = useState<string | null>(null);
  const [etaStops, setEtaStops] = useState<BusEtaStop[]>([]);
  const [etaState, setEtaState] = useState<RouteSearchState>("idle");
  const [timetableOpen, setTimetableOpen] = useState(false);

  // Route/stop search — a tourist may not know the route number, so the
  // same box matches on destination or any stop name along the route too.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRouteMatches([]);
      setRouteSearchState("idle");
      setSelectedRouteUID(null);
      setTimetableOpen(false);
      return;
    }
    setRouteSearchState("loading");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/bus/routes?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("route search failed");
        const data = (await response.json()) as { routes: BusRouteMatch[] };
        setRouteMatches(data.routes);
        setRouteSearchState("ready");
        setSelectedRouteUID((prev) => {
	          if (prev && data.routes.some((r) => routeKey(r) === prev)) return prev;
	          return data.routes[0] ? routeKey(data.routes[0]) : null;
        });
      } catch {
        setRouteMatches([]);
        setRouteSearchState("error");
        setSelectedRouteUID(null);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const selectedRoute = useMemo(
    () => routeMatches.find((r) => routeKey(r) === selectedRouteUID) ?? null,
    [routeMatches, selectedRouteUID]
  );

  // Timetable-style ETA lookup for whichever matched route is selected.
  useEffect(() => {
    if (!selectedRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEtaStops([]);
      setEtaState("idle");
      return;
    }
    let cancelled = false;
    setEtaState("loading");
    (async () => {
      try {
        const response = await fetch(
          `/api/bus/eta?route=${encodeURIComponent(selectedRoute.routeName)}&direction=${selectedRoute.direction}`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("eta failed");
        const data = (await response.json()) as { stops: BusEtaStop[] };
        if (cancelled) return;
        setEtaStops(data.stops);
        setEtaState("ready");
      } catch {
        if (cancelled) return;
        setEtaStops([]);
        setEtaState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedRoute]);

  const matchedRouteNames = useMemo(() => new Set(routeMatches.map((r) => r.routeName)), [routeMatches]);

  const filteredBuses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buses;
    if (matchedRouteNames.size > 0) return buses.filter((b) => matchedRouteNames.has(b.route));
    return buses.filter((b) => b.route.toLowerCase().includes(q));
  }, [buses, query, matchedRouteNames]);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      const L = await import("leaflet");
      if (cancelled || !mapNodeRef.current || mapRef.current) return;

      leafletRef.current = L;
      const map = L.map(mapNodeRef.current, { attributionControl: true, zoomControl: false }).setView(
        [mapLocation.lat, mapLocation.lng],
        useActualLocationForMap ? LOCATE_ZOOM : 14,
      );
      mapRef.current = map;
      map.attributionControl.setPrefix("");

      if (activeLocation) {
        locationMarkerRef.current = L.circleMarker([activeLocation.lat, activeLocation.lng], {
          radius: 8,
          color: "#ffffff",
          weight: 3,
          fillColor: "#4a7594",
          fillOpacity: 1,
        })
          .bindTooltip(demoLocation ? "目前位置・大溪老街" : "目前位置", { direction: "top", opacity: 0.95 })
          .addTo(map);
      }

      tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      busLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => map.invalidateSize(), 120);

    }

    setupMap();
    return () => {
      cancelled = true;
      tileRef.current?.remove();
      locationMarkerRef.current?.remove();
      locationMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [activeLocation, demoLocation, mapLocation, useActualLocationForMap]);

  const busIcon = useCallback((L: LeafletModule): DivIcon => {
    return L.divIcon({
      className: "bus-marker",
      html: `<span aria-hidden="true">🚌</span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }, []);

  const loadBuses = useCallback(async () => {
    try {
      if (demoLocation) {
        const data = demoBuses();
        setBuses(data);
        setUpdatedAt(new Date().toISOString());
        setState("ready");
        return;
      }
      const query = activeLocation ? `?lat=${activeLocation.lat}&lng=${activeLocation.lng}` : "";
      const response = await fetch(`/api/bus/realtime${query}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load bus positions.");
      const data = (await response.json()) as { buses: BusPosition[]; updatedAt: string };
      setBuses(data.buses);
      setUpdatedAt(data.updatedAt);
      setState(data.buses.length > 0 ? "ready" : "empty");
    } catch {
      setState("error");
    }
  }, [activeLocation, demoLocation]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBuses();
    const interval = window.setInterval(loadBuses, REFRESH_SECONDS * 1000);
    return () => window.clearInterval(interval);
  }, [loadBuses]);

  // Marker sync is separate from the fetch — it re-runs whenever the search
  // query changes too, so typing a route number narrows the map, not just
  // the list below it.
  useEffect(() => {
    const L = leafletRef.current;
    const layer = busLayerRef.current;
    if (!L || !layer) return;

    const seenIds = new Set<string>();
    const markers = busMarkersRef.current;
    filteredBuses.forEach((bus) => {
      seenIds.add(bus.id);
      const existing = markers.get(bus.id);
      if (existing) {
        existing.setTooltipContent(`${bus.route}・${bus.speedKmh} km/h`);
        animateMarkerTo(existing, [bus.lat, bus.lng]);
      } else {
        const marker = L.marker([bus.lat, bus.lng], { icon: busIcon(L) })
          .bindTooltip(`${bus.route}・${bus.speedKmh} km/h`, { direction: "top", opacity: 0.95 })
          .addTo(layer);
        markers.set(bus.id, marker);
      }
    });
    markers.forEach((marker, id) => {
      if (!seenIds.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    });
  }, [filteredBuses, busIcon]);

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: "var(--line)" }}>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-3.5 py-2" style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--ink-soft)" }}>
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m20 20-4.3-4.3" />
          </svg>
	          <input
	            value={query}
	            onChange={(e) => setQuery(e.target.value)}
	            placeholder="輸入路線、目的地或站名"
	            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
	            style={{ color: "var(--ink)" }}
	          />
	        </div>
	      </div>

      {query.trim() ? (
        <div className="border-b px-3 py-3" style={{ borderColor: "var(--line)" }}>
          {routeSearchState === "loading" ? (
            <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
              搜尋路線中…
            </div>
          ) : null}

          {routeSearchState === "ready" && routeMatches.length === 0 ? (
            <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
              沒有找到符合「{query}」的路線、目的地或停靠站
            </div>
          ) : null}

          {routeSearchState === "error" ? (
            <div className="text-[12px]" style={{ color: "var(--daxi-red)" }}>
              路線搜尋暫時無法使用
            </div>
          ) : null}

          {routeMatches.length > 0 ? (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold tracking-[0.14em]" style={{ color: "var(--block-wood-deep)" }}>
                  選方向看時刻表
                </span>
                <span className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                  {routeMatches.length} 筆
                </span>
              </div>
              <div className="flex max-h-44 flex-col gap-2 overflow-auto">
                {routeMatches.map((route) => {
                  const key = routeKey(route);
                  const selected = selectedRouteUID === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        const changingRoute = selectedRouteUID !== key;
                        setSelectedRouteUID(key);
                        if (changingRoute) {
                          setEtaStops([]);
                          setEtaState("loading");
                        }
                        setTimetableOpen(true);
                      }}
                      className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-opacity active:opacity-70"
                      style={{
                        background: selected ? "var(--river-teal-soft)" : "var(--paper-2)",
                        border: selected ? "1px solid rgba(74,117,148,0.34)" : "1px solid var(--line)",
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block text-[13px] font-black" style={{ color: "var(--ink)" }}>
                          {route.routeName} 路
                        </span>
                        <span className="mt-0.5 block truncate text-[11.5px] font-semibold" style={{ color: "var(--river-teal)" }}>
                          {routeDirectionLabel(route)}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
                        時刻
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedRoute && timetableOpen ? (
                <TimetableSheet route={selectedRoute} stops={etaStops} state={etaState} onClose={() => setTimetableOpen(false)} />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={compact ? "relative h-[240px] min-h-0 sm:h-[300px]" : "relative h-[300px] min-h-[42vh]"}>
        <div ref={mapNodeRef} className="absolute inset-0" aria-label="以目前位置為中心的大溪周邊公車即時地圖" />
        <div className="pointer-events-none absolute left-3 right-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink)" }}>
            {filteredBuses.length > 0 ? `${filteredBuses.length} 輛` : state === "loading" ? "定位中" : "無符合公車"}
          </span>
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--river-teal)" }}>
            每 {REFRESH_SECONDS} 秒更新
          </span>
          {activeLocation ? (
            <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--block-wood-deep)" }}>
              {demoLocation ? "目前位置・大溪老街" : "目前位置"}
            </span>
          ) : null}
          {updatedAt ? (
            <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
              同步 {formatTime(updatedAt)}
            </span>
          ) : null}
        </div>
        {state === "error" ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--daxi-red)" }}>
            即時公車位置暫時無法載入
          </div>
        ) : null}
        {state === "empty" ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
            方圓 5 公里內目前沒有公車在路上
          </div>
        ) : null}
        {state === "ready" && query.trim() && filteredBuses.length === 0 ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
            {routeMatches.length > 0 ? "符合的路線目前沒有車在路上" : `找不到符合「${query}」的公車路線`}
          </div>
        ) : null}
      </div>

      {filteredBuses.length > 0 ? (
        <div className={compact ? "flex max-h-40 flex-col overflow-auto border-t sm:max-h-56" : "flex max-h-56 flex-col overflow-auto border-t"} style={{ borderColor: "var(--line)" }}>
          {filteredBuses.map((bus) => (
            <div key={bus.id} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
              <div>
                <div className="text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
                  {bus.route} 路
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                  距你 {bus.distanceMeters < 1000 ? `${Math.round(bus.distanceMeters)}m` : `${(bus.distanceMeters / 1000).toFixed(1)}km`}
                </div>
              </div>
              <div className="text-right text-[11px]" style={{ color: "var(--ink-soft)" }}>
                <div>{bus.speedKmh} km/h</div>
                <div className="mt-0.5">{bus.gpsTime ? `GPS ${formatTime(bus.gpsTime)}` : "即時位置"}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

	    </div>
	  );
	}
