import { NextResponse } from "next/server";
import { searchBusRoutes } from "@/lib/tdxBusRoutes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ routes: [] });

  try {
    const routes = await searchBusRoutes(q);
    return NextResponse.json({ routes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to search bus routes.";
    return NextResponse.json({ error: message, routes: [] }, { status: 502 });
  }
}
