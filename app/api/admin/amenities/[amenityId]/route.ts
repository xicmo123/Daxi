import { NextRequest, NextResponse } from "next/server";
import type { AmenityCategory } from "@/lib/amenities";
import { deleteAmenity, updateAmenity } from "@/lib/amenitiesStore";

const VALID_CATEGORIES: AmenityCategory[] = ["公廁", "飲水機"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ amenityId: string }> }) {
  const { amenityId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { name, category, lat, lng, note } = body;
  if (typeof name !== "string" || !name.trim()) return NextResponse.json({ error: "name 為必填" }, { status: 400 });
  if (!VALID_CATEGORIES.includes(category)) return NextResponse.json({ error: "category 須為 公廁/飲水機" }, { status: 400 });
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return NextResponse.json({ error: "lat/lng 需為數字" }, { status: 400 });

  const amenity = await updateAmenity(amenityId, {
    name: name.trim(),
    category,
    lat: latNum,
    lng: lngNum,
    note: typeof note === "string" && note.trim() ? note.trim() : undefined,
  });
  if (!amenity) return NextResponse.json({ error: "找不到這個設施" }, { status: 404 });
  return NextResponse.json({ ok: true, amenity });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ amenityId: string }> }) {
  const { amenityId } = await params;
  const ok = await deleteAmenity(amenityId);
  if (!ok) return NextResponse.json({ error: "找不到這個設施" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
