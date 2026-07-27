"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DivIcon, LayerGroup, Map as LeafletMap, Polyline, TileLayer } from "leaflet";
import type { Business } from "@/lib/businesses";
import { amenityIcon, type Amenity } from "@/lib/amenities";
import type { WalkingRoute } from "@/lib/routesData";

type LeafletModule = typeof import("leaflet");

const DAXI_CENTER: [number, number] = [24.884, 121.288];

type FilterKey = "toilet" | "water" | "accessible";

export default function SpotsMap({
  spots,
  amenities: allAmenities,
  routes,
}: {
  spots: Business[];
  amenities: Amenity[];
  routes: WalkingRoute[];
}) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const spotLayerRef = useRef<LayerGroup | null>(null);
  const amenityLayerRef = useRef<LayerGroup | null>(null);
  const routeLayerRef = useRef<LayerGroup | null>(null);
  const routeLineRef = useRef<Polyline | null>(null);

  const [ready, setReady] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const accessibleOn = activeFilters.has("accessible");
  const showToilets = activeFilters.has("toilet");
  const showWater = activeFilters.has("water");

  const accessibleRouteOptions = useMemo(() => routes.filter((r) => r.isWheelchairFriendly), [routes]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(accessibleRouteOptions[0]?.id ?? null);
  const selectedRoute: WalkingRoute | null = useMemo(
    () => accessibleRouteOptions.find((r) => r.id === selectedRouteId) ?? null,
    [accessibleRouteOptions, selectedRouteId],
  );

  const toiletCount = useMemo(() => allAmenities.filter((a) => a.category === "公廁").length, [allAmenities]);
  const waterCount = useMemo(() => allAmenities.filter((a) => a.category === "飲水機").length, [allAmenities]);

  const toggleFilter = useCallback((key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Map setup — runs once.
  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      const L = await import("leaflet");
      if (cancelled || !mapNodeRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(mapNodeRef.current, { attributionControl: true, zoomControl: false }).setView(DAXI_CENTER, 15);
      mapRef.current = map;
      map.attributionControl.setPrefix("");

      tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      spotLayerRef.current = L.layerGroup().addTo(map);
      amenityLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => map.invalidateSize(), 120);
      setReady(true);
    }

    setupMap();
    return () => {
      cancelled = true;
      tileRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Spot markers — hidden while an accessible route is active, since the
  // route's own stops replace them as "the accessible places to see".
  useEffect(() => {
    const L = leafletRef.current;
    const layer = spotLayerRef.current;
    if (!ready || !L || !layer) return;

    layer.clearLayers();
    if (accessibleOn) return;

    spots.forEach((spot) => {
      L.marker([spot.lat, spot.lng], { icon: buildSpotIcon(L) })
        .bindPopup(`<div style="font-size:12.5px;font-weight:600;">${spot.name}</div>`)
        .addTo(layer);
    });
  }, [ready, spots, accessibleOn]);

  // Amenity markers (🚻 / 🚰), independent toggles.
  useEffect(() => {
    const L = leafletRef.current;
    const layer = amenityLayerRef.current;
    if (!ready || !L || !layer) return;

    layer.clearLayers();
    const visible: Amenity[] = allAmenities.filter(
      (a) => (a.category === "公廁" && showToilets) || (a.category === "飲水機" && showWater),
    );
    visible.forEach((a) => {
      L.marker([a.lat, a.lng], { icon: buildAmenityIcon(L, a.category) })
        .bindPopup(`<div style="font-size:12.5px;font-weight:600;">${amenityIcon(a.category)} ${a.name}</div>${a.note ? `<div style="font-size:11px;color:#7d6a58;">${a.note}</div>` : ""}`)
        .addTo(layer);
    });
  }, [ready, showToilets, showWater, allAmenities]);

  // Accessible route polyline + its stop markers, fit to bounds when turned on.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = routeLayerRef.current;
    if (!ready || !L || !map || !layer) return;

    layer.clearLayers();
    routeLineRef.current?.remove();
    routeLineRef.current = null;

    if (!accessibleOn || !selectedRoute) return;

    const path: Array<[number, number]> = selectedRoute.stops.map((s) => [s.lat, s.lng]);
    routeLineRef.current = L.polyline(path, {
      color: "var(--river-teal)",
      opacity: 0.85,
      weight: 5,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "1,10",
    }).addTo(map);

    selectedRoute.stops.forEach((stop, i) => {
      L.marker([stop.lat, stop.lng], { icon: buildRouteStopIcon(L, i + 1) })
        .bindPopup(`<div style="font-size:12.5px;font-weight:600;">${stop.name}</div>`)
        .addTo(layer);
    });

    map.flyToBounds(path, { padding: [40, 40], maxZoom: 17, duration: 0.6 });
  }, [ready, accessibleOn, selectedRoute]);

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--line)" }}>
        <FilterButton
          label="找廁所"
          emoji="🚻"
          active={showToilets}
          onClick={() => toggleFilter("toilet")}
        />
        <FilterButton
          label="飲水機"
          emoji="🚰"
          active={showWater}
          onClick={() => toggleFilter("water")}
        />
        <FilterButton
          label="無障礙路線"
          emoji="♿"
          active={accessibleOn}
          disabled={accessibleRouteOptions.length === 0}
          onClick={() => toggleFilter("accessible")}
        />
      </div>

      {accessibleOn && accessibleRouteOptions.length > 1 ? (
        <div className="flex flex-wrap gap-1.5 border-b px-3 py-2.5" style={{ borderColor: "var(--line)" }}>
          {accessibleRouteOptions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRouteId(r.id)}
              className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-opacity active:opacity-70"
              style={{
                background: selectedRouteId === r.id ? "var(--river-teal-soft)" : "var(--paper-2)",
                color: selectedRouteId === r.id ? "var(--river-teal)" : "var(--ink-soft)",
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative h-[380px] min-h-[50vh]">
        <div ref={mapNodeRef} className="absolute inset-0" aria-label="大溪景點與友善設施地圖" />
      </div>

      {showToilets && toiletCount === 0 ? (
        <EmptyNote>尚無公廁資料，資料建置中</EmptyNote>
      ) : null}
      {showWater && waterCount === 0 ? (
        <EmptyNote>尚無飲水機資料，資料建置中</EmptyNote>
      ) : null}

      {accessibleOn && selectedRoute ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-[12px]" style={{ color: "var(--ink-soft)" }}>
          <span>
            <span className="font-semibold" style={{ color: "var(--ink)" }}>
              {selectedRoute.name}
            </span>
            ・約 {(selectedRoute.totalDistanceMeters / 1000).toFixed(1)} 公里・{selectedRoute.estimatedMinutes} 分鐘
          </span>
          <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}>
            ♿ 無障礙友善
          </span>
        </div>
      ) : null}
    </div>
  );
}

function FilterButton({
  label,
  emoji,
  active,
  disabled = false,
  onClick,
}: {
  label: string;
  emoji: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className="flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70 disabled:opacity-45"
      style={{
        background: active ? "var(--river-teal-soft)" : "var(--paper-2)",
        color: active ? "var(--river-teal)" : "var(--ink-soft)",
        border: active ? "1px solid var(--river-teal)" : "1px solid var(--line)",
      }}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
    </button>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 text-[12px]" style={{ color: "var(--ink-soft)" }}>
      {children}
    </div>
  );
}

function buildSpotIcon(L: LeafletModule): DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:var(--daxi-red);border:2px solid #fff;box-shadow:0 6px 14px rgba(43,36,32,0.28);color:#fff;font-size:13px;">📍</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function buildAmenityIcon(L: LeafletModule, category: Amenity["category"]): DivIcon {
  const color = category === "公廁" ? "#4a7594" : "#5a8f6a";
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:${color};border:2px solid #fff;box-shadow:0 6px 14px rgba(43,36,32,0.28);font-size:14px;">${amenityIcon(category)}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function buildRouteStopIcon(L: LeafletModule, index: number): DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:var(--river-teal);border:2px solid #fff;box-shadow:0 6px 14px rgba(43,36,32,0.28);color:#fff;font-size:12px;font-weight:700;">${index}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}
