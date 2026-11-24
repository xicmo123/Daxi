import { getCachedGarbageSchedule } from "./cachedSources";
import type { HomeStop } from "./residentHome";

/** Every garbage-truck stop, flattened for the 我家 stop picker. */
export async function loadHomeStops(): Promise<HomeStop[]> {
  const schedule = await getCachedGarbageSchedule().catch(() => []);
  return schedule.flatMap((route) =>
    route.stops.map((s) => ({
      routeId: route.id,
      routeLabel: `${route.name}・${route.displayName}`,
      seq: s.seq,
      name: s.name,
      time: s.time,
      lat: s.lat,
      lng: s.lng,
    })),
  );
}
