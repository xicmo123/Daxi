// Fire-and-forget click tracking beacon — never awaited, never blocks the
// UI it's called from. See lib/tracking.ts for the server-side append.
export type TrackedItemType = "spot" | "business" | "coupon" | "map_card";

export function trackClick(type: TrackedItemType, id: string, label: string, mode?: string) {
  try {
    const body = JSON.stringify({ type, id, label, mode });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Tracking must never break the click it's attached to.
  }
}
