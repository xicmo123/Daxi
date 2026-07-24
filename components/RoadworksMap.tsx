"use client";

import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, TileLayer } from "leaflet";
import type { Roadwork } from "@/lib/taoyuanRoadworks";

type LeafletModule = typeof import("leaflet");

const DAXI_CENTER: [number, number] = [24.884, 121.288];
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function RoadworksMap() {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);

  const [roadworks, setRoadworks] = useState<Roadwork[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      const L = await import("leaflet");
      if (cancelled || !mapNodeRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(mapNodeRef.current, { attributionControl: true, zoomControl: false }).setView(DAXI_CENTER, 13);
      map.attributionControl.setPrefix("");
      mapRef.current = map;
      tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
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

    async function loadRoadworks() {
      try {
        const response = await fetch("/api/resident/roadworks", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load roadworks.");
        const data = (await response.json()) as { roadworks: Roadwork[]; syncedAt?: string; updatedAt?: string };
        if (cancelled) return;
        setRoadworks(data.roadworks);
        setSyncedAt(data.syncedAt ?? data.updatedAt ?? null);
        setState(data.roadworks.length > 0 ? "ready" : "empty");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    loadRoadworks();
    const interval = window.setInterval(loadRoadworks, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();

    const bounds: Array<[number, number]> = [];
    roadworks.forEach((item) => {
      if (item.points.length > 1) {
        L.polyline(item.points, { color: "#b8814c", opacity: 0.85, weight: 5 }).bindTooltip(item.location || item.name).addTo(layer);
        bounds.push(...item.points);
      } else if (item.points.length === 1) {
        L.circleMarker(item.points[0], {
          radius: 8,
          color: "#fff",
          fillColor: "#b8814c",
          fillOpacity: 1,
          weight: 2,
        })
          .bindTooltip(item.location || item.name)
          .addTo(layer);
        bounds.push(item.points[0]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
    }
  }, [roadworks]);

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--line)" }}>
        <div>
          <div className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
            今日道路施工
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
            {syncedAt ? `最後同步 ${formatTime(syncedAt)} · 每 10 分鐘` : "同步中 · 每 10 分鐘"}
          </div>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}>
          {state === "loading" ? "載入中" : `${roadworks.length} 件`}
        </span>
      </div>
      <div className="relative h-[360px]">
        <div ref={mapNodeRef} className="absolute inset-0" aria-label="大溪道路施工地圖" />
        {state === "empty" ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--ink)" }}>
            今日沒有大溪道路申挖資料
          </div>
        ) : null}
        {state === "error" ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-sm" style={{ background: "var(--card)", color: "var(--daxi-red)" }}>
            道路施工資料暫時無法載入
          </div>
        ) : null}
      </div>
      {roadworks.length > 0 ? (
        <div className="flex max-h-56 flex-col overflow-auto border-t" style={{ borderColor: "var(--line)" }}>
          {roadworks.map((item) => (
            <div key={item.id} className="px-4 py-3 border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
              <div className="text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
                {item.location || item.name}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                {item.start ?? "未提供開始時間"} - {item.stop ?? "未提供結束時間"}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
