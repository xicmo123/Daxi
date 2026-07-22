import { NextRequest, NextResponse } from "next/server";
import { createCustomPlace, saveDetail } from "@/lib/placesStore";
import type { BusinessTag } from "@/lib/businesses";
import type { PlaceContact } from "@/lib/placeDetails";

const VALID_TAGS: BusinessTag[] = ["美食", "景點", "市集"];

function parseContact(input: unknown): PlaceContact | undefined {
  if (!input || typeof input !== "object") return undefined;
  const { phone, facebook, instagram, website } = input as Record<string, unknown>;
  const contact: PlaceContact = {
    phone: typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
    facebook: typeof facebook === "string" && facebook.trim() ? facebook.trim() : undefined,
    instagram: typeof instagram === "string" && instagram.trim() ? instagram.trim() : undefined,
    website: typeof website === "string" && website.trim() ? website.trim() : undefined,
  };
  return Object.values(contact).some(Boolean) ? contact : undefined;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { name, address, tag, lat, lng, category, story, tags, contact } = body;
  const parsedContact = parseContact(contact);

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name 為必填" }, { status: 400 });
  }
  if (!VALID_TAGS.includes(tag)) {
    return NextResponse.json({ error: "tag 必須是 美食/景點/市集" }, { status: 400 });
  }
  if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat/lng 必須是數字" }, { status: 400 });
  }

  const record = await createCustomPlace({
    name: name.trim(),
    address: typeof address === "string" && address.trim() ? address.trim() : null,
    tag,
    lat,
    lng,
  });

  if (category || story || (Array.isArray(tags) && tags.length > 0) || parsedContact) {
    await saveDetail(record.placeId, {
      category: typeof category === "string" && category.trim() ? category.trim() : undefined,
      story: typeof story === "string" && story.trim() ? story.trim() : undefined,
      tags: Array.isArray(tags) ? tags.filter((t) => typeof t === "string" && t.trim()) : undefined,
      contact: parsedContact,
    });
  }

  return NextResponse.json({ ok: true, placeId: record.placeId });
}
