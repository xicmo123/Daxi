import { NextRequest, NextResponse } from "next/server";
import { moveResidentSlide } from "@/lib/residentCarousel";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slideId: string }> }) {
  const { slideId } = await params;
  const body = await request.json().catch(() => null);
  const direction = body?.direction;
  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "direction 須為 up/down" }, { status: 400 });
  }
  const ok = await moveResidentSlide(slideId, direction);
  if (!ok) return NextResponse.json({ error: "無法移動（已在邊界或找不到項目）" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
