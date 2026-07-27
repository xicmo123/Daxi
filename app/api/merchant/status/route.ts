import { NextRequest, NextResponse } from "next/server";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchantAuth";
import { readDetails, saveDetail } from "@/lib/placesStore";
import type { PlaceDetail } from "@/lib/placeDetails";

const QUEUE_STATUSES = ["免排隊", "排隊中", "號碼牌發放完畢"] as const;
type QueueStatus = (typeof QUEUE_STATUSES)[number];

function isQueueStatus(value: unknown): value is QueueStatus {
  return typeof value === "string" && (QUEUE_STATUSES as readonly string[]).includes(value);
}

// Shared by POST (existing convention for every other /api/merchant/* route)
// and PATCH (what a caller updating just this resource would expect) — both
// take the merchant dashboard's full current toggle state, not a partial
// patch, matching how the dashboard already sends queueMinutes/soldOut together.
async function updateStatus(request: NextRequest) {
  const session = await verifyMerchantSession(request.cookies.get(MERCHANT_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const queueMinutesRaw = body?.queueMinutes;
  const queueMinutes =
    typeof queueMinutesRaw === "number" && Number.isFinite(queueMinutesRaw) && queueMinutesRaw > 0
      ? Math.min(180, Math.round(queueMinutesRaw))
      : undefined;
  const soldOut = Boolean(body?.soldOut);
  const queueStatus = isQueueStatus(body?.queueStatus) ? body.queueStatus : undefined;
  const acceptsLuggage = Boolean(body?.acceptsLuggage);

  const details = await readDetails();
  const existing = details[session.placeId] ?? {};
  const next: PlaceDetail = {
    ...existing,
    liveStatus:
      queueMinutes || soldOut || queueStatus
        ? { queueMinutes, soldOut, queueStatus, updatedAt: Date.now() }
        : undefined,
    acceptsLuggage,
  };
  await saveDetail(session.placeId, next);

  return NextResponse.json({ ok: true });
}

export const POST = updateStatus;
export const PATCH = updateStatus;
