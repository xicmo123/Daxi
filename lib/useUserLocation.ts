"use client";

import { useEffect, useState } from "react";
import { getCurrentPosition } from "@/lib/geolocation";

export type UserLocation = { lat: number; lng: number };

let currentLocation: UserLocation | null = null;
let requestStarted = false;
const listeners = new Set<(location: UserLocation) => void>();

function requestLocation() {
  if (requestStarted || currentLocation) return;
  requestStarted = true;
  getCurrentPosition(
    (position) => {
      currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
      listeners.forEach((listener) => listener(currentLocation!));
    },
    () => undefined,
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
  );
}

export function useUserLocation(): UserLocation | null {
  const [location, setLocation] = useState<UserLocation | null>(() => currentLocation);

  useEffect(() => {
    listeners.add(setLocation);
    requestLocation();
    return () => {
      listeners.delete(setLocation);
    };
  }, []);

  return location;
}
