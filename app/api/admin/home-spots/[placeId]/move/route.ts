import { NextRequest, NextResponse } from "next/server";
import { moveHomeSpot, setHomeSpotPosition } from "@/lib/homeSpotOrder";
import { filterVisiblePlaces, getAllPlaces, readDetails } from "@/lib/placesStore";

export async function POST(request: NextRequest, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const body = await request.json().catch(() => null);
  const direction = body?.direction;
  const position = body?.position;
  if (direction !== "up" && direction !== "down" && position !== undefined) {
    if (!Number.isInteger(position)) {
      return NextResponse.json({ error: "position must be an integer" }, { status: 400 });
    }
  } else if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "direction or position is required" }, { status: 400 });
  }

  const [places, details] = await Promise.all([getAllPlaces(), readDetails()]);
  const placeIds = filterVisiblePlaces(places, details)
    .filter((place) => place.tag === "景點")
    .map((place) => place.placeId);
  const ok = position !== undefined
    ? await setHomeSpotPosition(placeId, position, placeIds)
    : await moveHomeSpot(placeId, direction, placeIds);
  if (!ok) return NextResponse.json({ error: "無法移動這個景點" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
