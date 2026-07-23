import { NextRequest, NextResponse } from "next/server";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchantAuth";
import { getCouponsForPlace, upsertCoupon, type Coupon } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  const session = await verifyMerchantSession(request.cookies.get(MERCHANT_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 60) : "";
  const desc = typeof body?.desc === "string" ? body.desc.trim().slice(0, 200) : "";
  const validUntil = typeof body?.validUntil === "string" ? body.validUntil : "";
  const active = Boolean(body?.active);
  const couponId = typeof body?.couponId === "string" ? body.couponId : "";

  if (!title || !desc || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) {
    return NextResponse.json({ error: "請完整填寫優惠標題、內容與到期日" }, { status: 400 });
  }

  const own = await getCouponsForPlace(session.placeId);
  const existing = couponId ? own.find((c) => c.id === couponId) : undefined;
  if (couponId && !existing) {
    return NextResponse.json({ error: "找不到這張優惠券" }, { status: 404 });
  }

  const coupon: Coupon = {
    id: existing?.id ?? `cp-${session.placeId.slice(-6)}-${Date.now().toString(36)}`,
    placeId: session.placeId,
    title,
    desc,
    redeemMethod: "scan",
    validUntil,
    active,
    updatedAt: new Date().toISOString(),
  };
  await upsertCoupon(coupon);

  return NextResponse.json({ ok: true, coupon });
}
