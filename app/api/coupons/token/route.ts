import { NextRequest, NextResponse } from "next/server";
import { generateRedemptionToken, isCouponRedeemable, readCoupons } from "@/lib/coupons";

const CLAIM_COOKIE = "daxi-coupon-claim";
const CLAIM_ID_PATTERN = /^[0-9a-f-]{36}$/i;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const couponId = typeof body?.couponId === "string" ? body.couponId : "";
  if (!couponId) return NextResponse.json({ error: "缺少 couponId" }, { status: 400 });

  const coupons = await readCoupons();
  const coupon = coupons.find((c) => c.id === couponId);
  if (!coupon || !isCouponRedeemable(coupon)) return NextResponse.json({ error: "優惠券已過期、下架或不存在" }, { status: 404 });

  const existingClaimId = request.cookies.get(CLAIM_COOKIE)?.value;
  const claimId = existingClaimId && CLAIM_ID_PATTERN.test(existingClaimId) ? existingClaimId : crypto.randomUUID();
  const { token, issuedAt, expiresAt } = await generateRedemptionToken(couponId, claimId);
  const response = NextResponse.json({ token, claimId, issuedAt, expiresAt });
  if (claimId !== existingClaimId) {
    response.cookies.set(CLAIM_COOKIE, claimId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}
