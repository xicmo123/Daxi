"use client";

import { motion } from "framer-motion";
import type { LiveParkingLot } from "@/lib/tycgParking";
import { walkTimeLabel } from "@/lib/experience";

export default function ParkingAlertBanner({
  occupancyPct,
  alternatives,
  lateBirdExtraMinutes,
}: {
  occupancyPct: number;
  alternatives: LiveParkingLot[];
  lateBirdExtraMinutes: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="safe-page-x pb-4 fade-in"
    >
      <div className="relative overflow-hidden rounded-2xl px-4 py-4" style={{ background: "var(--daxi-red)", color: "#fff" }}>
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

        <div className="relative flex items-start gap-2.5">
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="mt-0.5 shrink-0 text-[18px]"
            aria-hidden="true"
          >
            🚗💦
          </motion.span>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold leading-snug">
              老街周邊停車場已滿載 {occupancyPct}%，建議改停外圍
            </div>
            {lateBirdExtraMinutes > 0 ? (
              <div className="mt-1 text-[11.5px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                晚鳥逃脫預估：現在進場恐多花 {lateBirdExtraMinutes} 分鐘找車位
              </div>
            ) : null}
          </div>
        </div>

        {alternatives.length > 0 ? (
          <div className="relative mt-3 flex flex-col gap-1.5">
            {alternatives.map((lot) => (
              <a
                key={lot.name}
                href={lot.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-[12px] font-medium transition-opacity active:opacity-80"
                style={{ background: "rgba(255,255,255,0.16)" }}
              >
                <span className="truncate">{lot.name}</span>
                <span className="shrink-0" style={{ color: "rgba(255,255,255,0.85)" }}>
                  步行 {walkTimeLabel(lot.distanceMeters)}・剩 {lot.surplus ?? "—"}
                </span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
