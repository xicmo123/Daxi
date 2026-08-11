// Fire-and-forget telemetry beacons — never awaited, never block the UI they
// are called from, and every failure is swallowed. See lib/telemetry.ts for
// the server-side append.
export type TrackedItemType = "spot" | "business" | "coupon" | "map_card";

const ENDPOINT = "/api/track";

function send(body: unknown): void {
  try {
    const payload = JSON.stringify(body);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Telemetry must never break the interaction it's attached to.
  }
}

export function trackClick(type: TrackedItemType, id: string, label: string, mode?: string) {
  send({ kind: "click", type, id, label, mode });
}

/** Feature-level usage, so the dashboard can answer "does anyone open this?". */
export function trackView(path: string, label: string) {
  send({ kind: "view", type: "page_view", id: path, label });
}

export function reportClientError(input: {
  message: string;
  source: "render" | "window" | "unhandledrejection";
  stack?: string;
  path?: string;
}) {
  send({
    kind: "error",
    ...input,
    // Truncated: a full React stack can be tens of KB and sendBeacon has a
    // per-payload cap, so an oversized report would be dropped entirely.
    stack: input.stack?.slice(0, 4000),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
  });
}
