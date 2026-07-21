import { NextRequest, NextResponse } from "next/server";
import { saveDetail, updateCustomPlace, deleteCustomPlace, isCustomPlaceId } from "@/lib/placesStore";
import type { BusinessTag } from "@/lib/businesses";

const VALID_TAGS: BusinessTag[] = ["美食", "景點", "市集"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { name, address, tag, lat, lng, category, story, tags } = body;

  await saveDetail(placeId, {
    category: typeof category === "string" && category.trim() ? category.trim() : undefined,
    story: typeof story === "string" && story.trim() ? story.trim() : undefined,
    tags: Array.isArray(tags) ? tags.filter((t) => typeof t === "string" && t.trim()) : undefined,
  });

  if (isCustomPlaceId(placeId)) {
    const update: Record<string, unknown> = {};
    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof address === "string") update.address = address.trim() || null;
    if (typeof tag === "string" && VALID_TAGS.includes(tag as BusinessTag)) update.tag = tag;
    if (typeof lat === "number" && !Number.isNaN(lat)) update.lat = lat;
    if (typeof lng === "number" && !Number.isNaN(lng)) update.lng = lng;
    if (Object.keys(update).length > 0) {
      const result = await updateCustomPlace(placeId, update);
      if (!result) return NextResponse.json({ error: "找不到這個自訂項目" }, { status: 404 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  if (!isCustomPlaceId(placeId)) {
    return NextResponse.json({ error: "只能刪除自訂項目，Google 商家資料由每週排程管理" }, { status: 400 });
  }
  const ok = await deleteCustomPlace(placeId);
  if (!ok) return NextResponse.json({ error: "找不到這個自訂項目" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
