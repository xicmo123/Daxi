"use client";

import { useCallback, useState } from "react";
import { calculateDistance } from "@/lib/geo";
import { getCurrentPosition } from "@/lib/geolocation";
import type { AEDStation } from "@/lib/aedService";

// Same rough walking pace already used for the parking page's distance
// labels — indicative only, not routed.
const WALK_METERS_PER_MINUTE = 80;

export type NearestAEDResult = {
  station: AEDStation;
  distanceMeters: number;
  walkMinutes: number;
};

export type GeoStatus = "idle" | "locating" | "success" | "denied" | "error";

export function useNearestAED(stations: AEDStation[]) {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [results, setResults] = useState<NearestAEDResult[]>([]);

  const findNearest = useCallback(() => {
    setStatus("locating");
    getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const ranked = stations
          .map((station) => {
            const distanceMeters = calculateDistance(latitude, longitude, station.lat, station.lng);
            return { station, distanceMeters, walkMinutes: Math.max(1, Math.round(distanceMeters / WALK_METERS_PER_MINUTE)) };
          })
          .sort((a, b) => a.distanceMeters - b.distanceMeters)
          .slice(0, 3);
        setResults(ranked);
        setStatus("success");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [stations]);

  return { status, results, findNearest };
}
