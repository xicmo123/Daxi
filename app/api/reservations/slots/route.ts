import { NextRequest, NextResponse } from "next/server";
import { listSlotsForPlace } from "@/lib/reservations";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId");
  if (!placeId) return NextResponse.json({ error: "placeId 為必填" }, { status: 400 });
  const slots = await listSlotsForPlace(placeId, { upcomingOnly: true });
  return NextResponse.json({ slots });
}
