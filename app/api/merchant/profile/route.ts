import { NextRequest, NextResponse } from "next/server";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchantAuth";
import { readDetails, saveDetail } from "@/lib/placesStore";

export async function POST(request: NextRequest) {
  const session = await verifyMerchantSession(request.cookies.get(MERCHANT_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const hours = typeof body?.hours === "string" ? body.hours.trim().slice(0, 200) : "";

  const details = await readDetails();
  const existing = details[session.placeId] ?? {};
  await saveDetail(session.placeId, { ...existing, hours });

  return NextResponse.json({ ok: true });
}
