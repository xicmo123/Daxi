"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DivIcon, LayerGroup, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import { statusBarColor } from "@/lib/status";
import type { Status } from "@/lib/data";

type LeafletModule = typeof import("leaflet");

export type ParkingMapLot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: "public" | "private";
  status?: Status;
  isFull?: boolean;
  note: string;
  mapsUrl?: string;
};

export type ParkingMapLandmark = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

const DAXI_CENTER: [number, number] = [24.884, 121.288];
const NEARBY_LOT_COUNT = 5;

// Always searchable even though it isn't a POI in the spots dataset — every
// "距老街" label in this app already measures from this exact point.
const OLD_STREET_LANDMARK: ParkingMapLandmark = { id: "__old-street", name: "大溪老街", lat: 24.8809, lng: 121.2868 };

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export default function ParkingMap({ lots, landmarks = [] }: { lots: ParkingMapLot[]; landmarks?: ParkingMapLandmark[] }) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const lotLayerRef = useRef<LayerGroup | null>(null);
  const landmarkLayerRef = useRef<LayerGroup | null>(null);
  const userMarkerLayerRef = useRef<LayerGroup | null>(null);
  const lotBoundsRef = useRef<Array<[number, number]>>([]);
  const lotMarkersRef = useRef<Map<string, Marker>>(new Map());

  const [locateState, setLocateState] = useState<"idle" | "locating" | "granted" | "denied">("idle");
  const [query, setQuery] = useState("");

  const allLandmarks = useMemo(() => [OLD_STREET_LANDMARK, ...landmarks], [landmarks]);

  const matchedLandmark = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allLandmarks.find((l) => l.name.toLowerCase().includes(q)) ?? null;
  }, [allLandmarks, query]);

  const matchedLotsByName = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || matchedLandmark) return [];
    return lots.filter((lot) => lot.name.toLowerCase().includes(q));
  }, [lots, query, matchedLandmark]);

  // Search never hides a lot — it either highlights the ones nearest a
  // matched landmark, or the ones whose own name matched.
  const highlightedLots = useMemo(() => {
    if (matchedLandmark) {
      return [...lots]
        .sort((a, b) => haversineMeters(matchedLandmark, a) - haversineMeters(matchedLandmark, b))
        .slice(0, NEARBY_LOT_COUNT);
    }
    if (matchedLotsByName.length > 0) return matchedLotsByName;
    return [];
  }, [lots, matchedLandmark, matchedLotsByName]);

  const noMatch = query.trim().length > 0 && !matchedLandmark && matchedLotsByName.length === 0;

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

      lotLayerRef.current = L.layerGroup().addTo(map);
      landmarkLayerRef.current = L.layerGroup().addTo(map);
      userMarkerLayerRef.current = L.layerGroup().addTo(map);

      const bounds: Array<[number, number]> = [];
      lots.forEach((lot) => {
        const color = lot.kind === "private" ? "var(--river-teal)" : lot.isFull ? "var(--ink-soft)" : statusBarColor[lot.status ?? "ok"];
        const marker = L.marker([lot.lat, lot.lng], { icon: buildLotIcon(L, color, false) }).addTo(lotLayerRef.current!);
        const popupHtml = `<div style="font-size:12.5px;font-weight:600;margin-bottom:2px;">${lot.name}</div><div style="font-size:11.5px;color:#7d6a58;">${lot.note}</div>${
          lot.mapsUrl ? `<a href="${lot.mapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size:11.5px;color:#4a7594;font-weight:600;">導航 →</a>` : ""
        }`;
        marker.bindPopup(popupHtml);
        lotMarkersRef.current.set(lot.id, marker);
        bounds.push([lot.lat, lot.lng]);
      });
      lotBoundsRef.current = bounds;
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [32, 32], maxZoom: 17 });

      setTimeout(() => map.invalidateSize(), 120);
    }

    setupMap();
    return () => {
      cancelled = true;
      tileRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // lots come from a server fetch that doesn't change after mount — the
    // map is built once and markers reflect the initial snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restyle (never remove) lot markers to reflect the current search, show/
  // hide the landmark pin, and fit the map to whatever's highlighted.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const lotLayer = lotLayerRef.current;
    const landmarkLayer = landmarkLayerRef.current;
    if (!L || !map || !lotLayer || !landmarkLayer) return;

    const highlightedIds = new Set(highlightedLots.map((lot) => lot.id));
    const bounds: Array<[number, number]> = [];
    lots.forEach((lot) => {
      const marker = lotMarkersRef.current.get(lot.id);
      if (!marker) return;
      const isHighlighted = highlightedIds.has(lot.id);
      const color = lot.kind === "private" ? "var(--river-teal)" : lot.isFull ? "var(--ink-soft)" : statusBarColor[lot.status ?? "ok"];
      marker.setIcon(buildLotIcon(L, color, isHighlighted));
      if (isHighlighted) bounds.push([lot.lat, lot.lng]);
    });

    landmarkLayer.clearLayers();
    if (matchedLandmark) {
      L.marker([matchedLandmark.lat, matchedLandmark.lng], { icon: buildLandmarkIcon(L) })
        .addTo(landmarkLayer)
        .bindPopup(`<div style="font-size:12.5px;font-weight:600;">${matchedLandmark.name}</div><div style="font-size:11px;color:#7d6a58;">附近 ${NEARBY_LOT_COUNT} 個停車場已標示</div>`)
        .openPopup();
      bounds.push([matchedLandmark.lat, matchedLandmark.lng]);
    }

    if (query.trim() && bounds.length > 0) {
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 17, duration: 0.6 });
    }
  }, [lots, highlightedLots, matchedLandmark, query]);

  const locateMe = useCallback(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = userMarkerLayerRef.current;
    if (!L || !map || !layer || !navigator.geolocation) {
      setLocateState("denied");
      return;
    }
    setLocateState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        layer.clearLayers();
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:#4a7594;border:3px solid #fff;box-shadow:0 0 0 4px rgba(74,117,148,0.28);"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([latitude, longitude], { icon }).addTo(layer).bindTooltip("你的位置", { direction: "top" });
        // Fit both the user and every lot in view — flying to the user alone
        // would strand the lots off-screen if their GPS fix is far off.
        const combined: Array<[number, number]> = [...lotBoundsRef.current, [latitude, longitude]];
        map.flyToBounds(combined, { padding: [40, 40], maxZoom: 16, duration: 0.8 });
        setLocateState("granted");
      },
      () => setLocateState("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  // Auto-locate on open, per the ask — button stays for re-centering later.
  useEffect(() => {
    const timer = window.setTimeout(() => locateMe(), 300);
    return () => window.clearTimeout(timer);
  }, [locateMe]);

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
            placeholder="搜尋景點，例如：大溪老街"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: "var(--ink)" }}
          />
        </div>
      </div>

      <div className="relative h-[380px] min-h-[50vh]">
        <div ref={mapNodeRef} className="absolute inset-0" aria-label="大溪周邊停車場地圖" />
        <button
          type="button"
          onClick={locateMe}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-opacity active:opacity-70"
          style={{ background: "var(--card)", color: locateState === "granted" ? "var(--river-teal)" : "var(--ink)" }}
          aria-label="定位我的位置"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" />
          </svg>
        </button>
        {locateState === "denied" ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
            無法取得你的位置，請確認瀏覽器定位權限
          </div>
        ) : null}
        {matchedLandmark ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink)" }}>
            已標示「{matchedLandmark.name}」附近 {Math.min(NEARBY_LOT_COUNT, lots.length)} 個停車場，其餘仍在地圖上
          </div>
        ) : noMatch ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink-soft)" }}>
            找不到「{query}」，試試景點名稱或停車場名稱
          </div>
        ) : null}
      </div>
    </div>
  );
}

function buildLotIcon(L: LeafletModule, color: string, highlighted: boolean): DivIcon {
  const size = highlighted ? 32 : 26;
  const ring = highlighted ? "border:3px solid var(--accent);box-shadow:0 0 0 3px rgba(160,106,58,0.25),0 6px 14px rgba(43,36,32,0.28);" : "border:2px solid #fff;box-shadow:0 6px 14px rgba(43,36,32,0.28);";
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:999px;background:${color};${ring}color:#fff;font-size:${highlighted ? 14 : 13}px;font-weight:700;">P</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function buildLandmarkIcon(L: LeafletModule): DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px 999px 999px 0;transform:rotate(45deg);background:var(--daxi-red);border:2px solid #fff;box-shadow:0 6px 14px rgba(43,36,32,0.3);"><span style="transform:rotate(-45deg);font-size:14px;">📍</span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}
