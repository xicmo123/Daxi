import { NextRequest, NextResponse } from "next/server";
import { appendClickEvent } from "@/lib/tracking";
import type { TrackedItemType } from "@/lib/trackClient";

const VALID_TYPES: TrackedItemType[] = ["spot", "business", "coupon", "map_card"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const type = body?.type;
  const id = typeof body?.id === "string" ? body.id : "";
  const label = typeof body?.label === "string" ? body.label : "";
  const mode = typeof body?.mode === "string" ? body.mode : undefined;

  if (!VALID_TYPES.includes(type) || !id) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await appendClickEvent({ type, id, label, mode });
  return NextResponse.json({ ok: true });
}
