import { NextResponse } from "next/server";
import { fetchDaxiGarbageRoutes } from "@/lib/taoyuanGarbage";

export async function GET() {
  try {
    const routes = await fetchDaxiGarbageRoutes();
    return NextResponse.json({ routes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load garbage routes.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
