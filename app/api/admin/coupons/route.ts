import { NextResponse } from "next/server";
import { readCoupons } from "@/lib/coupons";
import { getAllPlaces } from "@/lib/placesStore";

// Admin-wide coupon oversight — merchants otherwise self-publish with no
// city-side visibility into what's live. Joins in business name since the
// merchant dashboard only ever sees its own placeId.
export async function GET() {
  const [coupons, places] = await Promise.all([readCoupons(), getAllPlaces()]);
  const nameByPlaceId = new Map(places.map((p) => [p.placeId, p.name]));
  const rows = coupons
    .map((c) => ({ ...c, businessName: nameByPlaceId.get(c.placeId) ?? "（找不到商家）" }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ coupons: rows });
}
