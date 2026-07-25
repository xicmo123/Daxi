import { NextResponse } from "next/server";
import { fetchNearbyBuses } from "@/lib/busPositions";

export async function GET() {
  try {
    const buses = await fetchNearbyBuses();
    return NextResponse.json({ buses, updatedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load bus positions.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
