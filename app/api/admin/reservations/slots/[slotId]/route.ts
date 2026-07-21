import { NextRequest, NextResponse } from "next/server";
import { deleteSlot } from "@/lib/reservations";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ slotId: string }> }) {
  const { slotId } = await params;
  const result = await deleteSlot(slotId);
  if (result === "not_found") return NextResponse.json({ error: "找不到這個時段" }, { status: 404 });
  if (result === "has_bookings") {
    return NextResponse.json({ error: "此時段已有預約，請先取消相關預約再刪除" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
