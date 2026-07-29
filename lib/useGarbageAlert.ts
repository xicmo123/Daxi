"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calculateDistance } from "@/lib/geo";
import type { GarbageRealtime } from "@/lib/taoyuanGarbage";

const STORAGE_KEY = "daxi-garbage-alert-point";
const ALERT_DISTANCE_METERS = 300;
const POLL_INTERVAL_MS = 15000; // matches GarbageTruckMap's own refresh cadence
// Once notified, don't fire again for the same pass — the truck can idle or
// crawl within 300m for several polls in a row.
const RENOTIFY_COOLDOWN_MS = 10 * 60 * 1000;

export type GarbageAlertPoint = { lat: number; lng: number };
export type NotificationPermissionState = "unsupported" | "default" | "granted" | "denied";

function readStoredPoint(): GarbageAlertPoint | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") return parsed;
    return null;
  } catch {
    return null;
  }
}

// Periodically compares all live Daxi garbage-truck positions against a
// user-set "my drop-off point" (persisted in localStorage) and
// fires a browser Notification once a truck comes within 300m.
export function useGarbageAlert() {
  const [point, setPointState] = useState<GarbageAlertPoint | null>(() =>
    typeof window === "undefined" ? null : readStoredPoint(),
  );
  const [permission, setPermission] = useState<NotificationPermissionState>(() => {
    if (typeof window === "undefined") return "default";
    return typeof window.Notification === "undefined" ? "unsupported" : (Notification.permission as NotificationPermissionState);
  });
  const lastNotifiedAtRef = useRef(0);

  const setPoint = useCallback((next: GarbageAlertPoint | null) => {
    setPointState(next);
    lastNotifiedAtRef.current = 0;
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage can throw in private-browsing modes — the point still
      // works for this session via state, it just won't persist.
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window.Notification === "undefined") {
      setPermission("unsupported");
      return "unsupported" as const;
    }
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermissionState);
    return result;
  }, []);

  useEffect(() => {
    if (!point || permission !== "granted") return;
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/resident/garbage/realtime", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as GarbageRealtime;
        if (cancelled || !point) return;

        let nearestMeters = Infinity;
        for (const vehicle of data.vehicles) {
          const d = calculateDistance(point.lat, point.lng, vehicle.lat, vehicle.lng);
          if (d < nearestMeters) nearestMeters = d;
        }

        if (nearestMeters <= ALERT_DISTANCE_METERS) {
          const now = Date.now();
          if (now - lastNotifiedAtRef.current > RENOTIFY_COOLDOWN_MS) {
            lastNotifiedAtRef.current = now;
            new Notification("垃圾車即將抵達", {
              body: `距離你設定的倒垃圾點剩餘約 ${Math.round(nearestMeters)} 公尺！`,
              icon: "/icon-192.png",
              tag: "daxi-garbage-alert",
            });
          }
        }
      } catch {
        // Transient network hiccup — the next poll retries; nothing to alert.
      }
    }

    check();
    const interval = window.setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [point, permission]);

  return { point, setPoint, permission, requestPermission };
}
