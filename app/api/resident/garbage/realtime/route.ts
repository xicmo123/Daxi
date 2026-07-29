import { NextRequest, NextResponse } from "next/server";
import { fetchDaxiGarbageAllRealtime, fetchDaxiGarbageRealtime } from "@/lib/taoyuanGarbage";

export async function GET(request: NextRequest) {
  const routeId = request.nextUrl.searchParams.get("routeId");
  if (!routeId) {
    try {
      const realtime = await fetchDaxiGarbageAllRealtime();
      return NextResponse.json(realtime);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load garbage truck location.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  if (!routeId.startsWith("lagi2-007_")) {
    return NextResponse.json({ error: "Invalid Daxi garbage route." }, { status: 400 });
  }

  try {
    const realtime = await fetchDaxiGarbageRealtime(routeId);
    return NextResponse.json(realtime);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load garbage truck location.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
