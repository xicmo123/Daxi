"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calculateDistance } from "@/lib/geo";
import {
  NOTIFICATION_IDS,
  currentPermission,
  notificationsSupported,
  notifyNow,
  requestNotificationPermission,
  type NotificationPermissionState,
} from "@/lib/notifications";
import type { GarbageRealtime } from "@/lib/taoyuanGarbage";

const STORAGE_KEY = "daxi-garbage-alert-point";
const ALERT_DISTANCE_METERS = 300;
const POLL_INTERVAL_MS = 15000; // matches GarbageTruckMap's own refresh cadence
// Once notified, don't fire again for the same pass — the truck can idle or
// crawl within 300m for several polls in a row.
const RENOTIFY_COOLDOWN_MS = 10 * 60 * 1000;

export type GarbageAlertPoint = { lat: number; lng: number };
export type { NotificationPermissionState };

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
  const [permission, setPermission] = useState<NotificationPermissionState>(() =>
    typeof window === "undefined" || notificationsSupported() ? "default" : "unsupported",
  );
  const lastNotifiedAtRef = useRef(0);

  // The real state has to be read asynchronously on native (it's a bridge
  // call), so the initial value above is only a placeholder until this lands.
  useEffect(() => {
    let cancelled = false;
    void currentPermission().then((state) => {
      if (!cancelled) setPermission(state);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    const result = await requestNotificationPermission();
    setPermission(result);
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
            void notifyNow({
              id: NOTIFICATION_IDS.garbageTruck,
              title: "垃圾車即將抵達",
              body: `距離你設定的倒垃圾點剩餘約 ${Math.round(nearestMeters)} 公尺！`,
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
