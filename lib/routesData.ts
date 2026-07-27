// Curated walking routes for the tourist map's "主題路線" filter. Distances/
// times are rough estimates, not derived from a routing engine — good enough
// for a "roughly how long will this take" label, not turn-by-turn nav.
// File-backed (data/walking-routes.json), editable from /admin/routes.
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "walking-routes.json");

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

async function readJson<T>(fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(data: unknown) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readWalkingRoutes(): Promise<WalkingRoute[]> {
  const data = await readJson<unknown>([]);
  return Array.isArray(data) ? (data as WalkingRoute[]) : [];
}

export async function getWalkingRoute(id: string): Promise<WalkingRoute | null> {
  const routes = await readWalkingRoutes();
  return routes.find((r) => r.id === id) ?? null;
}

export async function createWalkingRoute(input: WalkingRouteInput): Promise<WalkingRoute> {
  const routes = await readWalkingRoutes();
  const route: WalkingRoute = { ...input, id: `route-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
  routes.push(route);
  await writeJson(routes);
  return route;
}

export async function updateWalkingRoute(id: string, input: WalkingRouteInput): Promise<WalkingRoute | null> {
  const routes = await readWalkingRoutes();
  const idx = routes.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  routes[idx] = { ...routes[idx], ...input };
  await writeJson(routes);
  return routes[idx];
}

export async function deleteWalkingRoute(id: string): Promise<boolean> {
  const routes = await readWalkingRoutes();
  const next = routes.filter((r) => r.id !== id);
  if (next.length === routes.length) return false;
  await writeJson(next);
  return true;
}

export function accessibleRoutes(routes: WalkingRoute[]): WalkingRoute[] {
  return routes.filter((r) => r.isWheelchairFriendly);
}
