import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyBuses } from "@/lib/busPositions";

export async function GET(request: NextRequest) {
  try {
    const lat = Number(request.nextUrl.searchParams.get("lat"));
    const lng = Number(request.nextUrl.searchParams.get("lng"));
    const center = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;
    const buses = await fetchNearbyBuses(center);
    return NextResponse.json({ buses, updatedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load bus positions.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
