"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { LiveParkingLot } from "@/lib/tycgParking";
import { walkTimeLabel } from "@/lib/experience";
import { calculateDistance } from "@/lib/geo";
import { useUserLocation } from "@/lib/useUserLocation";

export default function ParkingAlertBanner({
  occupancyPct,
  alternatives,
  lateBirdExtraMinutes,
}: {
  occupancyPct: number;
  alternatives: LiveParkingLot[];
  lateBirdExtraMinutes: number;
}) {
  const userLocation = useUserLocation();
  const locatedAlternatives = useMemo(
    () =>
      alternatives
        .map((lot) => ({ ...lot, distanceMeters: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, lot.lat, lot.lng) : lot.distanceMeters }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters),
    [alternatives, userLocation],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="safe-page-x pb-2 fade-in"
    >
      <div className="relative overflow-hidden rounded-xl px-3 py-2.5" style={{ background: "var(--daxi-red)", color: "#fff" }}>
        {/* Animated wave backdrop — reads as "actively filling up" rather than a static warning box. */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 opacity-20"
          viewBox="0 0 400 40"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.path
            d="M0 20 Q 50 0 100 20 T 200 20 T 300 20 T 400 20 V40 H0 Z"
            fill="#fff"
            animate={{ x: [-100, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        <div className="relative flex items-center gap-2.5">
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0 text-[15px]"
            aria-hidden="true"
          >
            🚗💦
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-bold leading-snug">
              老街周邊停車場已滿載 {occupancyPct}%，建議改停外圍
            </div>
            {lateBirdExtraMinutes > 0 ? (
              <div className="truncate text-[10.5px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                晚鳥逃脫預估：現在進場恐多花 {lateBirdExtraMinutes} 分鐘找車位
              </div>
            ) : null}
          </div>
        </div>

        {locatedAlternatives.length > 0 ? (
          <div className="relative mt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {locatedAlternatives.slice(0, 2).map((lot) => (
              <a
                key={lot.name}
                href={lot.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-opacity active:opacity-80"
                style={{ background: "rgba(255,255,255,0.16)" }}
              >
                <span className="truncate">{lot.name}</span>
                <span className="shrink-0" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {walkTimeLabel(lot.distanceMeters)}・剩 {lot.surplus ?? "—"}
                </span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
