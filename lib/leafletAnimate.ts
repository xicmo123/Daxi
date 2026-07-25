import type { Marker } from "leaflet";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Leaflet has no built-in tween for marker.setLatLng, so a route-vehicle
// update would otherwise jump instantly to the new GPS fix. This rAF loop
// interpolates between the last known point and the new one instead.
export function animateMarkerTo(marker: Marker, to: [number, number], durationMs = 900) {
  const from = marker.getLatLng();
  const start = performance.now();

  if (Math.abs(from.lat - to[0]) < 1e-7 && Math.abs(from.lng - to[1]) < 1e-7) return;

  function step(now: number) {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = easeOutCubic(t);
    marker.setLatLng([from.lat + (to[0] - from.lat) * eased, from.lng + (to[1] - from.lng) * eased]);
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
