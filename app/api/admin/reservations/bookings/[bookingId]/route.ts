import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus, type BookingStatus } from "@/lib/reservations";

const VALID_STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as BookingStatus)) {
    return NextResponse.json({ error: "status 須為 pending/confirmed/cancelled" }, { status: 400 });
  }
  const booking = await updateBookingStatus(bookingId, status as BookingStatus);
  if (!booking) return NextResponse.json({ error: "找不到這筆預約" }, { status: 404 });
  return NextResponse.json({ ok: true, booking });
}
