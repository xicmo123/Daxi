"use client";

// navigator.geolocation.getCurrentPosition works fine in a plain browser,
// but inside the Capacitor-wrapped app it needs to go through the native
// bridge (@capacitor/geolocation) — Android's WebView does not reliably
// surface the JS Geolocation API's permission prompt on its own. This
// wraps both paths behind the same callback shape the map components
// already use, so call sites don't need to branch.
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export type GeoPosition = { coords: { latitude: number; longitude: number } };
export type GeoError = { code: number; PERMISSION_DENIED: 1; POSITION_UNAVAILABLE: 2; TIMEOUT: 3 };

const ERROR_CODES = { PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as const;

function nativeError(err: unknown): GeoError {
  const message = err && typeof err === "object" && "message" in err ? String((err as { message?: unknown }).message) : "";
  const denied = /denied|permission/i.test(message);
  return { code: denied ? ERROR_CODES.PERMISSION_DENIED : ERROR_CODES.POSITION_UNAVAILABLE, ...ERROR_CODES };
}

export function getCurrentPosition(
  onSuccess: (position: GeoPosition) => void,
  onError: (error: GeoError) => void,
  options?: { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number },
): void {
  if (Capacitor.isNativePlatform()) {
    Geolocation.getCurrentPosition({
      enableHighAccuracy: options?.enableHighAccuracy,
      timeout: options?.timeout,
    })
      .then((pos) => onSuccess({ coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } }))
      .catch((err) => onError(nativeError(err)));
    return;
  }

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError({ code: ERROR_CODES.POSITION_UNAVAILABLE, ...ERROR_CODES });
    return;
  }
  navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}
