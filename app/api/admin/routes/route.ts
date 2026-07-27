import { NextRequest, NextResponse } from "next/server";
import { createWalkingRoute, readWalkingRoutes, type RouteStop } from "@/lib/routesData";

function parseStops(value: unknown): RouteStop[] | null {
  if (!Array.isArray(value)) return null;
  const stops: RouteStop[] = [];
  for (const raw of value) {
    const s = raw as Record<string, unknown>;
    const name = typeof s?.name === "string" ? s.name.trim() : "";
    const lat = Number(s?.lat);
    const lng = Number(s?.lng);
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    stops.push({ name, lat, lng });
  }
  return stops;
}

export async function GET() {
  const routes = await readWalkingRoutes();
  return NextResponse.json({ routes });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { name, totalDistanceMeters, estimatedMinutes, isWheelchairFriendly, stops } = body;
  if (typeof name !== "string" || !name.trim()) return NextResponse.json({ error: "name 為必填" }, { status: 400 });
  const distance = Number(totalDistanceMeters);
  const minutes = Number(estimatedMinutes);
  if (!Number.isFinite(distance) || distance <= 0) return NextResponse.json({ error: "totalDistanceMeters 需為正數" }, { status: 400 });
  if (!Number.isFinite(minutes) || minutes <= 0) return NextResponse.json({ error: "estimatedMinutes 需為正數" }, { status: 400 });
  const parsedStops = parseStops(stops);
  if (!parsedStops || parsedStops.length < 2) {
    return NextResponse.json({ error: "至少需要 2 個有效站點（含名稱、緯度、經度）" }, { status: 400 });
  }

  const route = await createWalkingRoute({
    name: name.trim(),
    totalDistanceMeters: distance,
    estimatedMinutes: minutes,
    isWheelchairFriendly: isWheelchairFriendly === true,
    stops: parsedStops,
  });
  return NextResponse.json({ ok: true, route });
}
