"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DivIcon, LayerGroup, Map as LeafletMap, Marker } from "leaflet";
import { statusBarColor } from "@/lib/status";
import type { Status } from "@/lib/data";
import { OLD_STREET_CENTER, formatDistance, haversineMeters } from "@/lib/tycgParking";
import type { UserLocation } from "@/lib/useUserLocation";

type LeafletModule = typeof import("leaflet");

export type ParkingMapLot = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  status: Status | null;
  availability: string;
  distanceMeters: number;
  mapsUrl: string;
};

export type ParkingMapLandmark = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

const NEARBY_LOT_COUNT = 5;
const DAXI_CENTER: [number, number] = [OLD_STREET_CENTER.lat, OLD_STREET_CENTER.lng];
const OLD_STREET_LANDMARK: ParkingMapLandmark = { id: "__old-street", name: "大溪老街", ...OLD_STREET_CENTER };

function makePopup(lot: ParkingMapLot, userLocation: UserLocation | null) {
  const popup = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = lot.name;
  const detail = document.createElement("p");
  const distance = formatDistance(userLocation ? haversineMeters(userLocation, lot) : lot.distanceMeters);
  detail.textContent = `${lot.availability} · ${userLocation ? "距你" : "距老街"} ${distance}`;
  const link = document.createElement("a");
  link.href = lot.mapsUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "開車導航 →";
  popup.append(name, detail, link);
  return popup;
}

function buildLotIcon(L: LeafletModule, status: Status | null, highlighted: boolean): DivIcon {
  const size = highlighted ? 32 : 26;
  const color = status === null ? "#6b625a" : status === "full" ? "#9b3c30" : statusBarColor[status];
  const ring = highlighted ? "box-shadow:0 0 0 3px var(--accent);" : "";
  return L.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;${ring}color:#fff;font-size:13px;font-weight:750;">P</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function ParkingMap({
  lots,
  landmarks,
  userLocation,
}: {
  lots: ParkingMapLot[];
  landmarks: ParkingMapLandmark[];
  userLocation: UserLocation | null;
}) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const lotLayerRef = useRef<LayerGroup | null>(null);
  const landmarkLayerRef = useRef<LayerGroup | null>(null);
  const userLayerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const fittedRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [locateUnavailable, setLocateUnavailable] = useState(false);
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const matchedLandmark = normalized
    ? [OLD_STREET_LANDMARK, ...landmarks].find((landmark) => landmark.name.toLowerCase().includes(normalized))
    : undefined;
  const highlightedLots = useMemo(() => {
    if (!normalized) return [];
    if (matchedLandmark) {
      return [...lots]
        .sort((a, b) => haversineMeters(matchedLandmark, a) - haversineMeters(matchedLandmark, b))
        .slice(0, NEARBY_LOT_COUNT);
    }
    return lots.filter((lot) => lot.name.toLowerCase().includes(normalized));
  }, [lots, matchedLandmark, normalized]);

  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;
    import("leaflet").then((L) => {
      if (cancelled || !mapNodeRef.current) return;
      leafletRef.current = L;
      const map = L.map(mapNodeRef.current, { scrollWheelZoom: false }).setView(DAXI_CENTER, 15);
      mapRef.current = map;
      map.attributionControl.setPrefix(false);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      lotLayerRef.current = L.layerGroup().addTo(map);
      landmarkLayerRef.current = L.layerGroup().addTo(map);
      userLayerRef.current = L.layerGroup().addTo(map);
      setMapReady(true);
    }).catch(() => {
      if (!cancelled) setMapFailed(true);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markers.clear();
      fittedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = lotLayerRef.current;
    if (!mapReady || !L || !map || !layer) return;
    const markers = markersRef.current;
    const visibleIds = new Set(lots.map((lot) => lot.id));
    const highlightedIds = new Set(highlightedLots.map((lot) => lot.id));
    markers.forEach((marker, id) => {
      if (visibleIds.has(id)) return;
      layer.removeLayer(marker);
      markers.delete(id);
    });
    lots.forEach((lot) => {
      const point: [number, number] = [lot.lat, lot.lng];
      const icon = buildLotIcon(L, lot.status, highlightedIds.has(lot.id));
      const existing = markers.get(lot.id);
      if (existing) {
        existing.setLatLng(point).setIcon(icon).setPopupContent(makePopup(lot, userLocation));
      } else {
        const marker = L.marker(point, { icon, title: lot.name, alt: lot.name })
          .bindPopup(makePopup(lot, userLocation)).addTo(layer);
        markers.set(lot.id, marker);
      }
    });
    if (!fittedRef.current && lots.length) {
      const nearby = lots.filter((lot) => lot.distanceMeters < 3000);
      const initialLots = nearby.length ? nearby : lots;
      map.fitBounds(initialLots.map((lot): [number, number] => [lot.lat, lot.lng]), { padding: [25, 25], maxZoom: 16 });
      fittedRef.current = true;
    }
  }, [highlightedLots, lots, mapReady, userLocation]);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = landmarkLayerRef.current;
    if (!mapReady || !L || !layer) return;
    layer.clearLayers();
    if (matchedLandmark) {
      const label = document.createElement("strong");
      label.textContent = matchedLandmark.name;
      L.circleMarker([matchedLandmark.lat, matchedLandmark.lng], { color: "#a06a3a", fillOpacity: 0.95 })
        .bindPopup(label).addTo(layer);
    }
  }, [mapReady, matchedLandmark]);

  const locateMe = useCallback(() => {
    const map = mapRef.current;
    if (!userLocation || !mapReady || !map) {
      setLocateUnavailable(true);
      return;
    }
    setLocateUnavailable(false);
    map.setView([userLocation.lat, userLocation.lng], 16);
  }, [mapReady, userLocation]);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = userLayerRef.current;
    if (!mapReady || !L || !layer || !userLocation) return;
    layer.clearLayers();
    L.circleMarker([userLocation.lat, userLocation.lng], { color: "#4a7594", fillOpacity: 1 })
      .bindTooltip("你的位置").addTo(layer);
  }, [mapReady, userLocation]);

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="flex items-center gap-2 border-b p-2.5" style={{ borderColor: "var(--line)" }}>
        <input
          type="search"
          aria-label="搜尋景點或停車場"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜尋景點或停車場"
          className="min-h-11 min-w-0 flex-1 rounded-xl border px-3 text-base"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        />
        <button
          type="button"
          onClick={locateMe}
          className="min-h-11 shrink-0 rounded-xl px-2.5 text-app-label font-bold"
          style={{ background: "var(--paper-2)" }}
        >
          定位
        </button>
      </div>
      <div
        ref={mapNodeRef}
        className="relative isolate h-[282px] md:h-[402px]"
        style={{ background: "var(--paper-2)" }}
        aria-label="大溪周邊停車場地圖"
      >
        {mapFailed ? <p className="p-4 text-app-body">地圖暫時無法載入，請從停車場清單開啟導航。</p> : null}
      </div>
      {locateUnavailable && !userLocation ? (
        <p role="status" className="p-3 text-app-label">目前無法取得定位，清單仍可依老街距離瀏覽。</p>
      ) : null}
      {normalized ? (
        <p role="status" className="p-3 text-app-label">
          {highlightedLots.length ? `已在地圖標示 ${highlightedLots.length} 個停車場` : `找不到「${query}」附近或同名的停車場`}
        </p>
      ) : null}
    </div>
  );
}
