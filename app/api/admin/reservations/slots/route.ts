import { NextRequest, NextResponse } from "next/server";
import { createSlot, listSlotsForPlace } from "@/lib/reservations";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId");
  if (!placeId) return NextResponse.json({ error: "placeId 為必填" }, { status: 400 });
  const slots = await listSlotsForPlace(placeId);
  return NextResponse.json({ slots });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { placeId, title, imageSrc, date, time, capacity, note } = body;
  if (typeof placeId !== "string" || !placeId.trim()) {
    return NextResponse.json({ error: "placeId 為必填" }, { status: 400 });
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date 格式須為 YYYY-MM-DD" }, { status: 400 });
  }
  if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "time 格式須為 HH:mm" }, { status: 400 });
  }
  if (typeof capacity !== "number" || !Number.isInteger(capacity) || capacity < 1) {
    return NextResponse.json({ error: "capacity 須為正整數" }, { status: 400 });
  }

  const slot = await createSlot({
    placeId,
    title: typeof title === "string" && title.trim() ? title.trim() : undefined,
    imageSrc: typeof imageSrc === "string" && imageSrc.trim() ? imageSrc.trim() : undefined,
    date,
    time,
    capacity,
    note: typeof note === "string" && note.trim() ? note.trim() : undefined,
  });
  return NextResponse.json({ ok: true, slot });
}
