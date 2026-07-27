import { NextRequest, NextResponse } from "next/server";
import type { AmenityCategory } from "@/lib/amenities";
import { createAmenity, readAmenities } from "@/lib/amenitiesStore";

const VALID_CATEGORIES: AmenityCategory[] = ["公廁", "飲水機"];

export async function GET() {
  const amenities = await readAmenities();
  return NextResponse.json({ amenities });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { name, category, lat, lng, note } = body;
  if (typeof name !== "string" || !name.trim()) return NextResponse.json({ error: "name 為必填" }, { status: 400 });
  if (!VALID_CATEGORIES.includes(category)) return NextResponse.json({ error: "category 須為 公廁/飲水機" }, { status: 400 });
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return NextResponse.json({ error: "lat/lng 需為數字" }, { status: 400 });

  const amenity = await createAmenity({
    name: name.trim(),
    category,
    lat: latNum,
    lng: lngNum,
    note: typeof note === "string" && note.trim() ? note.trim() : undefined,
  });
  return NextResponse.json({ ok: true, amenity });
}
