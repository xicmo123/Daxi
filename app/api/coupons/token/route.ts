import { NextRequest, NextResponse } from "next/server";
import { generateRedemptionToken, readCoupons } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const couponId = typeof body?.couponId === "string" ? body.couponId : "";
  if (!couponId) return NextResponse.json({ error: "缺少 couponId" }, { status: 400 });

  const coupons = await readCoupons();
  const coupon = coupons.find((c) => c.id === couponId && c.active);
  if (!coupon) return NextResponse.json({ error: "優惠券不存在或已下架" }, { status: 404 });

  const { token, issuedAt, expiresAt } = await generateRedemptionToken(couponId);
  return NextResponse.json({ token, issuedAt, expiresAt });
}
