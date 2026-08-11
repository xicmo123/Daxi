// Curated walking routes for the tourist map's "主題路線" filter. Distances/
// times are rough estimates, not derived from a routing engine — good enough
// for a "roughly how long will this take" label, not turn-by-turn nav.
// File-backed (data/walking-routes.json), editable from /admin/routes.
import { dataPath, mutateJsonList, readJsonFile } from "./jsonStore";

const DATA_PATH = dataPath("walking-routes.json");

export type RouteStop = {
  name: string;
  lat: number;
  lng: number;
};

export type WalkingRoute = {
  id: string;
  name: string;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  stops: RouteStop[];
  isWheelchairFriendly: boolean;
};

export type WalkingRouteInput = {
  name: string;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  stops: RouteStop[];
  isWheelchairFriendly: boolean;
};

export async function readWalkingRoutes(): Promise<WalkingRoute[]> {
  const data = await readJsonFile<unknown>(DATA_PATH, []);
  return Array.isArray(data) ? (data as WalkingRoute[]) : [];
}

export async function getWalkingRoute(id: string): Promise<WalkingRoute | null> {
  const routes = await readWalkingRoutes();
  return routes.find((r) => r.id === id) ?? null;
}

export async function createWalkingRoute(input: WalkingRouteInput): Promise<WalkingRoute> {
  return mutateJsonList<WalkingRoute, WalkingRoute>(DATA_PATH, (routes) => {
    const route: WalkingRoute = { ...input, id: `route-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
    return { next: [...routes, route], result: route };
  });
}

export async function updateWalkingRoute(id: string, input: WalkingRouteInput): Promise<WalkingRoute | null> {
  return mutateJsonList<WalkingRoute, WalkingRoute | null>(DATA_PATH, (routes) => {
    const idx = routes.findIndex((r) => r.id === id);
    if (idx === -1) return { next: routes, result: null };
    const updated = { ...routes[idx], ...input };
    const next = [...routes];
    next[idx] = updated;
    return { next, result: updated };
  });
}

export async function deleteWalkingRoute(id: string): Promise<boolean> {
  return mutateJsonList<WalkingRoute, boolean>(DATA_PATH, (routes) => {
    const next = routes.filter((r) => r.id !== id);
    return { next, result: next.length !== routes.length };
  });
}

export function accessibleRoutes(routes: WalkingRoute[]): WalkingRoute[] {
  return routes.filter((r) => r.isWheelchairFriendly);
}
