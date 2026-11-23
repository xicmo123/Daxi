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

  // The QR contains the anonymous claim identifier so the merchant device can
  // validate it without receiving the customer's cookie.
  const claimId = typeof body?.claimId === "string" ? body.claimId : "";
  if (!/^[0-9a-f-]{36}$/i.test(claimId)) return NextResponse.json({ ok: false, error: "核銷碼格式錯誤，請顧客重新開啟優惠券" }, { status: 400 });

  const coupons = await readCoupons();
  const coupon = coupons.find((c) => c.id === couponId);
  if (!coupon || coupon.placeId !== session.placeId) {
    return NextResponse.json({ ok: false, error: "只能核銷自己店家的優惠券" }, { status: 403 });
  }

  const result = await redeemCoupon(couponId, token, claimId);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
