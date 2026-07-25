import { NextRequest, NextResponse } from "next/server";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchantAuth";
import { readDetails, saveDetail } from "@/lib/placesStore";

export async function POST(request: NextRequest) {
  const session = await verifyMerchantSession(request.cookies.get(MERCHANT_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const queueMinutesRaw = body?.queueMinutes;
  const queueMinutes =
    typeof queueMinutesRaw === "number" && Number.isFinite(queueMinutesRaw) && queueMinutesRaw > 0
      ? Math.min(180, Math.round(queueMinutesRaw))
      : undefined;
  const soldOut = Boolean(body?.soldOut);

  const details = await readDetails();
  const existing = details[session.placeId] ?? {};
  await saveDetail(session.placeId, {
    ...existing,
    liveStatus: queueMinutes || soldOut ? { queueMinutes, soldOut, updatedAt: Date.now() } : undefined,
  });

  return NextResponse.json({ ok: true });
}
