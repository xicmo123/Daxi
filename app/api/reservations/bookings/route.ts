import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/reservations";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { placeId, slotId, name, phone, partySize, note } = body;
  if (typeof placeId !== "string" || !placeId.trim()) {
    return NextResponse.json({ error: "placeId 為必填" }, { status: 400 });
  }
  if (typeof slotId !== "string" || !slotId.trim()) {
    return NextResponse.json({ error: "slotId 為必填" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "請填寫姓名" }, { status: 400 });
  }
  if (typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "請填寫聯絡電話" }, { status: 400 });
  }
  if (typeof partySize !== "number" || !Number.isInteger(partySize) || partySize < 1) {
    return NextResponse.json({ error: "人數須為正整數" }, { status: 400 });
  }

  const result = await createBooking({
    placeId,
    slotId,
    name: name.trim(),
    phone: phone.trim(),
    partySize,
    note: typeof note === "string" && note.trim() ? note.trim() : undefined,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ ok: true, booking: result.booking });
}
