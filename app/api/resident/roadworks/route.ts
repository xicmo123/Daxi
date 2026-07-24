import { NextResponse } from "next/server";
import { fetchDaxiRoadworks } from "@/lib/taoyuanRoadworks";

export async function GET() {
  try {
    const roadworks = await fetchDaxiRoadworks();
    const syncedAt = new Date().toISOString();
    return NextResponse.json({ roadworks, syncedAt, updatedAt: syncedAt, refreshIntervalMs: 10 * 60 * 1000 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load roadworks.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
