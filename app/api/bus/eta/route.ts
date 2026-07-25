import { NextResponse } from "next/server";
import { fetchRouteEta } from "@/lib/tdxBusRoutes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const route = searchParams.get("route") ?? "";
  const directionParam = searchParams.get("direction");
  const direction = directionParam !== null && directionParam !== "" ? Number(directionParam) : undefined;
  if (!route.trim()) return NextResponse.json({ stops: [] });

  try {
    const stops = await fetchRouteEta(route, direction);
    return NextResponse.json({ stops });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load bus schedule.";
    return NextResponse.json({ error: message, stops: [] }, { status: 502 });
  }
}
