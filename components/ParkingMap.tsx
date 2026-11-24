"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { DivIcon, LayerGroup, Map as LeafletMap, Marker } from "leaflet";
import { statusBarColor } from "@/lib/status";
import type { Status } from "@/lib/data";
import { OLD_STREET_CENTER, formatDistance, haversineMeters } from "@/lib/tycgParking";
import type { UserLocation } from "@/lib/useUserLocation";
import styles from "./TouristInterior.module.css";

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

export type ParkingMapPlace = {
  id: string;
  name: string;
  type: "business" | "landmark";
  address: string | null;
  category: string;
  keywords: string[];
  lat: number;
  lng: number;
};

export type ParkingMapSelection = { kind: "place"; place: ParkingMapPlace } | { kind: "lot"; id: string };

const DAXI_CENTER: [number, number] = [OLD_STREET_CENTER.lat, OLD_STREET_CENTER.lng];
const OLD_STREET: ParkingMapPlace = {
  id: "__old-street",
  name: "大溪老街",
  type: "landmark",
  category: "景點",
  address: "大溪區和平路",
  keywords: [],
  ...OLD_STREET_CENTER,
};

function normalize(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function matchRank(query: string, name: string, keywords: Array<string | null>): number {
  const normalizedName = normalize(name);
  if (normalizedName === query) return 0;
  if (normalizedName.startsWith(query)) return 1;
  if (normalizedName.includes(query)) return 2;
  return keywords.some((word) => word && normalize(word).includes(query)) ? 3 : -1;
}

function makePopup(lot: ParkingMapLot, userLocation: UserLocation | null, selectedPlace: ParkingMapPlace | null) {
  const popup = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = lot.name;
  const detail = document.createElement("p");
  const origin = selectedPlace ?? userLocation;
  const distance = formatDistance(origin ? haversineMeters(origin, lot) : lot.distanceMeters);
  const distanceLabel = selectedPlace ? "距目的地" : userLocation ? "距你" : "距老街";
  detail.textContent = `${lot.availability} · ${distanceLabel} ${distance}`;
  const link = document.createElement("a");
  link.href = lot.mapsUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.dataset.parkingNavigation = "map";
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

function fitParkingOverview(map: LeafletMap, lots: ParkingMapLot[]) {
  if (lots.length === 0) {
    map.setView(DAXI_CENTER, 15);
    return;
  }
  const nearby = lots.filter((lot) => lot.distanceMeters < 3000);
  const initialLots = nearby.length ? nearby : lots;
  map.fitBounds(initialLots.map((lot): [number, number] => [lot.lat, lot.lng]), { padding: [25, 25], maxZoom: 16 });
}

export default function ParkingMap({
  lots,
  destinations,
  userLocation,
  selectedPlace,
  selectedLot,
  nearbyLots,
  onSelect,
}: {
  lots: ParkingMapLot[];
  destinations: ParkingMapPlace[];
  userLocation: UserLocation | null;
  selectedPlace: ParkingMapPlace | null;
  selectedLot?: ParkingMapLot;
  nearbyLots: Array<ParkingMapLot & { distance: number }>;
  onSelect: (selection: ParkingMapSelection | null) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsId = useId();
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const lotLayerRef = useRef<LayerGroup | null>(null);
  const landmarkLayerRef = useRef<LayerGroup | null>(null);
  const userLayerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const fittedRef = useRef(false);
  const focusedSelectionRef = useRef<string | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [locateUnavailable, setLocateUnavailable] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const normalized = normalize(query);
  const showResults = searching && normalized.length > 0;
  const results = useMemo(() => {
    if (!showResults) return [];
    const places = destinations.some((place) => place.name === OLD_STREET.name) ? destinations : [OLD_STREET, ...destinations];
    return [
      ...places.map((place) => ({
        key: `place:${place.id}`,
        name: place.name,
        detail: [place.category, place.address].filter(Boolean).join(" · "),
        rank: matchRank(normalized, place.name, [place.category, place.address, ...place.keywords]),
        selection: { kind: "place", place } as const,
      })),
      ...lots.map((lot) => ({
        key: `lot:${lot.id}`,
        name: lot.name,
        detail: ["停車場", lot.address].filter(Boolean).join(" · "),
        rank: matchRank(normalized, lot.name, ["停車場", lot.address]),
        selection: { kind: "lot", id: lot.id } as const,
      })),
    ].filter(({ rank }) => rank >= 0).sort((a, b) => a.rank - b.rank).slice(0, 8);
  }, [destinations, lots, normalized, showResults]);
  const nearest = nearbyLots[0];
  const focusedLot = nearest ?? selectedLot;

  function choose(result: (typeof results)[number]) {
    onSelect(result.selection);
    setQuery(result.name);
    setSearching(false);
    setLocateUnavailable(false);
  }

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
      focusedSelectionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = lotLayerRef.current;
    if (!mapReady || !L || !map || !layer) return;
    const markers = markersRef.current;
    const visibleIds = new Set(lots.map((lot) => lot.id));
    const highlightedIds = new Set(nearbyLots.map((lot) => lot.id));
    if (selectedLot) highlightedIds.add(selectedLot.id);
    markers.forEach((marker, id) => {
      if (visibleIds.has(id)) return;
      layer.removeLayer(marker);
      markers.delete(id);
    });
    lots.forEach((lot) => {
      const point: [number, number] = [lot.lat, lot.lng];
      const icon = buildLotIcon(L, lot.status, highlightedIds.has(lot.id));
      const offset = lot.id === focusedLot?.id ? 1000 : 0;
      const popup = makePopup(lot, userLocation, selectedPlace);
      const existing = markers.get(lot.id);
      if (existing) {
        existing.setLatLng(point).setIcon(icon).setZIndexOffset(offset).setPopupContent(popup);
      } else {
        const marker = L.marker(point, { icon, title: lot.name, alt: lot.name, zIndexOffset: offset })
          .bindPopup(popup).addTo(layer);
        markers.set(lot.id, marker);
      }
    });
    if (!fittedRef.current && lots.length) {
      fitParkingOverview(map, lots);
      fittedRef.current = true;
    }
  }, [focusedLot, lots, mapReady, nearbyLots, selectedLot, selectedPlace, userLocation]);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = landmarkLayerRef.current;
    if (!mapReady || !L || !layer) return;
    layer.clearLayers();
    if (selectedPlace) {
      const label = document.createElement("strong");
      label.textContent = selectedPlace.name;
      L.circleMarker([selectedPlace.lat, selectedPlace.lng], { color: "#9c4c0c", fillColor: "#db8b35", fillOpacity: 1, radius: 9 })
        .bindTooltip(label, { direction: "top", permanent: true }).addTo(layer);
    }
  }, [mapReady, selectedPlace]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const key = selectedPlace ? `place:${selectedPlace.id}:${nearest?.id ?? ""}` : selectedLot ? `lot:${selectedLot.id}` : null;
    if (key === focusedSelectionRef.current) return;
    focusedSelectionRef.current = key;
    map.closePopup();
    if (selectedPlace && nearest) {
      map.fitBounds([[selectedPlace.lat, selectedPlace.lng], [nearest.lat, nearest.lng]], { padding: [40, 40], maxZoom: 17 });
    } else if (selectedPlace) {
      map.setView([selectedPlace.lat, selectedPlace.lng], 16);
    } else if (selectedLot) {
      map.setView([selectedLot.lat, selectedLot.lng], 16);
      markersRef.current.get(selectedLot.id)?.openPopup();
    }
  }, [mapReady, nearest, selectedLot, selectedPlace]);

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
      <form
        role="search"
        className="flex items-center gap-2 border-b p-2.5"
        style={{ borderColor: "var(--line)" }}
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) choose(results[0]);
        }}
      >
        <input
          ref={searchRef}
          type="search"
          aria-label="搜尋店家、小吃、景點或停車場"
          aria-controls={showResults ? resultsId : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onSelect(null);
            setSearching(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && showResults) {
              event.preventDefault();
              setSearching(false);
            }
          }}
          onFocus={() => { if (!selectedPlace && !selectedLot) setSearching(true); }}
          placeholder="店家、小吃、景點、停車場"
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
      </form>
      {showResults ? (
        <div id={resultsId} className={styles.parkingSearchResults}>
          {results.length ? (
            <ul aria-label="停車地圖搜尋結果">
              {results.map((result) => (
                <li key={result.key}>
                  <button type="button" onClick={() => choose(result)}>
                    <strong>{result.name}</strong>
                    <small>{result.detail}</small>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p role="status">找不到「{query}」，可試試店名、地址或小吃名稱。</p>}
        </div>
      ) : null}
      {selectedPlace || selectedLot ? (
        <div className={styles.parkingSearchSummary}>
          <div role="status">
            {selectedPlace ? (
              nearest ? (
                <>
                  <small>距「{selectedPlace.name}」最近</small>
                  <strong>{nearest.name}</strong>
                  <small>直線距離 {formatDistance(nearest.distance)} · {nearest.availability}</small>
                </>
              ) : <strong>目前沒有可比較的停車場資料。</strong>
            ) : (
              <>
                <strong>{selectedLot?.name}</strong>
                <small>{selectedLot?.availability}</small>
              </>
            )}
          </div>
          <div className={styles.parkingSearchActions}>
            {focusedLot ? (
              <a className={styles.navigation} href={focusedLot.mapsUrl} data-parking-navigation="summary" target="_blank" rel="noopener noreferrer">
                開車導航 <span aria-hidden>↗</span>
              </a>
            ) : null}
            <button type="button" onClick={() => {
              onSelect(null);
              setQuery("");
              setSearching(false);
              searchRef.current?.focus();
              if (mapRef.current) fitParkingOverview(mapRef.current, lots);
            }}>清除選擇</button>
          </div>
        </div>
      ) : null}
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
    </div>
  );
}
