"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DivIcon, LayerGroup, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import type { BusPosition } from "@/lib/busPositions";
import type { BusEtaStop, BusRouteMatch } from "@/lib/tdxBusRoutes";
import { animateMarkerTo } from "@/lib/leafletAnimate";
import { getCurrentPosition } from "@/lib/geolocation";

type LeafletModule = typeof import("leaflet");
type LoadState = "loading" | "ready" | "empty" | "error";
type RouteSearchState = "idle" | "loading" | "ready" | "error";

const DAXI_CENTER: [number, number] = [24.8809, 121.2868];
const REFRESH_SECONDS = 15;
const SEARCH_DEBOUNCE_MS = 400;
// ~500-1000m visible radius on a typical phone-width map.
const LOCATE_ZOOM = 16;

function formatTime(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value));
}

export default function BusMap() {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const busLayerRef = useRef<LayerGroup | null>(null);
  const busMarkersRef = useRef<Map<string, Marker>>(new Map());

  const [state, setState] = useState<LoadState>("loading");
  const [buses, setBuses] = useState<BusPosition[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [routeMatches, setRouteMatches] = useState<BusRouteMatch[]>([]);
  const [routeSearchState, setRouteSearchState] = useState<RouteSearchState>("idle");
  const [selectedRouteUID, setSelectedRouteUID] = useState<string | null>(null);
  const [etaStops, setEtaStops] = useState<BusEtaStop[]>([]);
  const [etaState, setEtaState] = useState<RouteSearchState>("idle");

  // Route/stop search — a tourist may not know the route number, so the
  // same box matches on destination or any stop name along the route too.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRouteMatches([]);
      setRouteSearchState("idle");
      setSelectedRouteUID(null);
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
          if (prev && data.routes.some((r) => r.routeUID === prev)) return prev;
          return data.routes[0]?.routeUID ?? null;
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
    () => routeMatches.find((r) => r.routeUID === selectedRouteUID) ?? null,
    [routeMatches, selectedRouteUID]
  );

  // Chip labels: when two directions (or sub-routes) share the same display
  // name, show departure→destination so they're distinguishable.
  const routeChipLabels = useMemo(() => {
    const nameCounts = new Map<string, number>();
    routeMatches.forEach((r) => nameCounts.set(r.routeName, (nameCounts.get(r.routeName) ?? 0) + 1));
    const labels = new Map<string, string>();
    routeMatches.forEach((r) => {
      const count = nameCounts.get(r.routeName) ?? 1;
      labels.set(r.routeUID, count > 1 ? `${r.routeName}（往${r.destination || "?"}）` : r.routeName);
    });
    return labels;
  }, [routeMatches]);

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
      const map = L.map(mapNodeRef.current, { attributionControl: true, zoomControl: false }).setView(DAXI_CENTER, 14);
      mapRef.current = map;
      map.attributionControl.setPrefix("");

      tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      busLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => map.invalidateSize(), 120);

      getCurrentPosition(
        (position) => {
          if (cancelled || !mapRef.current) return;
          // The fix can arrive before the container has been measured, and
          // Leaflet silently ignores a fly on a zero-size map — measure first.
          mapRef.current.invalidateSize();
          mapRef.current.flyTo([position.coords.latitude, position.coords.longitude], LOCATE_ZOOM, { duration: 1 });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
      );
    }

    setupMap();
    return () => {
      cancelled = true;
      tileRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

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
      const response = await fetch("/api/bus/realtime", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load bus positions.");
      const data = (await response.json()) as { buses: BusPosition[]; updatedAt: string };
      setBuses(data.buses);
      setUpdatedAt(data.updatedAt);
      setState(data.buses.length > 0 ? "ready" : "empty");
    } catch {
      setState("error");
    }
  }, []);

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
            placeholder="搜尋車號、目的地或會經過的地點"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: "var(--ink)" }}
          />
        </div>
      </div>

      <div className="relative h-[300px] min-h-[42vh]">
        <div ref={mapNodeRef} className="absolute inset-0" aria-label="大溪周邊公車即時地圖" />
        <div className="pointer-events-none absolute left-3 right-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink)" }}>
            {filteredBuses.length > 0 ? `${filteredBuses.length} 輛` : state === "loading" ? "定位中" : "無符合公車"}
          </span>
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--river-teal)" }}>
            每 {REFRESH_SECONDS} 秒更新
          </span>
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
        <div className="flex max-h-56 flex-col overflow-auto border-t" style={{ borderColor: "var(--line)" }}>
          {filteredBuses.map((bus) => (
            <div key={bus.id} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
              <div>
                <div className="text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
                  {bus.route} 路
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                  距老街 {bus.distanceMeters < 1000 ? `${Math.round(bus.distanceMeters)}m` : `${(bus.distanceMeters / 1000).toFixed(1)}km`}
                </div>
              </div>
              <div className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                {bus.speedKmh} km/h
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {query.trim() ? (
        <div className="border-t px-4 py-3.5" style={{ borderColor: "var(--line)" }}>
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
            <>
              {routeMatches.length > 1 ? (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {routeMatches.map((r) => (
                    <button
                      key={r.routeUID}
                      type="button"
                      onClick={() => setSelectedRouteUID(r.routeUID)}
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity active:opacity-70"
                      style={{
                        background: selectedRouteUID === r.routeUID ? "var(--daxi-red-soft)" : "var(--paper-2)",
                        color: selectedRouteUID === r.routeUID ? "var(--daxi-red)" : "var(--ink-soft)",
                      }}
                    >
                      {routeChipLabels.get(r.routeUID) ?? r.routeName}
                    </button>
                  ))}
                </div>
              ) : null}

              {selectedRoute ? (
                <>
                  <div className="mb-2.5 text-[12px] font-semibold" style={{ color: "var(--ink)" }}>
                    {selectedRoute.routeName} 路　{selectedRoute.departure} → {selectedRoute.destination}
                  </div>

                  {etaState === "loading" ? (
                    <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                      載入時刻表中…
                    </div>
                  ) : null}

                  {etaState === "error" ? (
                    <div className="text-[12px]" style={{ color: "var(--daxi-red)" }}>
                      時刻表暫時無法載入
                    </div>
                  ) : null}

                  {etaState === "ready" && etaStops.length === 0 ? (
                    <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                      此路線暫無時刻表資料
                    </div>
                  ) : null}

                  {etaStops.length > 0 ? (
                    <div className="flex max-h-64 flex-col overflow-auto rounded-xl" style={{ border: "1px solid var(--line)" }}>
                      {etaStops.map((stop) => (
                        <div
                          key={`${stop.sequence}-${stop.stopName}`}
                          className="flex items-center justify-between px-3 py-2 border-b last:border-b-0"
                          style={{ borderColor: "var(--line)" }}
                        >
                          <span className="text-[12px]" style={{ color: "var(--ink)" }}>
                            {stop.sequence}. {stop.stopName}
                          </span>
                          <span
                            className="text-[11.5px] font-semibold"
                            style={{ color: stop.estimateMinutes !== null && stop.estimateMinutes <= 3 ? "var(--daxi-red)" : "var(--ink-soft)" }}
                          >
                            {stop.state}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
