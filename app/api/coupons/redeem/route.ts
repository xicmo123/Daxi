import { NextRequest, NextResponse } from "next/server";
import { readCoupons, redeemCoupon } from "@/lib/coupons";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchantAuth";

export async function POST(request: NextRequest) {
  const session = await verifyMerchantSession(request.cookies.get(MERCHANT_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "請先登入商家後台再核銷" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const couponId = typeof body?.couponId === "string" ? body.couponId : "";
  const token = typeof body?.token === "string" ? body.token : "";
  if (!couponId || !token) return NextResponse.json({ ok: false, error: "缺少必要參數" }, { status: 400 });

  const coupons = await readCoupons();
  const coupon = coupons.find((c) => c.id === couponId);
  if (!coupon || coupon.placeId !== session.placeId) {
    return NextResponse.json({ ok: false, error: "只能核銷自己店家的優惠券" }, { status: 403 });
  }

  const result = await redeemCoupon(couponId, token);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
